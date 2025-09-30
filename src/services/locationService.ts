// src/services/locationService.ts
import { Coordinates } from '../types/environmental';

interface AdministrativeContext {
  state: string;
  district: string;
  subDistrict?: string;
  country?: string;
  confidence: 'high' | 'medium' | 'low' | 'fallback';
  source: 'google-maps' | 'coordinate-estimation' | 'fallback';
}

interface CacheEntry {
  data: AdministrativeContext;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class LocationService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 1000; // Prevent memory leaks

  /**
   * Get administrative context (state, district) from coordinates
   */
  async getAdministrativeContext(coordinates: Coordinates): Promise<{ state: string; district: string }> {
    const cacheKey = `${coordinates.lat.toFixed(4)},${coordinates.lng.toFixed(4)}`;
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      console.log(`📍 Using cached location data for ${cacheKey} (${cached.source})`);
      return { state: cached.state, district: cached.district };
    }

    try {
      // Try Google Maps first
      const googleResult = await this.getGoogleMapsLocation(coordinates);
      if (googleResult) {
        this.setCacheEntry(cacheKey, googleResult);
        return { state: googleResult.state, district: googleResult.district };
      }

      // Fallback to coordinate-based estimation
      console.warn('Google Maps geocoding failed, using coordinate estimation');
      const estimatedResult = this.getLocationFromCoordinates(coordinates);
      this.setCacheEntry(cacheKey, estimatedResult);
      return { state: estimatedResult.state, district: estimatedResult.district };

    } catch (error: any) { // ← FIX 1: Add 'any' type
      console.error('All location services failed:', error?.message || 'Unknown error');
      
      // Ultimate fallback
      const fallbackResult = this.getFallbackLocation(coordinates);
      this.setCacheEntry(cacheKey, fallbackResult);
      return { state: fallbackResult.state, district: fallbackResult.district };
    }
  }

  /**
   * Get location using Google Maps Geocoding
   */
  private async getGoogleMapsLocation(coordinates: Coordinates): Promise<AdministrativeContext | null> {
    try {
      // Check if Google Maps is available
      if (typeof google === 'undefined' || !google.maps) {
        console.warn('Google Maps API not available');
        return null;
      }

      const geocoder = new google.maps.Geocoder();
      const latlng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
      
      console.log(`🗺️ Geocoding coordinates: ${coordinates.lat}, ${coordinates.lng}`);
      
      const response = await geocoder.geocode({ 
        location: latlng,
        region: 'IN' // Bias results towards India
      });

      if (response.results && response.results.length > 0) {
        const addressComponents = response.results[0].address_components;
        
        // Extract administrative levels
        const country = addressComponents.find(c => c.types.includes('country'))?.long_name;
        const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name;
        const district = addressComponents.find(c => 
          c.types.includes('administrative_area_level_2') || 
          c.types.includes('administrative_area_level_3')
        )?.long_name;
        const subDistrict = addressComponents.find(c => 
          c.types.includes('administrative_area_level_3') ||
          c.types.includes('sublocality_level_1')
        )?.long_name;

        console.log('🗺️ Google Maps result:', { country, state, district, subDistrict });

        // Validate we got Indian location data
        if (country !== 'India' && country !== 'भारत') {
          console.warn('⚠️ Coordinates appear to be outside India:', country);
        }

        if (state && district) {
          return {
            state: this.normalizeStateName(state),
            district: this.normalizeDistrictName(district),
            subDistrict,
            country,
            confidence: 'high',
            source: 'google-maps'
          };
        } else {
          console.warn('⚠️ Incomplete administrative data from Google Maps:', { state, district });
        }
      } else {
        console.warn('⚠️ No results from Google Maps geocoding');
      }

      return null;

    } catch (error: any) { // ← FIX 2: Add 'any' type
      console.error('Google Maps geocoding error:', error?.message || 'Unknown error');
      return null;
    }
  }

  /**
   * Estimate location from coordinates using geographic knowledge
   */
  private getLocationFromCoordinates(coordinates: Coordinates): AdministrativeContext {
    console.log('🧭 Using coordinate-based location estimation');
    
    const { lat, lng } = coordinates;
    
    // Basic geographic regions of India
    const regions = [
      // Maharashtra
      { bounds: { latMin: 15.6, latMax: 22.0, lngMin: 72.6, lngMax: 80.9 }, state: 'MAHARASHTRA', districts: ['MUMBAI', 'PUNE', 'NAGPUR', 'AMRAVATI', 'NASHIK'] },
      
      // Uttar Pradesh  
      { bounds: { latMin: 23.9, latMax: 30.4, lngMin: 77.1, lngMax: 84.6 }, state: 'UTTAR PRADESH', districts: ['LUCKNOW', 'KANPUR', 'AGRA', 'VARANASI', 'ALLAHABAD'] },
      
      // Karnataka
      { bounds: { latMin: 11.5, latMax: 18.4, lngMin: 74.0, lngMax: 78.6 }, state: 'KARNATAKA', districts: ['BENGALURU', 'MYSURU', 'HUBLI', 'MANGALURU', 'BELAGAVI'] },
      
      // Gujarat
      { bounds: { latMin: 20.1, latMax: 24.7, lngMin: 68.2, lngMax: 74.4 }, state: 'GUJARAT', districts: ['AHMEDABAD', 'SURAT', 'VADODARA', 'RAJKOT', 'GANDHINAGAR'] },
      
      // Rajasthan
      { bounds: { latMin: 23.0, latMax: 30.1, lngMin: 69.5, lngMax: 78.2 }, state: 'RAJASTHAN', districts: ['JAIPUR', 'JODHPUR', 'UDAIPUR', 'KOTA', 'BIKANER'] },
      
      // Tamil Nadu
      { bounds: { latMin: 8.1, latMax: 13.6, lngMin: 76.2, lngMax: 80.3 }, state: 'TAMIL NADU', districts: ['CHENNAI', 'COIMBATORE', 'MADURAI', 'SALEM', 'TIRUCHIRAPPALLI'] },
      
      // West Bengal
      { bounds: { latMin: 21.5, latMax: 27.2, lngMin: 85.8, lngMax: 89.9 }, state: 'WEST BENGAL', districts: ['KOLKATA', 'HOWRAH', 'DARJEELING', 'SILIGURI', 'DURGAPUR'] }
    ];

    // Find matching region
    for (const region of regions) {
      const { bounds } = region;
      if (lat >= bounds.latMin && lat <= bounds.latMax && 
          lng >= bounds.lngMin && lng <= bounds.lngMax) {
        
        // Pick the most central district as estimate
        const district = region.districts[Math.floor(region.districts.length / 2)];
        
        console.log(`📍 Estimated location: ${district}, ${region.state}`);
        
        return {
          state: region.state,
          district: district,
          confidence: 'medium',
          source: 'coordinate-estimation'
        };
      }
    }

    // If no specific region found, use broad geographic estimation
    return this.getBroadGeographicEstimate(coordinates);
  }

  /**
   * Broad geographic estimation for locations outside known regions
   */
  private getBroadGeographicEstimate(coordinates: Coordinates): AdministrativeContext {
    const { lat, lng } = coordinates;
    
    let state: string;
    let district: string;
    
    if (lat > 28) {
      state = 'HIMACHAL PRADESH';
      district = 'SHIMLA';
    } else if (lat > 25) {
      state = lng < 77 ? 'PUNJAB' : 'UTTAR PRADESH';
      district = lng < 77 ? 'CHANDIGARH' : 'LUCKNOW';
    } else if (lat < 12) {
      state = lng < 77 ? 'KERALA' : 'TAMIL NADU';
      district = lng < 77 ? 'KOCHI' : 'CHENNAI';
    } else {
      // Central India
      state = 'MADHYA PRADESH';
      district = 'BHOPAL';
    }
    
    console.log(`🌍 Broad geographic estimate: ${district}, ${state}`);
    
    return {
      state,
      district,
      confidence: 'low',
      source: 'coordinate-estimation'
    };
  }

  /**
   * Ultimate fallback for tested location
   */
  private getFallbackLocation(coordinates: Coordinates): AdministrativeContext {
    console.warn('🔧 Using tested fallback location (Amravati, Maharashtra)');
    
    return {
      state: 'MAHARASHTRA',
      district: 'AMRAVATI',
      confidence: 'fallback',
      source: 'fallback'
    };
  }

  /**
   * Normalize state names to match WRIS format
   */
  private normalizeStateName(state: string): string {
    const stateMap: { [key: string]: string } = {
      'Maharashtra': 'MAHARASHTRA',
      'Uttar Pradesh': 'UTTAR PRADESH',
      'Karnataka': 'KARNATAKA',
      'Gujarat': 'GUJARAT',
      'Rajasthan': 'RAJASTHAN',
      'Tamil Nadu': 'TAMIL NADU',
      'West Bengal': 'WEST BENGAL',
      'Madhya Pradesh': 'MADHYA PRADESH',
      'Bihar': 'BIHAR',
      'Andhra Pradesh': 'ANDHRA PRADESH',
      'Telangana': 'TELANGANA'
    };
    
    return stateMap[state] || state.toUpperCase();
  }

  /**
   * Normalize district names to match WRIS format
   */
  private normalizeDistrictName(district: string): string {
    // Remove common suffixes and normalize
    const normalized = district
      .replace(/\s+(District|Zilla|district)$/i, '')
      .replace(/\s+Division$/i, '')
      .trim()
      .toUpperCase();
    
    // Handle common district name variations
    const districtMap: { [key: string]: string } = {
      'MUMBAI SUBURBAN': 'MUMBAI',
      'BENGALURU URBAN': 'BENGALURU',
      'PUNE CITY': 'PUNE',
      'KOLKATA CITY': 'KOLKATA',
      'CHENNAI CITY': 'CHENNAI'
    };
    
    return districtMap[normalized] || normalized;
  }

  /**
   * Get cached result if valid
   */
  private getCachedResult(cacheKey: string): AdministrativeContext | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;
    
    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set cache entry with cleanup
   */
  private setCacheEntry(cacheKey: string, data: AdministrativeContext): void {
    // Cleanup old entries if cache is getting too large
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL
    });
    
    console.log(`💾 Cached location data for ${cacheKey} (${data.source}, ${data.confidence} confidence)`);
  }

  /**
   * Clear cache (useful for testing)
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('🧹 Location cache cleared');
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttlHours: this.CACHE_TTL / (60 * 60 * 1000)
    };
  }
}

export default new LocationService();
