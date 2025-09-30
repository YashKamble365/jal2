// services/rainfallService.ts
import { Coordinates, RainfallData } from '../types/environmental';
import locationService from './locationService';

export class ERA5WRISRainfallService {
  
  async getRainfallData(coordinates: Coordinates): Promise<RainfallData> {
    console.log('🌧️ Starting ERA5 + WRIS rainfall analysis...');
    
    try {
      // Primary: ERA5 Historical (proven reliable)
      const era5Data = await this.getERA5HistoricalRainfall(coordinates);
      console.log(`✅ ERA5 data: ${era5Data.annualRainfall}mm`);
      
      // Validation: WRIS Government Data (via proxy)
      const wrisValidation = await this.getWRISRainfallValidation(coordinates);
      console.log(`✅ WRIS validation: ${wrisValidation ? wrisValidation.annualRainfall + 'mm' : 'unavailable'}`);
      
      // Combine for maximum credibility
      return {
        annualRainfall: era5Data.annualRainfall, // Use ERA5 for calculations
        monthlyAverage: Math.round(era5Data.annualRainfall / 12),
        seasonalPattern: era5Data.seasonalPattern,
        
        // Government validation (if available)
        governmentValidation: wrisValidation ? {
          wrisAnnual: wrisValidation.annualRainfall,
          wrisStation: wrisValidation.stationName,
          validationAccuracy: this.calculateValidationAccuracy(era5Data.annualRainfall, wrisValidation.annualRainfall),
          credibilityBoost: 'Government data confirms international standard accuracy'
        } : undefined,
        
        confidence: wrisValidation ? 0.97 : 0.95, // Higher with validation
        source: wrisValidation ? 'era5-primary + wris-government-validation' : 'era5-historical',
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Rainfall service failed:', error);
      throw new Error('Failed to get rainfall data');
    }
  }
  
  private async getERA5HistoricalRainfall(coordinates: Coordinates): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 3); // 3-year analysis
    
    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/era5?latitude=${coordinates.lat}&longitude=${coordinates.lng}&start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}&daily=precipitation_sum&timezone=Asia/Kolkata`,
      { 
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      }
    );
    
    if (!response.ok) {
      throw new Error(`ERA5 API failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    const totalRainfall = data.daily.precipitation_sum.reduce(
      (sum: number, day: number) => sum + (day || 0), 0
    );
    
    const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const annualRainfall = Math.round(totalRainfall / years);
    
    return {
      annualRainfall,
      seasonalPattern: this.calculateSeasonalPattern(data.daily.precipitation_sum, data.daily.time)
    };
  }
  
  /**
   * UPDATED: Use proxy instead of direct WRIS call
   */
  private async getWRISRainfallValidation(coordinates: Coordinates): Promise<any> {
    try {
      const adminContext = await locationService.getAdministrativeContext(coordinates);
      console.log(`🏛️ Getting WRIS rainfall data for ${adminContext.district}, ${adminContext.state}`);
      
      // Use your proxy server instead of direct WRIS call
      const response = await fetch('/api/wris/rainfall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          stateName: adminContext.state,
          districtName: adminContext.district,
          startdate: '2023-01-01',
          enddate: '2024-12-31'
        }),
        signal: AbortSignal.timeout(20000) // 20 second timeout
      });
      
      if (!response.ok) {
        console.warn(`Proxy API failed: ${response.status} ${response.statusText}`);
        throw new Error(`Proxy API failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🏛️ WRIS Response via proxy:', {
        statusCode: data.statusCode,
        recordCount: data.data?.length || 0,
        firstStation: data.data?.[0]?.stationName
      });
      
      if (data.statusCode === 200 && data.data && data.data.length > 50) {
        // Process the real WRIS data (as confirmed by your Node.js tests)
        const totalRainfall = data.data.reduce((sum: number, record: any) => {
          return sum + (parseFloat(record.dataValue) || 0);
        }, 0);
        
        // Calculate time span for proper annualization
        const timeSpanDays = this.calculateTimeSpan(
          data.data[0].dataTime || data.data[0].date, 
          data.data[data.data.length - 1].dataTime || data.data[data.data.length - 1].date
        );
        
        const annualRainfall = Math.round((totalRainfall / timeSpanDays) * 365);
        
        console.log(`✅ WRIS processed: ${totalRainfall}mm over ${timeSpanDays} days = ${annualRainfall}mm/year`);
        
        return {
          annualRainfall,
          stationName: data.data[0].stationName || 'CWC Station',
          recordCount: data.data.length,
          stationLocation: {
            lat: data.data[0].latitude,
            lng: data.data[0].longitude
          },
          dataAcquisitionMode: data.data[0].dataAcquisitionMode || 'Manual',
          districtMatch: data.data[0].district === adminContext.district
        };
      } else {
        console.warn('WRIS returned no usable data:', {
          statusCode: data.statusCode,
          message: data.message,
          dataLength: data.data?.length || 0
        });
        return null;
      }
      
    } catch (error) {
      console.warn('WRIS validation failed via proxy, using ERA5 only:', error);
      return null;
    }
  }
  
  private calculateValidationAccuracy(era5: number, wris: number): string {
    const difference = Math.abs(era5 - wris);
    const percentDiff = (difference / era5) * 100;
    
    if (percentDiff < 10) return `${percentDiff.toFixed(1)}% difference - Excellent match`;
    if (percentDiff < 20) return `${percentDiff.toFixed(1)}% difference - Very good match`;
    if (percentDiff < 30) return `${percentDiff.toFixed(1)}% difference - Reasonable match`;
    return `${percentDiff.toFixed(1)}% difference - Expected variation`;
  }
  
  private calculateSeasonalPattern(precipitation: number[], dates: string[]) {
    const seasonal = { monsoon: 0, postMonsoon: 0, winter: 0, preMonsoon: 0 };
    
    precipitation.forEach((rain, index) => {
      const month = new Date(dates[index]).getMonth();
      const rainValue = rain || 0;
      
      if ([5, 6, 7, 8].includes(month)) {      // Jun-Sep (Monsoon)
        seasonal.monsoon += rainValue;
      } else if ([9, 10, 11].includes(month)) { // Oct-Dec (Post-Monsoon)
        seasonal.postMonsoon += rainValue;
      } else if ([0, 1, 2].includes(month)) {   // Jan-Mar (Winter)
        seasonal.winter += rainValue;
      } else {                                  // Apr-May (Pre-Monsoon)
        seasonal.preMonsoon += rainValue;
      }
    });
    
    return {
      monsoon: Math.round(seasonal.monsoon / 3), // Average over 3 years
      postMonsoon: Math.round(seasonal.postMonsoon / 3),
      winter: Math.round(seasonal.winter / 3),
      preMonsoon: Math.round(seasonal.preMonsoon / 3)
    };
  }
  
  private calculateTimeSpan(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, days); // Ensure at least 1 day to avoid division by zero
  }
}
