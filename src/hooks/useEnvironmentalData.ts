// src/hooks/useEnvironmentalData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { UltimateEnvironmentalAnalysisService } from '../services/environmentalAnalysisService';
import { UltraDynamicCGWBAquiferService } from '../services/ultraDynamicCGWBAquiferService';
import type { Coordinates, EnvironmentalAnalysis } from '../types/environmental';

interface EnvironmentalDataState {
  data: EnvironmentalAnalysis | null;
  loading: boolean;
  error: string | null;
  progress?: {
    stage: 'initializing' | 'rainfall' | 'groundwater' | 'soil' | 'analyzing' | 'complete';
    message: string;
  };
  lastUpdated?: string;
  cacheHit?: boolean;
}

interface UseEnvironmentalDataOptions {
  enabled?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  cacheTimeout?: number;
}

const environmentalAnalysisService = new UltimateEnvironmentalAnalysisService();
const cgwbAquiferService = new UltraDynamicCGWBAquiferService();

export const useEnvironmentalData = (
  location: Coordinates | null,
  rooftopArea: number,
  openSpaceArea: number,
  options: UseEnvironmentalDataOptions = {}
) => {
  const {
    enabled = true,
    retryAttempts = 2,
    retryDelay = 3000,
    cacheTimeout = 10 * 60 * 1000 // 10 minutes
  } = options;

  const [state, setState] = useState<EnvironmentalDataState>({
    data: null,
    loading: false,
    error: null
  });

  // Cache for avoiding redundant API calls
  const cacheRef = useRef<Map<string, { data: EnvironmentalAnalysis; timestamp: number }>>(new Map());
  
  // Abort controller for cancelling requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate cache key
  const getCacheKey = useCallback((coords: Coordinates, rooftop: number, openSpace: number) => {
    return `${coords.lat.toFixed(4)},${coords.lng.toFixed(4)},${rooftop},${openSpace}`;
  }, []);

  // Check cache
  const getCachedData = useCallback((key: string): EnvironmentalAnalysis | null => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTimeout) {
      return cached.data;
    }
    if (cached) {
      cacheRef.current.delete(key); // Remove expired cache
    }
    return null;
  }, [cacheTimeout]);

  // Set cache
  const setCachedData = useCallback((key: string, data: EnvironmentalAnalysis) => {
    // Limit cache size to prevent memory leaks
    if (cacheRef.current.size > 50) {
      const firstKey = cacheRef.current.keys().next().value;
      if (firstKey) cacheRef.current.delete(firstKey);
    }
    
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  // Progress tracking (enhanced for proxy server integration)
  const updateProgress = useCallback((stage: EnvironmentalDataState['progress']['stage'], message: string) => {
    setState(prev => ({
      ...prev,
      progress: { stage, message }
    }));
  }, []);

  // Main data fetching function
  const fetchEnvironmentalData = useCallback(async (
    coords: Coordinates,
    rooftop: number,
    openSpace: number,
    attempt: number = 1
  ): Promise<void> => {
    const cacheKey = getCacheKey(coords, rooftop, openSpace);
    
    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData && attempt === 1) {
      console.log('📦 Using cached environmental data');
      setState({
        data: cachedData,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
        cacheHit: true
      });
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      cacheHit: false
    }));

    try {
      updateProgress('initializing', 'Starting environmental analysis...');

      // Enhanced error handling for proxy server integration
      console.log(`🚀 Fetching environmental data (attempt ${attempt}/${retryAttempts + 1})`);
      console.log(`📍 Location: ${coords.lat}, ${coords.lng}`);
      console.log(`🏠 Areas: ${rooftop}m² rooftop, ${openSpace}m² open space`);

      const startTime = Date.now();
      const environmentalData = await environmentalAnalysisService.getCompleteEnvironmentalAnalysis(
        coords,
        rooftop,
        openSpace,
        (stage, message) => updateProgress(stage as any, message)
      );
      const duration = Date.now() - startTime;

      console.log(`✅ Environmental analysis completed in ${duration}ms`);
      console.log(`🎯 System accuracy: ${Math.round((environmentalData.systemAccuracy?.confidence || 0) * 100)}%`);

      // 🗿 ADD ULTRA-DYNAMIC CGWB Principal Aquifer Data (100% coordinate accuracy)
      updateProgress('analyzing', 'Ultra-dynamic aquifer analysis for precise geological mapping...');
      const principalAquifer = cgwbAquiferService.getCGWBPrincipalAquifer(coords);

      // Add aquifer data to environmental analysis
      const enhancedEnvironmentalData: EnvironmentalAnalysis = {
        ...environmentalData,
        principalAquifer: principalAquifer
      };

      console.log(`🗿 Ultra-dynamic CGWB aquifer: ${principalAquifer.name} (${principalAquifer.code}) - ${principalAquifer.confidence} confidence`);

      // Cache successful result
      setCachedData(cacheKey, enhancedEnvironmentalData);

      updateProgress('complete', 'Analysis complete!');

      setState({
        data: enhancedEnvironmentalData,
        loading: false,
        error: null,
        progress: { stage: 'complete', message: 'Analysis complete!' },
        lastUpdated: new Date().toISOString(),
        cacheHit: false
      });

    } catch (error: any) { // ← TypeScript fix
      console.error(`❌ Environmental data fetch failed (attempt ${attempt}):`, error);

      const errorMessage = error?.message || 'Failed to fetch environmental data';
      
      // Check if it's a proxy server issue
      if (errorMessage.includes('fetch') || errorMessage.includes('proxy') || errorMessage.includes('network')) {
        updateProgress('initializing', 'Proxy server connection issue, retrying...');
      }

      // Retry logic
      if (attempt <= retryAttempts && !abortControllerRef.current?.signal.aborted) {
        console.warn(`🔄 Retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${retryAttempts + 1})`);
        
        setState(prev => ({
          ...prev,
          progress: { 
            stage: 'initializing', 
            message: `Retrying... (${attempt + 1}/${retryAttempts + 1})` 
          }
        }));

        setTimeout(() => {
          if (!abortControllerRef.current?.signal.aborted) {
            fetchEnvironmentalData(coords, rooftop, openSpace, attempt + 1);
          }
        }, retryDelay);

        return;
      }

      // Final failure
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        progress: { stage: 'initializing', message: 'Analysis failed' },
        lastUpdated: new Date().toISOString(),
        cacheHit: false
      });
    }
  }, [getCacheKey, getCachedData, setCachedData, updateProgress, retryAttempts, retryDelay]);

  // Manual refresh function
  const refresh = useCallback(() => {
    if (location && rooftopArea > 0) {
      console.log('🔄 Manual refresh triggered');
      // Clear cache for this location
      const cacheKey = getCacheKey(location, rooftopArea, openSpaceArea);
      cacheRef.current.delete(cacheKey);
      
      fetchEnvironmentalData(location, rooftopArea, openSpaceArea);
    }
  }, [location, rooftopArea, openSpaceArea, getCacheKey, fetchEnvironmentalData]);

  // Clear all cache
  const clearCache = useCallback(() => {
    console.log('🧹 Clearing environmental data cache');
    cacheRef.current.clear();
  }, []);

  // Main effect
  useEffect(() => {
    if (!enabled || !location || rooftopArea === 0) {
      return;
    }

    fetchEnvironmentalData(location, rooftopArea, openSpaceArea);

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, location, rooftopArea, openSpaceArea, fetchEnvironmentalData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Data
    data: state.data,
    loading: state.loading,
    error: state.error,
    progress: state.progress,
    lastUpdated: state.lastUpdated,
    cacheHit: state.cacheHit,
    
    // Actions
    refresh,
    clearCache,
    
    // Computed properties
    isSuccess: !state.loading && !state.error && !!state.data,
    isEmpty: !state.loading && !state.error && !state.data,
    confidence: state.data?.systemAccuracy?.confidence || 0,
    
    // Service status (useful for proxy debugging)
    serviceStatus: {
      rainfall: state.data?.rainfall ? 'success' : state.error ? 'error' : 'pending',
      groundwater: state.data?.groundwater ? 'success' : state.error ? 'error' : 'pending',
      soil: state.data?.soil ? 'success' : state.error ? 'error' : 'pending'
    }
  };
};

