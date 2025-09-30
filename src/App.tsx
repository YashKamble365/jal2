// App.tsx - COMPLETE DYNAMIC SYSTEM WITH HIDEABLE DEBUG MENU
import React, { useState, useCallback } from 'react';
import Home from './components/Home';
import Estimations from './components/Estimations';
import SmartRecommendations from './components/SmartRecommendations';
import { Coordinates, EnvironmentalAnalysis } from './types/environmental';

// ✅ ENHANCED: Complete calculation data interface
interface CalculationData {
  location: Coordinates;
  rooftopArea: number;
  openSpaceArea: number;
  budget: number;
  timestamp: string;
  calculationMethod?: string;
}

// ✅ NEW: Recommendations data interface for proper navigation
interface RecommendationsData {
  environmentalData: EnvironmentalAnalysis;
  coordinates: Coordinates;
  rooftopArea: number;
  openSpaceArea: number;
  budget: number;
}

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'estimations' | 'recommendations'>('home');
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null);
  const [recommendationsData, setRecommendationsData] = useState<RecommendationsData | null>(null);
  // ✅ NEW: Debug menu visibility state
  const [showDebugMenu, setShowDebugMenu] = useState(true);

  // ✅ ENHANCED: Handle calculation with complete data structure
  const handleCalculate = useCallback((data: {
    location: Coordinates;
    rooftopArea: number;
    openSpaceArea: number;
    budget: number;
  }) => {
    const enhancedData: CalculationData = {
      ...data,
      timestamp: new Date().toISOString(),
      calculationMethod: 'user_input'
    };

    console.log('📊 Complete calculation data received:', {
      ...enhancedData,
      budgetFormatted: `₹${data.budget.toLocaleString()}`,
      locationFormatted: `${data.location.lat.toFixed(4)}°N, ${data.location.lng.toFixed(4)}°E`,
      totalArea: data.rooftopArea + data.openSpaceArea
    });
    
    setCalculationData(enhancedData);
    setRecommendationsData(null); // Reset recommendations data
    setCurrentView('estimations');
  }, []);

  // ✅ ENHANCED: Handle navigation back to home
  const handleBackToHome = useCallback(() => {
    console.log('🔙 Navigating back to home from', currentView);
    setCurrentView('home');
    // Keep calculationData in case user wants to go back to results
  }, [currentView]);

  // ✅ UPDATED: Handle navigation to recommendations with complete data
  const handleGetRecommendations = useCallback((data: {
    environmentalData: EnvironmentalAnalysis;
    coordinates: Coordinates;
    rooftopArea: number;
    openSpaceArea: number;
    budget: number;
  }) => {
    console.log('🚀 Navigating to dynamic smart recommendations with complete data:', {
      hasEnvironmentalData: !!data.environmentalData,
      hasCalculationData: !!calculationData,
      coordinates: data.coordinates,
      budget: `₹${data.budget.toLocaleString()}`,
      areas: `${data.rooftopArea}m² + ${data.openSpaceArea}m²`,
      environmentalPreview: {
        rainfall: data.environmentalData?.rainfall?.annualRainfall,
        groundwaterDepth: data.environmentalData?.groundwater?.depth,
        soilType: data.environmentalData?.soil?.permeabilityClassification,
        harvestPotential: data.environmentalData?.waterHarvesting?.rooftopHarvest
      }
    });
    
    // Store complete recommendations data
    setRecommendationsData(data);
    setCurrentView('recommendations');
  }, [calculationData]);

  // ✅ NEW: Handle navigation back to estimations
  const handleBackToEstimations = useCallback(() => {
    console.log('🔙 Navigating back to estimations from recommendations');
    setCurrentView('estimations');
    // Keep both calculationData and recommendationsData
  }, []);

  // ✅ ENHANCED: Clear all data (complete reset)
  const handleReset = useCallback(() => {
    console.log('🔄 Complete app reset - clearing all data');
    setCalculationData(null);
    setRecommendationsData(null);
    setCurrentView('home');
  }, []);

  // ✅ ENHANCED: Render current view with complete routing
  const renderCurrentView = () => {
    switch (currentView) {
      case 'estimations':
        if (!calculationData) {
          console.error('❌ No calculation data for estimations view, redirecting to home');
          setCurrentView('home');
          return null;
        }
        
        return (
          <Estimations 
            coordinates={calculationData.location}
            rooftopArea={calculationData.rooftopArea}
            openSpaceArea={calculationData.openSpaceArea}
            budget={calculationData.budget}
            onBack={handleBackToHome}
            onGetRecommendations={handleGetRecommendations} // ✅ FIXED: Now passes complete data
          />
        );

      case 'recommendations':
        if (!recommendationsData) {
          console.error('❌ Missing recommendations data, redirecting to estimations');
          setCurrentView('estimations');
          return null;
        }
        
        console.log('🎯 Rendering SmartRecommendations with data:', {
          hasEnvironmentalData: !!recommendationsData.environmentalData,
          coordinates: recommendationsData.coordinates,
          budget: `₹${recommendationsData.budget.toLocaleString()}`,
          dataQuality: {
            rainfallConfidence: recommendationsData.environmentalData.rainfall?.confidence,
            groundwaterConfidence: recommendationsData.environmentalData.groundwater?.confidence,
            soilConfidence: recommendationsData.environmentalData.soil?.confidence
          }
        });
        
        return (
          <SmartRecommendations
            coordinates={recommendationsData.coordinates}
            rooftopArea={recommendationsData.rooftopArea}
            openSpaceArea={recommendationsData.openSpaceArea}
            budget={recommendationsData.budget}
            environmentalData={recommendationsData.environmentalData}
            onBack={handleBackToEstimations}
          />
        );

      case 'home':
      default:
        return <Home onCalculate={handleCalculate} />;
    }
  };

  // ✅ ENHANCED: Debug information for development
  const debugInfo = calculationData ? {
    currentView,
    hasCalculationData: !!calculationData,
    hasRecommendationsData: !!recommendationsData,
    calculationData: {
      budget: `₹${calculationData.budget.toLocaleString()}`,
      areas: `${calculationData.rooftopArea}m² + ${calculationData.openSpaceArea}m²`,
      location: `${calculationData.location.lat.toFixed(4)}°N, ${calculationData.location.lng.toFixed(4)}°E`,
      timestamp: calculationData.timestamp
    },
    environmentalData: recommendationsData ? {
      rainfall: `${recommendationsData.environmentalData.rainfall?.annualRainfall}mm`,
      groundwater: `${recommendationsData.environmentalData.groundwater?.depth}m`,
      soil: recommendationsData.environmentalData.soil?.permeabilityClassification,
      harvestPotential: `${recommendationsData.environmentalData.waterHarvesting?.rooftopHarvest.toLocaleString()}L/year`
    } : null
  } : null;

  return (
    <div className="min-h-screen">
      {/* ✅ NEW: Debug Toggle Button (only in development) */}
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <button
          onClick={() => setShowDebugMenu(!showDebugMenu)}
          className="fixed top-4 right-4 z-[60] bg-gray-800/90 hover:bg-gray-700/90 text-white p-2 rounded-lg shadow-lg transition-colors border border-gray-600"
          title={showDebugMenu ? "Hide Debug Menu" : "Show Debug Menu"}
        >
          <span className="text-sm font-mono">
            {showDebugMenu ? '👁️‍🗨️' : '🐛'}
          </span>
        </button>
      )}

      {/* ✅ ENHANCED: Debug Panel with hide/show functionality */}
      {process.env.NODE_ENV === 'development' && debugInfo && showDebugMenu && (
        <div className="fixed top-0 right-0 bg-black/95 backdrop-blur-sm text-white p-4 text-xs z-50 max-w-sm rounded-bl-lg border border-gray-600 shadow-2xl">
          {/* ✅ NEW: Header with close button */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-600">
            <div className="font-bold text-teal-400">
              🧪 Dynamic System Debug Panel
            </div>
            <button
              onClick={() => setShowDebugMenu(false)}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title="Hide Debug Menu"
            >
              ✕
            </button>
          </div>
          
          {/* Current State */}
          <div className="mb-3">
            <div className="text-gray-300 font-semibold">Current View:</div>
            <div className={`font-bold ${
              debugInfo.currentView === 'home' ? 'text-blue-400' :
              debugInfo.currentView === 'estimations' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {debugInfo.currentView.toUpperCase()}
            </div>
          </div>
          
          {/* Data Status */}
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Calculation Data:</span>
              <div className={`text-xs px-2 py-1 rounded ${
                debugInfo.hasCalculationData ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {debugInfo.hasCalculationData ? '✅ Loaded' : '❌ Missing'}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Environmental Data:</span>
              <div className={`text-xs px-2 py-1 rounded ${
                debugInfo.hasRecommendationsData ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {debugInfo.hasRecommendationsData ? '✅ Loaded' : '❌ Missing'}
              </div>
            </div>
          </div>
          
          {/* Calculation Data */}
          <div className="mb-3">
            <div className="text-gray-300 font-semibold mb-2">Calculation Details:</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Budget:</span>
                <span className="text-green-400 font-semibold">{debugInfo.calculationData.budget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Areas:</span>
                <span className="text-blue-400 font-semibold">{debugInfo.calculationData.areas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location:</span>
                <span className="text-purple-400 font-semibold">{debugInfo.calculationData.location}</span>
              </div>
            </div>
          </div>
          
          {/* Environmental Data Details */}
          {debugInfo.environmentalData && (
            <div className="mb-3">
              <div className="text-gray-300 font-semibold mb-2">Environmental Data:</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Rainfall:</span>
                  <span className="text-blue-400 font-semibold">{debugInfo.environmentalData.rainfall}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Groundwater:</span>
                  <span className="text-cyan-400 font-semibold">{debugInfo.environmentalData.groundwater}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Soil:</span>
                  <span className="text-green-400 font-semibold">{debugInfo.environmentalData.soil}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Harvest:</span>
                  <span className="text-orange-400 font-semibold">{debugInfo.environmentalData.harvestPotential}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Timestamp */}
          <div className="mb-4">
            <div className="text-gray-300 font-semibold">Session:</div>
            <div className="text-gray-400 text-xs">
              Started: {new Date(debugInfo.calculationData.timestamp).toLocaleTimeString()}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-2">
            <button 
              onClick={handleReset} 
              className="w-full bg-red-500/80 hover:bg-red-500 text-white px-3 py-2 rounded-md text-xs font-semibold transition-colors"
            >
              🔄 Reset All Data
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setCurrentView('home')} 
                className="bg-blue-500/80 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs transition-colors"
              >
                🏠 Home
              </button>
              
              <button 
                onClick={() => setCurrentView('estimations')} 
                className="bg-yellow-500/80 hover:bg-yellow-500 text-white px-2 py-1 rounded text-xs transition-colors"
                disabled={!debugInfo.hasCalculationData}
              >
                📊 Analysis
              </button>
            </div>
            
            {debugInfo.hasRecommendationsData && (
              <button 
                onClick={() => setCurrentView('recommendations')} 
                className="w-full bg-green-500/80 hover:bg-green-500 text-white px-3 py-2 rounded-md text-xs font-semibold transition-colors"
              >
                🚀 Dynamic Recommendations
              </button>
            )}
          </div>

          {/* Navigation Flow */}
          <div className="mt-4 pt-3 border-t border-gray-600">
            <div className="text-gray-300 font-semibold text-xs mb-2">Navigation Flow:</div>
            <div className="flex items-center justify-center space-x-1 text-xs">
              <div className={`px-2 py-1 rounded ${
                debugInfo.currentView === 'home' ? 'bg-blue-500/30 text-blue-300' : 'bg-gray-600/30 text-gray-400'
              }`}>Home</div>
              <span className="text-gray-500">→</span>
              <div className={`px-2 py-1 rounded ${
                debugInfo.currentView === 'estimations' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-gray-600/30 text-gray-400'
              }`}>Analysis</div>
              <span className="text-gray-500">→</span>
              <div className={`px-2 py-1 rounded ${
                debugInfo.currentView === 'recommendations' ? 'bg-green-500/30 text-green-300' : 'bg-gray-600/30 text-gray-400'
              }`}>AI Rec.</div>
            </div>
          </div>

          {/* ✅ NEW: Debug menu footer */}
          <div className="mt-4 pt-3 border-t border-gray-600 text-center">
            <div className="text-gray-500 text-xs">
              Debug Mode • v2.0.0 • {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Main App Content */}
      <main className="w-full">
        {renderCurrentView()}
      </main>

      {/* Global Error Boundary Fallback (optional) */}
      {/* You could add an error boundary component here if needed */}
    </div>
  );
}

export default App;
