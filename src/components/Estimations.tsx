// src/components/Estimations.tsx - ENHANCED WITH CONSISTENT DESIGN LANGUAGE
import React, { useState } from 'react';
import { useEnvironmentalData, useEnvironmentalDataStatus } from '../hooks/useEnvironmentalData';
import type { Coordinates, EnvironmentalAnalysis } from '../types/environmental';

interface IconProps {
  name: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface EstimationsProps {
  coordinates: Coordinates;
  rooftopArea: number;
  openSpaceArea: number;
  budget: number;
  onBack?: () => void;
  onGetRecommendations?: (data: {
    environmentalData: EnvironmentalAnalysis;
    coordinates: Coordinates;
    rooftopArea: number;
    openSpaceArea: number;
    budget: number;
  }) => void;
}

const Estimations: React.FC<EstimationsProps> = ({ 
  coordinates, 
  rooftopArea, 
  openSpaceArea, 
  budget,
  onBack,
  onGetRecommendations
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  
  const {
    data,
    loading,
    error,
    progress,
    confidence,
    cacheHit,
    lastUpdated,
    refresh,
    serviceStatus
  } = useEnvironmentalData(coordinates, rooftopArea, openSpaceArea, {
    retryAttempts: 3,
    retryDelay: 2000
  });

  const { proxyStatus } = useEnvironmentalDataStatus();

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleGetRecommendations = () => {
    if (!data) {
      console.error('❌ No environmental data available for recommendations');
      alert('Environmental data is still loading. Please wait for the analysis to complete.');
      return;
    }

    if (!onGetRecommendations) {
      console.error('❌ onGetRecommendations handler not provided');
      return;
    }

    console.log('🚀 Navigating to recommendations with environmental data:', {
      hasRainfallData: !!data.rainfall,
      hasGroundwaterData: !!data.groundwater,
      hasSoilData: !!data.soil,
      hasWaterHarvesting: !!data.waterHarvesting,
      rainfallAmount: data.rainfall?.annualRainfall,
      groundwaterDepth: data.groundwater?.depth,
      soilType: data.soil?.permeabilityClassification
    });

    onGetRecommendations({
      environmentalData: data,
      coordinates,
      rooftopArea,
      openSpaceArea,
      budget
    });
  };

  // Enhanced loading state with modern design
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-inter text-white flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 sm:p-12 text-center w-full max-w-md shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="w-full h-full border-4 border-blue-500/30 rounded-full animate-spin border-t-blue-500"></div>
            <Icon name="water_drop" className="absolute inset-0 m-auto text-blue-400 text-2xl" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Environmental Analysis
          </h2>
          
          {progress ? (
            <div className="mb-6">
              <p className="text-slate-300 mb-3 text-base">{progress.message}</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                     style={{ width: `${Math.min(((progress.stage === 'initializing' ? 1 : progress.stage === 'rainfall' ? 2 : progress.stage === 'groundwater' ? 3 : progress.stage === 'soil' ? 4 : progress.stage === 'analyzing' ? 5 : 5) / 5) * 100, 100)}%` }}></div>
              </div>
              <div className="text-sm text-blue-400">Stage: {progress.stage}</div>
            </div>
          ) : (
            <p className="text-slate-300 mb-6 text-base">Analyzing government-validated data...</p>
          )}

          {/* Proxy status with modern design */}
          <div className="mb-6">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              proxyStatus === 'online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              proxyStatus === 'offline' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              <div className={`w-3 h-3 rounded-full mr-2 ${
                proxyStatus === 'online' ? 'bg-emerald-400' :
                proxyStatus === 'offline' ? 'bg-red-400' :
                'bg-amber-400 animate-pulse'
              }`}></div>
              Connection: {proxyStatus}
            </div>
          </div>

          {/* Service status grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className={`p-3 rounded-xl text-center border ${
              serviceStatus.rainfall === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
              serviceStatus.rainfall === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
              'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}>
              <div className="text-2xl mb-1">🌧️</div>
              <div className="text-xs font-medium">Rainfall</div>
              {serviceStatus.rainfall === 'success' && <Icon name="check_circle" className="text-xs mt-1" />}
            </div>
            <div className={`p-3 rounded-xl text-center border ${
              serviceStatus.groundwater === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
              serviceStatus.groundwater === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
              'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}>
              <div className="text-2xl mb-1">🌊</div>
              <div className="text-xs font-medium">Water</div>
              {serviceStatus.groundwater === 'success' && <Icon name="check_circle" className="text-xs mt-1" />}
            </div>
            <div className={`p-3 rounded-xl text-center border ${
              serviceStatus.soil === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
              serviceStatus.soil === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
              'bg-green-500/10 border-green-500/30 text-green-400'
            }`}>
              <div className="text-2xl mb-1">🌱</div>
              <div className="text-xs font-medium">Soil</div>
              {serviceStatus.soil === 'success' && <Icon name="check_circle" className="text-xs mt-1" />}
            </div>
          </div>

          {/* Location display */}
          <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 border border-slate-600/50 rounded-xl p-4">
            <div className="flex items-center justify-center mb-2">
              <Icon name="location_on" className="text-blue-400 mr-2" />
              <span className="text-blue-400 font-medium">Analyzing Location</span>
            </div>
            <div className="font-semibold text-white">
              {coordinates.lat.toFixed(4)}°N, {coordinates.lng.toFixed(4)}°E
            </div>
            {cacheHit && (
              <div className="flex items-center justify-center mt-2 text-amber-400 text-sm">
                <Icon name="storage" className="mr-1 text-xs" />
                Using cached data
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-inter text-white flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 sm:p-12 text-center w-full max-w-md shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
            <Icon name="error" className="text-red-400 text-4xl" />
          </div>

          <h2 className="text-2xl font-bold mb-4 text-red-400">Analysis Failed</h2>
          <p className="text-slate-300 mb-6 leading-relaxed">{error}</p>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center text-amber-400 mb-2">
              <Icon name="info" className="mr-2" />
              <span className="font-medium">System Recovery</span>
            </div>
            <p className="text-amber-300 text-sm">
              Our system will automatically retry or use cached data if available
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={refresh}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            >
              <Icon name="refresh" className="mr-2" />
              Retry Analysis
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-slate-500"
              >
                <Icon name="arrow_back" className="mr-2" />
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Extract location info
  const locationInfo = {
    district: 'Location',
    state: 'India'
  };

  if (data.groundwater?.wrisEnhancement) {
    const parts = data.groundwater.wrisEnhancement.districtProfile.split(', ');
    if (parts.length === 2) {
      locationInfo.district = parts[0];
      locationInfo.state = parts[1];
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-inter text-white">
      {/* Enhanced Header */}
      <header className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-20 px-4 py-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
              >
                <Icon name="arrow_back" className="text-white" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              <Icon name="water_drop" className="text-cyan-400 text-3xl" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                JalNiti
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Proxy Status */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs border ${
              proxyStatus === 'online' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
              proxyStatus === 'offline' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                proxyStatus === 'online' ? 'bg-emerald-400' :
                proxyStatus === 'offline' ? 'bg-red-400' :
                'bg-amber-400 animate-pulse'
              }`}></div>
              <span className="hidden sm:inline font-medium">{proxyStatus}</span>
            </div>

            {/* Confidence Badge */}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 rounded-full border border-purple-500/30">
              <Icon name="verified" className="text-purple-400 text-sm" />
              <span className="text-purple-300 font-bold text-sm">
                {Math.round(confidence * 100)}%
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refresh}
              className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
              title="Refresh Analysis"
            >
              <Icon name="refresh" className="text-slate-400 hover:text-white transition-colors" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Title Section */}
          <div className="py-8 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Environmental Analysis Results
            </h1>
            <p className="text-xl text-slate-300 mb-6">
              {proxyStatus === 'online' ? 'Government-Validated Environmental Data' : 'Enhanced Environmental Analysis'}
            </p>
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 inline-block">
              <div className="flex items-center justify-center mb-2">
                <Icon name="location_on" className="text-cyan-400 mr-2" />
                <span className="text-cyan-400 font-semibold text-lg">
                  {locationInfo.district}, {locationInfo.state}
                </span>
              </div>
              <p className="text-slate-400 mb-2">
                {coordinates.lat.toFixed(4)}°N, {coordinates.lng.toFixed(4)}°E
              </p>
              {cacheHit && lastUpdated && (
                <div className="flex items-center justify-center text-amber-400 text-sm">
                  <Icon name="storage" className="mr-1 text-xs" />
                  <span>Cached • Updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Overview Summary Card */}
          <div className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
              <button
                onClick={() => toggleSection('overview')}
                className="w-full px-6 py-4 text-left bg-gradient-to-r from-teal-500/20 to-cyan-500/20 hover:from-teal-500/30 hover:to-cyan-500/30 transition-colors flex items-center justify-between border-b border-teal-500/20"
              >
                <span className="text-lg font-semibold text-teal-400 flex items-center">
                  <span className="text-2xl mr-3">📊</span>
                  Quick Overview
                </span>
                <Icon name={expandedSections.has('overview') ? 'expand_less' : 'expand_more'} 
                      className="text-teal-400" />
              </button>
              
              {expandedSections.has('overview') && (
                <div className="p-6">
                  {/* Overview Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
                      <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3">🌧️</span>
                        <span className="font-semibold text-blue-400">Annual Rainfall</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-300 mb-1">
                        {data.rainfall.annualRainfall.toLocaleString()}mm
                      </div>
                      <div className="text-sm text-blue-200">
                        {Math.round(data.rainfall.confidence * 100)}% confidence
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-4">
                      <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3">🌊</span>
                        <span className="font-semibold text-cyan-400">Water Table</span>
                      </div>
                      <div className="text-2xl font-bold text-cyan-300 mb-1">
                        {data.groundwater.depth}m
                      </div>
                      <div className="text-sm text-cyan-200">
                        {data.groundwater.level} level
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
                      <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3">🌱</span>
                        <span className="font-semibold text-green-400">Soil Type</span>
                      </div>
                      <div className="text-lg font-bold text-green-300 mb-1">
                        {data.soil.permeabilityClassification}
                      </div>
                      <div className="text-sm text-green-200">
                        {data.soil.infiltrationRateMMPerHour} mm/hr
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
                      <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3">💰</span>
                        <span className="font-semibold text-purple-400">Budget</span>
                      </div>
                      <div className="text-xl font-bold text-purple-300 mb-1">
                        ₹{budget.toLocaleString()}
                      </div>
                      <div className="text-sm text-purple-200">
                        Available for system
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                      <h4 className="font-semibold text-white mb-3 flex items-center">
                        <Icon name="home" className="mr-2 text-cyan-400" />
                        Property Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Rooftop Area</span>
                          <span className="text-white font-semibold">{rooftopArea.toLocaleString()}m²</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Open Space</span>
                          <span className="text-white font-semibold">{openSpaceArea.toLocaleString()}m²</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-600/50">
                          <span className="text-slate-300 font-medium">Total Area</span>
                          <span className="text-cyan-400 font-bold">{(rooftopArea + openSpaceArea).toLocaleString()}m²</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                      <h4 className="font-semibold text-white mb-3 flex items-center">
                        <Icon name="psychology" className="mr-2 text-green-400" />
                        System Potential
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Collection</span>
                          <span className="text-blue-400 font-semibold">{data.waterHarvesting.rooftopHarvest.toLocaleString()}L</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Recharge</span>
                          <span className="text-cyan-400 font-semibold">{data.waterHarvesting.groundwaterRecharge.toLocaleString()}L</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-600/50">
                          <span className="text-slate-300 font-medium">Total Impact</span>
                          <span className="text-green-400 font-bold">{data.waterHarvesting.totalWaterManagement.toLocaleString()}L</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="text-center">
                    {onGetRecommendations && (
                      <button
                        onClick={handleGetRecommendations}
                        disabled={!data}
                        className={`px-8 py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                          data 
                            ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white'
                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Icon name="rocket_launch" className="mr-2" />
                        Get Smart Recommendations & Cost Analysis
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Environmental Data Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Rainfall Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-blue-500/5 to-blue-600/10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">🌧️</span>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Annual Rainfall</h2>
                    <div className="text-sm text-blue-400">{Math.round(data.rainfall.confidence * 100)}% confidence</div>
                  </div>
                </div>
                <div className="bg-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold text-blue-300 flex items-center border border-blue-500/30">
                  {serviceStatus.rainfall === 'success' && (
                    <Icon name="verified" className="mr-1 text-green-400" />
                  )}
                  CWC Data
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-blue-400 text-3xl font-bold mb-1">
                    {data.rainfall.annualRainfall.toLocaleString()}mm
                  </p>
                  <p className="text-slate-400 text-sm">Historical Average</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                    <p className="text-slate-400 text-xs mb-1">Monsoon</p>
                    <p className="font-semibold text-blue-300">{data.rainfall.seasonalPattern.monsoon}mm</p>
                    <p className="text-xs text-blue-200">{((data.rainfall.seasonalPattern.monsoon / data.rainfall.annualRainfall) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
                    <p className="text-slate-400 text-xs mb-1">Post-Monsoon</p>
                    <p className="font-semibold text-cyan-300">{data.rainfall.seasonalPattern.postMonsoon}mm</p>
                    <p className="text-xs text-cyan-200">{((data.rainfall.seasonalPattern.postMonsoon / data.rainfall.annualRainfall) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-slate-500/10 rounded-lg p-3 border border-slate-500/20">
                    <p className="text-slate-400 text-xs mb-1">Winter</p>
                    <p className="font-semibold text-slate-300">{data.rainfall.seasonalPattern.winter}mm</p>
                    <p className="text-xs text-slate-200">{((data.rainfall.seasonalPattern.winter / data.rainfall.annualRainfall) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                    <p className="text-slate-400 text-xs mb-1">Pre-Monsoon</p>
                    <p className="font-semibold text-amber-300">{data.rainfall.seasonalPattern.preMonsoon}mm</p>
                    <p className="text-xs text-amber-200">{((data.rainfall.seasonalPattern.preMonsoon / data.rainfall.annualRainfall) * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {data.rainfall.governmentValidation && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-emerald-400 font-semibold mb-2 flex items-center">
                     
                      Government Validation
                    </p>
                    <div className="text-xs space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span>WRIS Station:</span>
                        <span className="text-emerald-300">{data.rainfall.governmentValidation.wrisStation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Measured:</span>
                        <span className="text-emerald-300">{data.rainfall.governmentValidation.wrisAnnual}mm</span>
                      </div>
                      <p className="text-emerald-300 font-medium">{data.rainfall.governmentValidation.validationAccuracy}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Groundwater Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-cyan-500/5 to-cyan-600/10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">🌊</span>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Water Table Depth</h2>
                    <div className="text-sm text-cyan-400">{Math.round(data.groundwater.confidence * 100)}% confidence</div>
                  </div>
                </div>
                <div className="bg-cyan-500/20 px-3 py-1 rounded-full text-xs font-semibold text-cyan-300 flex items-center border border-cyan-500/30">
                  {serviceStatus.groundwater === 'success' && (
                    <Icon name="verified" className="mr-1 text-green-400" />
                  )}
                  CGWB Data
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-cyan-400 text-3xl font-bold mb-1">
                    {data.groundwater.depth}m
                  </p>
                  <p className="text-slate-400 text-sm">
                    {data.groundwater.level} Level
                  </p>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-cyan-400">Water Level Status</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      data.groundwater.level === 'High' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      data.groundwater.level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {data.groundwater.level}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {data.groundwater.depth < 5 ? 'Excellent for shallow wells' :
                     data.groundwater.depth < 10 ? 'Good for tube wells' :
                     data.groundwater.depth < 15 ? 'Suitable for bore wells' :
                     'Deep drilling required'}
                  </div>
                </div>
                
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                  <p className="text-cyan-400 font-semibold mb-2 flex items-center">
                    <Icon name="analytics" className="mr-2" />
                    CGWB Station Analysis
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">District</span>
                      <span className="text-white">{locationInfo.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Stations Used</span>
                      <span className="text-cyan-300">{data.groundwater.wrisEnhancement.cgwbStationsUsed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nearest Station</span>
                      <span className="text-cyan-300">{data.groundwater.wrisEnhancement.nearestStation.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Distance</span>
                      <span className="text-cyan-300 font-semibold">{data.groundwater.wrisEnhancement.nearestStation.distance}km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Soil Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 shadow-2xl bg-gradient-to-br from-green-500/5 to-green-600/10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">🌱</span>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Soil Permeability</h2>
                    <div className="text-sm text-green-400">{Math.round(data.soil.confidence * 100)}% confidence</div>
                  </div>
                </div>
                <div className="bg-green-500/20 px-3 py-1 rounded-full text-xs font-semibold text-green-300 flex items-center border border-green-500/30">
                  {serviceStatus.soil === 'success' && (
                    <Icon name="verified" className="mr-1 text-green-400" />
                  )}
                  NRSC Data
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-green-400 text-2xl font-bold mb-1">
                    {data.soil.permeabilityClassification}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {data.soil.infiltrationRateMMPerHour} mm/hour
                  </p>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-green-400 mb-3 flex items-center">
                    <Icon name="layers" className="mr-2" />
                    Soil Composition
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Clay</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full transition-all duration-300" 
                               style={{width: `${data.soil.clayContent}%`}}></div>
                        </div>
                        <span className="font-semibold text-orange-300 text-xs w-10 text-right">{data.soil.clayContent.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Sand</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-full rounded-full transition-all duration-300" 
                               style={{width: `${data.soil.sandContent}%`}}></div>
                        </div>
                        <span className="font-semibold text-yellow-300 text-xs w-10 text-right">{data.soil.sandContent.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-xs">Silt</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-gray-500 to-gray-400 h-full rounded-full transition-all duration-300" 
                               style={{width: `${data.soil.siltContent}%`}}></div>
                        </div>
                        <span className="font-semibold text-gray-300 text-xs w-10 text-right">{data.soil.siltContent.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-green-400 font-semibold mb-2 flex items-center">
                    <Icon name="satellite" className="mr-2" />
                    WRIS Enhancement
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">District</span>
                      <span className="text-white">{locationInfo.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">NRSC Data</span>
                      <span className="text-green-300">{data.soil.wrisEnhancement.districtMoistureData.recordCount} measurements</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quality</span>
                      <span className="text-green-300 font-semibold">{data.soil.wrisEnhancement.districtMoistureData.dataQuality}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CGWB Principal Aquifer Card - INTEGRATED */}
          <div className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Icon name="terrain" className="text-3xl text-blue-400" />
                  <div>
                    <h3 className="text-xl font-bold text-blue-400">Principal Aquifer</h3>
                    <p className="text-sm text-slate-400">CGWB Official Classification</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    data.principalAquifer.confidence === 'High' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    data.principalAquifer.confidence === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {data.principalAquifer.confidence} Confidence
                  </div>
                  <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-semibold">
                    Code: {data.principalAquifer.code}
                  </div>
                </div>
              </div>

              {/* Main Aquifer Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">{data.principalAquifer.name}</h4>
                  <p className="text-blue-300 font-medium">{data.principalAquifer.type}</p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-300 leading-relaxed">{data.principalAquifer.description}</p>
                </div>

                {/* Technical Specifications - Mobile Responsive */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <h5 className="font-semibold text-slate-300 mb-3 flex items-center">
                      <Icon name="analytics" className="mr-2 text-blue-400" />
                      Coverage & Age
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Coverage:</span>
                        <span className="text-blue-300 font-semibold">{data.principalAquifer.area_coverage_percent}% of India</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Geological Age:</span>
                        <span className="text-purple-300 font-semibold">{data.principalAquifer.age}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">CGWB Code:</span>
                        <span className="text-cyan-300 font-semibold">{data.principalAquifer.code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                    <h5 className="font-semibold text-slate-300 mb-3 flex items-center">
                      <Icon name="layers" className="mr-2 text-green-400" />
                      Technical Specs
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Weathered Zone:</span>
                        <span className="text-green-300 font-semibold">{data.principalAquifer.weathered_zone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fracture Zones:</span>
                        <span className="text-cyan-300 font-semibold">{data.principalAquifer.fracture_zones}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Yield Range:</span>
                        <span className="text-yellow-300 font-semibold">{data.principalAquifer.yield_range}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* States Coverage - Mobile Optimized */}
                <div className="border-t border-slate-700/50 pt-4">
                  <h5 className="font-semibold text-slate-300 mb-3 flex items-center">
                    <Icon name="map" className="mr-2 text-purple-400" />
                    Geographic Distribution
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {data.principalAquifer.states.slice(0, 6).map((state, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                        {state}
                      </span>
                    ))}
                    {data.principalAquifer.states.length > 6 && (
                      <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded border border-slate-500/30">
                        +{data.principalAquifer.states.length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                {/* CGWB Validation Footer */}
                <div className="border-t border-slate-700/50 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span className="font-semibold">CGWB Official Classification</span>
                    </div>
                    <div className="text-right">
                      <div>Depth to Water: {data.principalAquifer.dtw_range}</div>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Source: Aquifer Systems of India, CGWB 2012 | Ministry of Water Resources, Govt. of India
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Water Harvesting Results */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              <span className="text-4xl mr-3">💧</span>
              Water Harvesting Analysis 
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Rooftop Harvest */}
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Rooftop Water Harvest</h3>
                  <span className="text-3xl">🏠</span>
                </div>
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {data.waterHarvesting.rooftopHarvest.toLocaleString()} L/year
                </div>
                <p className="text-slate-400 mb-4">
                  {rooftopArea}m² roof area
                </p>
                <div className="text-sm text-slate-400 bg-slate-700/30 rounded-lg p-3 mb-3">
                  <Icon name="calculate" className="mr-2" />
                  {data.rainfall.annualRainfall}mm × {rooftopArea}m² × 80% efficiency
                </div>
                <div className="text-sm text-blue-300 bg-blue-500/10 rounded-lg p-2">
                  Daily average: {Math.round(data.waterHarvesting.rooftopHarvest / 365)} L/day
                </div>
              </div>

              {/* Groundwater Recharge */}
              <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Groundwater Recharge</h3>
                  <span className="text-3xl">💧</span>
                </div>
                <div className="text-4xl font-bold text-cyan-400 mb-2">
                  {data.waterHarvesting.groundwaterRecharge.toLocaleString()} L/year
                </div>
                <p className="text-slate-400 mb-4">
                  {openSpaceArea}m² open space
                </p>
                <div className="text-sm text-slate-400 bg-slate-700/30 rounded-lg p-3 mb-3">
                  <Icon name="engineering" className="mr-2" />
                  Optimized for {data.soil.permeabilityClassification.toLowerCase()} permeability soil
                </div>
                <div className="text-sm text-cyan-300 bg-cyan-500/10 rounded-lg p-2">
                  Daily average: {Math.round(data.waterHarvesting.groundwaterRecharge / 365)} L/day
                </div>
              </div>
            </div>

            {/* Total Impact */}
            <div className="bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 border border-green-500/30 rounded-xl p-6 text-center mb-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center justify-center text-white">
                <span className="text-2xl mr-2">🌟</span>
                Total Water Management
              </h3>
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent mb-3">
                {data.waterHarvesting.totalWaterManagement.toLocaleString()} L/year
              </div>
              <div className="text-lg text-green-300 mb-2">Combined harvesting potential</div>
              <div className="flex items-center justify-center space-x-4 text-sm text-green-200">
                <span>Daily: {Math.round(data.waterHarvesting.totalWaterManagement / 365)} L</span>
                <span>•</span>
                <span>Monthly: {Math.round(data.waterHarvesting.totalWaterManagement / 12)} L</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              {onGetRecommendations && (
                <button
                  onClick={handleGetRecommendations}
                  disabled={!data}
                  className={`px-8 py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                    data 
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Icon name="rocket_launch" className="mr-2" />
                  Get Smart Recommendations & Cost Analysis
                </button>
              )}
            </div>
          </div>

          {/* Government Validation */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              <span className="text-4xl mr-3">🏛️</span>
              Government Data Validation for {locationInfo.state}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🏛️</div>
                <h3 className="font-bold text-blue-400 mb-3">Central Water Commission</h3>
                <div className="text-sm text-slate-400 mb-3">Rainfall validation</div>
                <div className="text-sm text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  {data.governmentValidation.rainfall}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🌊</div>
                <h3 className="font-bold text-cyan-400 mb-3">Central Ground Water Board</h3>
                <div className="text-sm text-slate-400 mb-3">Groundwater monitoring</div>
                <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-3">
                  {data.governmentValidation.groundwater}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🛰️</div>
                <h3 className="font-bold text-green-400 mb-3">National Remote Sensing Centre</h3>
                <div className="text-sm text-slate-400 mb-3">Soil satellite data</div>
                <div className="text-sm text-green-300 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  {data.governmentValidation.soil}
                </div>
              </div>
            </div>
            
           
          </div>

          {/* Enhanced Footer */}
          <div className="text-center mb-8">
            <div className="inline-flex flex-wrap items-center justify-center gap-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-6">
              <span className="flex items-center text-teal-400 font-medium">
                <Icon name="verified" className="mr-2" />
                {data.systemAccuracy.accuracy}
              </span>
              <span className="flex items-center text-green-400 font-medium">
                <Icon name="eco" className="mr-2" />
                {data.systemAccuracy.dataQuality}
              </span>
              <span className="flex items-center text-blue-400 font-medium">
                <Icon name="stars" className="mr-2" />
                {data.systemAccuracy.competitiveAdvantage}
              </span>
            </div>
            <div className="mt-4 space-y-1 text-sm text-slate-400">
              <p>
                Analysis for {locationInfo.district}, {locationInfo.state} • 
                Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Just now'}
              </p>
              <p>
                Connection: {proxyStatus} • 
                Cache: {cacheHit ? 'Hit' : 'Fresh'} • 
                Confidence: {Math.round(confidence * 100)}% • 
                Budget: ₹{budget.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Estimations;