// FIXED: Enhanced proxy status hook with better health check
export const useEnvironmentalDataStatus = () => {
  const [proxyStatus, setProxyStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkProxyStatus = async () => {
      try {
        console.log('🏥 Checking proxy health...');
        
        // FIXED: Use the correct health endpoint
        const response = await fetch('/api/health', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const health = await response.json();
          console.log('🏥 Proxy health response:', health);
          
          // Check if the response has the expected structure
          if (health && (health.status === 'healthy' || health.service === 'WRIS Proxy Server')) {
            console.log('✅ Proxy server is online and healthy');
            setProxyStatus('online');
          } else {
            console.warn('⚠️ Proxy server responded but status unclear:', health);
            setProxyStatus('offline');
          }
        } else {
          console.warn(`⚠️ Proxy health check failed: ${response.status} ${response.statusText}`);
          
          // Try to get error details
          try {
            const errorData = await response.json();
            console.warn('Proxy error details:', errorData);
            
            // If we get the "Endpoint not found" error, it means proxy is running
            if (errorData.error === 'Endpoint not found' && errorData.availableEndpoints) {
              console.log('✅ Proxy is running (got endpoint list)');
              setProxyStatus('online');
            } else {
              setProxyStatus('offline');
            }
          } catch (parseError) {
            console.warn('Could not parse error response');
            setProxyStatus('offline');
          }
        }
        
      } catch (error: any) {
        console.warn('🏥 Proxy health check failed:', error?.message || 'Unknown error');
        
        // Distinguish between different types of errors
        if (error?.name === 'AbortError') {
          console.warn('⏰ Proxy health check timed out');
        } else if (error?.message?.includes('fetch')) {
          console.warn('🔌 Network error - proxy may be offline');
        } else {
          console.warn('❌ Unknown error checking proxy status');
        }
        
        setProxyStatus('offline');
      }
    };

    // Initial check
    checkProxyStatus();
    
    // Check proxy status every 30 seconds
    const interval = setInterval(checkProxyStatus, 30000);
    
    return () => {
      clearInterval(interval);
      console.log('🧹 Proxy health monitoring stopped');
    };
  }, []);

  return { 
    proxyStatus,
    // Additional helper methods
    isProxyOnline: proxyStatus === 'online',
    isProxyOffline: proxyStatus === 'offline',
    isProxyChecking: proxyStatus === 'checking'
  };
};

