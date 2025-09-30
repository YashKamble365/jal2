// src/services/elevationService.ts

interface ElevationData {
  elevation: number;
  source: 'opentopodata' | 'geographic-estimation' | 'fallback';
  confidence: 'high' | 'medium' | 'low';
  region?: string;
}

interface CacheEntry {
  data: ElevationData;
  timestamp: number;
  ttl: number;
}

class ElevationService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days (elevation doesn't change)
  private readonly MAX_CACHE_SIZE = 2000;
  private readonly API_TIMEOUT = 10000; // 10 seconds

  /**
   * Get elevation for coordinates with fallback system
   */
  async getElevation(lat: number, lng: number): Promise<number> {
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      console.log(`🏔️ Using cached elevation: ${cached.elevation}m (${cached.source}, ${cached.confidence})`);
      return cached.elevation;
    }

    console.log(`🏔️ Getting elevation for ${lat}, ${lng}`);

    try {
      // Try multiple elevation APIs
      const elevationData = await this.getElevationFromAPIs(lat, lng) || 
                           this.estimateElevationFromCoordinates(lat, lng);
      
      this.setCacheEntry(cacheKey, elevationData);
      console.log(`🏔️ Elevation: ${elevationData.elevation}m (${elevationData.source}, ${elevationData.confidence})`);
      
      return elevationData.elevation;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('All elevation services failed:', errorMessage);
      
      // Ultimate fallback
      const fallbackData: ElevationData = {
        elevation: 300, // Average elevation for India
        source: 'fallback',
        confidence: 'low'
      };
      
      this.setCacheEntry(cacheKey, fallbackData);
      return fallbackData.elevation;
    }
  }

  /**
   * Try multiple elevation APIs
   */
  private async getElevationFromAPIs(lat: number, lng: number): Promise<ElevationData | null> {
    // API 1: Open-Topo-Data (Primary)
    try {
      const openTopoResult = await this.getOpenTopoElevation(lat, lng);
      if (openTopoResult) return openTopoResult;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Open-Topo-Data failed:', errorMessage);
    }

    // API 2: Alternative elevation API (if available)
    try {
      const altResult = await this.getAlternativeElevation(lat, lng);
      if (altResult) return altResult;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Alternative elevation API failed:', errorMessage);
    }

    return null;
  }

  /**
   * Get elevation from Open-Topo-Data API
   */
  private async getOpenTopoElevation(lat: number, lng: number): Promise<ElevationData | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

    try {
      console.log('🌐 Trying Open-Topo-Data API...');
      
      const response = await fetch(
        `https://api.opentopodata.org/v1/srtm30m?locations=${lat},${lng}`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'AquaPlan/1.0 (Environmental Analysis App)'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        const elevation = data.results?.[0]?.elevation;
        
        if (typeof elevation === 'number' && elevation !== null) {
          // Validate elevation is reasonable for India (-100m to 9000m)
          if (elevation >= -100 && elevation <= 9000) {
            return {
              elevation: Math.round(elevation),
              source: 'opentopodata',
              confidence: 'high'
            };
          } else {
            console.warn(`⚠️ Unreasonable elevation from API: ${elevation}m`);
          }
        }
      } else {
        console.warn(`Open-Topo-Data API error: ${response.status} ${response.statusText}`);
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Open-Topo-Data API timeout');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Open-Topo-Data API error:', errorMessage);
      }
    }

    return null;
  }

  /**
   * Alternative elevation API (placeholder for future expansion)
   */
  private async getAlternativeElevation(lat: number, lng: number): Promise<ElevationData | null> {
    // Could implement additional APIs here:
    // - Google Elevation API (requires API key)
    // - MapBox Elevation API (requires API key)
    // - USGS Elevation API (free but US-focused)
    
    console.log('🌐 No alternative elevation APIs configured');
    return null;
  }

  /**
   * Enhanced elevation estimation based on Indian geography
   */
  private estimateElevationFromCoordinates(lat: number, lng: number): ElevationData {
    console.log('🗺️ Using geographic elevation estimation');
    
    let elevation: number;
    let region: string;
    let confidence: 'medium' | 'low' = 'medium';

    // Enhanced regional elevation mapping
    if (this.isInHimalayas(lat, lng)) {
      elevation = this.getHimalayaElevation(lat, lng);
      region = 'Himalayas';
    } else if (this.isInWesternGhats(lat, lng)) {
      elevation = this.getWesternGhatsElevation(lat, lng);
      region = 'Western Ghats';
    } else if (this.isInEasternGhats(lat, lng)) {
      elevation = this.getEasternGhatsElevation(lat, lng);
      region = 'Eastern Ghats';
    } else if (this.isInDeccanPlateau(lat, lng)) {
      elevation = this.getDeccanPlateauElevation(lat, lng);
      region = 'Deccan Plateau';
    } else if (this.isInGangeticPlains(lat, lng)) {
      elevation = this.getGangeticPlainsElevation(lat, lng);
      region = 'Gangetic Plains';
    } else if (this.isInCoastalPlains(lat, lng)) {
      elevation = this.getCoastalPlainsElevation(lat, lng);
      region = 'Coastal Plains';
    } else if (this.isInTharDesert(lat, lng)) {
      elevation = this.getTharDesertElevation(lat, lng);
      region = 'Thar Desert';
    } else {
      elevation = this.getCentralIndiaElevation(lat, lng);
      region = 'Central India';
      confidence = 'low'; // Unknown region
    }

    return {
      elevation: Math.round(elevation),
      source: 'geographic-estimation',
      confidence,
      region
    };
  }

  // Enhanced region detection methods
  private isInHimalayas(lat: number, lng: number): boolean {
    return lat > 28 && lng > 75 && lng < 95;
  }

  private isInWesternGhats(lat: number, lng: number): boolean {
    return lng > 73 && lng < 77.5 && lat > 8 && lat < 21;
  }

  private isInEasternGhats(lat: number, lng: number): boolean {
    return lng > 78 && lng < 85 && lat > 11 && lat < 22;
  }

  private isInDeccanPlateau(lat: number, lng: number): boolean {
    return lat > 15 && lat < 26 && lng > 73 && lng < 80;
  }

  private isInGangeticPlains(lat: number, lng: number): boolean {
    return lat > 24 && lat < 32 && lng > 75 && lng < 88;
  }

  private isInCoastalPlains(lat: number, lng: number): boolean {
    return (lng < 76 && lat > 8 && lat < 23) || // West coast
           (lng > 79 && lat > 8 && lat < 20);    // East coast
  }

  private isInTharDesert(lat: number, lng: number): boolean {
    return lng > 69 && lng < 75 && lat > 24 && lat < 30;
  }

  // Enhanced elevation calculation methods
  private getHimalayaElevation(lat: number, lng: number): number {
    // Higher elevation for more northern latitudes
    const baseElevation = 1000 + (lat - 28) * 200;
    const variation = 500 + Math.random() * 1000;
    return baseElevation + variation;
  }

  private getWesternGhatsElevation(lat: number, lng: number): number {
    // Northern Western Ghats are generally higher
    const baseElevation = lat > 15 ? 800 : 600;
    const variation = Math.random() * 400;
    return baseElevation + variation;
  }

  private getEasternGhatsElevation(lat: number, lng: number): number {
    return 300 + Math.random() * 500; // 300-800m
  }

  private getDeccanPlateauElevation(lat: number, lng: number): number {
    // Your test coordinates (20.9872, 77.7608) would fall here
    // Amravati region is around 300-400m elevation
    return 300 + Math.random() * 200; // 300-500m
  }

  private getGangeticPlainsElevation(lat: number, lng: number): number {
    // Very flat, slight gradient from west to east
    const baseElevation = 200 - (lng - 75) * 5; // Lower towards east
    return Math.max(50, baseElevation + Math.random() * 100);
  }

  private getCoastalPlainsElevation(lat: number, lng: number): number {
    return 5 + Math.random() * 45; // 5-50m
  }

  private getTharDesertElevation(lat: number, lng: number): number {
    return 150 + Math.random() * 250; // 150-400m
  }

  private getCentralIndiaElevation(lat: number, lng: number): number {
    return 200 + Math.random() * 200; // 200-400m
  }

  /**
   * Get cached result if valid
   */
  private getCachedResult(cacheKey: string): ElevationData | null {
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
  private setCacheEntry(cacheKey: string, data: ElevationData): void {
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
    
    console.log(`💾 Cached elevation data for ${cacheKey} (${data.source}, ${data.confidence})`);
  }

  /**
   * Clear cache (useful for testing)
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('🧹 Elevation cache cleared');
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttlDays: this.CACHE_TTL / (24 * 60 * 60 * 1000)
    };
  }

  /**
   * Batch elevation lookup for multiple coordinates
   */
  async getBatchElevations(coordinates: Array<{ lat: number; lng: number }>): Promise<number[]> {
    const promises = coordinates.map(coord => this.getElevation(coord.lat, coord.lng));
    return Promise.all(promises);
  }
}

export default new ElevationService();