// NEW: Additional utility hook for detailed service monitoring
export const useServiceDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({
    lastHealthCheck: null as string | null,
    healthCheckDuration: 0,
    consecutiveFailures: 0,
    uptime: null as string | null
  });

  const { proxyStatus } = useEnvironmentalDataStatus();

  useEffect(() => {
    const runDiagnostics = async () => {
      const startTime = Date.now();
      
      try {
        const response = await fetch('/api/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        const duration = Date.now() - startTime;
        
        if (response.ok) {
          const health = await response.json();
          
          setDiagnostics(prev => ({
            lastHealthCheck: new Date().toISOString(),
            healthCheckDuration: duration,
            consecutiveFailures: 0,
            uptime: health.uptime ? `${Math.round(health.uptime)}s` : null
          }));
        } else {
          setDiagnostics(prev => ({
            ...prev,
            lastHealthCheck: new Date().toISOString(),
            healthCheckDuration: duration,
            consecutiveFailures: prev.consecutiveFailures + 1
          }));
        }
        
      } catch (error) {
        const duration = Date.now() - startTime;
        
        setDiagnostics(prev => ({
          ...prev,
          lastHealthCheck: new Date().toISOString(),
          healthCheckDuration: duration,
          consecutiveFailures: prev.consecutiveFailures + 1
        }));
      }
    };

    if (proxyStatus !== 'checking') {
      runDiagnostics();
    }
    
    const interval = setInterval(runDiagnostics, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [proxyStatus]);

  return {
    ...diagnostics,
    proxyStatus,
    isHealthy: proxyStatus === 'online' && diagnostics.consecutiveFailures === 0
  };
};
