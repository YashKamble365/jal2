// src/components/SmartRecommendations.tsx - RESPONSIVE PROFESSIONAL UI
import React, { useState, useEffect, useCallback } from 'react';
import { Coordinates, EnvironmentalAnalysis } from '../types/environmental';
import { PropertyDetails, SimpleRecommendation, SubsidyInfo, DetailedCostBreakdown } from '../types/recommendations';
import { DynamicSmartRecommendationsService } from '../services/dynamicSmartRecommendationsService';

interface IconProps {
  name: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

interface SmartRecommendationsProps {
  coordinates: Coordinates;
  rooftopArea: number;
  openSpaceArea: number;
  budget: number;
  environmentalData: EnvironmentalAnalysis;
  onBack?: () => void;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  coordinates,
  rooftopArea,
  openSpaceArea,
  budget,
  environmentalData,
  onBack
}) => {
  // Enhanced states for user preferences and single recommendation
  const [showPreferences, setShowPreferences] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    message: string;
    stage: string;
    progress?: number;
  } | null>(null);

  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>({
    propertyType: 'individual_house',
    occupants: 4,
    dailyWaterNeed: 600,
    primaryUse: 'mixed',
    existingWaterSource: 'municipal',
    currentWaterCost: 2000,
    preferredSystem: 'balanced',
    hasPowerBackup: false,
    maintenancePreference: 'professional'
  });

  // Single recommendation states
  const [recommendation, setRecommendation] = useState<SimpleRecommendation | null>(null);
  const [subsidyInfo, setSubsidyInfo] = useState<SubsidyInfo | null>(null);
  const [detailedBreakdown, setDetailedBreakdown] = useState<DetailedCostBreakdown | null>(null);
  const [marketInfo, setMarketInfo] = useState<any>(null);
  const [locationInfo, setLocationInfo] = useState<any>(null);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  const [aiEnhanced, setAiEnhanced] = useState(false);
  
  // Enhanced features
  const [performancePrediction, setPerformancePrediction] = useState<any>(null);
  const [costOptimizations, setCostOptimizations] = useState<any>(null);
  const [implementationRisks, setImplementationRisks] = useState<any>(null);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<any>(null);
  const [supplierMatching, setSupplierMatching] = useState<any>(null);
  const [environmentalImpact, setEnvironmentalImpact] = useState<any>(null);

  const dynamicRecommendationsService = new DynamicSmartRecommendationsService();

  // User preferences form handler
  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedDailyNeed = propertyDetails.occupants * 150;
    const propertyMultiplier = 
      propertyDetails.propertyType === 'villa' ? 1.5 :
      propertyDetails.propertyType === 'apartment' ? 0.8 :
      propertyDetails.propertyType === 'commercial' ? 2.0 : 1.0;
    
    const finalDailyNeed = Math.round(calculatedDailyNeed * propertyMultiplier);
    
    setPropertyDetails(prev => ({
      ...prev,
      dailyWaterNeed: finalDailyNeed
    }));
    
    setShowPreferences(false);
    generateSmartRecommendation({
      ...propertyDetails,
      dailyWaterNeed: finalDailyNeed
    });
  };

  // AI-enhanced recommendation generation
  const generateSmartRecommendation = async (userPrefs: PropertyDetails) => {
    try {
      setLoading(true);
      setError(null);
      
      // AI-enhanced loading stages
      setProgress({
        message: '🤖 Consulting AI water engineer...',
        stage: 'ai_analysis',
        progress: 15
      });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProgress({
        message: '🧠 AI analyzing environmental conditions...',
        stage: 'ai_environmental',
        progress: 30
      });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProgress({
        message: '🎯 AI optimizing system configuration...',
        stage: 'ai_optimization',
        progress: 50
      });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProgress({
        message: '💰 Calculating optimized pricing...',
        stage: 'ai_pricing',
        progress: 70
      });
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setProgress({
        message: '✨ Finalizing your perfect system...',
        stage: 'ai_finalization',
        progress: 90
      });

      // Call AI-enhanced service
      const result = await dynamicRecommendationsService.generateDynamicRecommendations(
        environmentalData,
        coordinates,
        rooftopArea,
        openSpaceArea,
        budget,
        userPrefs
      );

      // Check if AI was used
      setAiEnhanced(result.aiEnhanced || false);

      // Get the single best recommendation
      const selectedRecommendation = result.recommendations[0];

      // Set single recommendation data
      setRecommendation(selectedRecommendation);
      setSubsidyInfo(result.subsidyInfo);
      setMarketInfo(result.marketInfo);
      setLocationInfo(result.locationInfo);

      // Find corresponding detailed breakdown
      const breakdown = result.detailedBreakdowns.find(b => 
        b.systemName === selectedRecommendation.systemName
      );
      setDetailedBreakdown(breakdown || null);

      // Generate enhanced features for selected system
      const performance = dynamicRecommendationsService.predictSystemPerformance(
        selectedRecommendation,
        environmentalData,
        userPrefs
      );
      setPerformancePrediction(performance);

      const optimizations = dynamicRecommendationsService.generateCostOptimizations(
        selectedRecommendation,
        result.subsidyInfo,
        budget
      );
      setCostOptimizations(optimizations);

      const risks = dynamicRecommendationsService.assessImplementationRisks(
        coordinates,
        {},
        environmentalData
      );
      setImplementationRisks(risks);

      const impact = dynamicRecommendationsService.calculateEnvironmentalImpact(
        selectedRecommendation.annualCollection,
        environmentalData.waterHarvesting.groundwaterRecharge
      );
      setEnvironmentalImpact(impact);

      const suppliers = dynamicRecommendationsService.matchSuppliersToSystem(
        coordinates,
        selectedRecommendation.systemId.includes('premium') ? 'premium' :
        selectedRecommendation.systemId.includes('performance') ? 'performance' : 'basic',
        {}
      );
      setSupplierMatching(suppliers);

      const maintenance = dynamicRecommendationsService.generateMaintenanceSchedule({
        storage: true,
        filtration: true,
        pumping: !selectedRecommendation.systemId.includes('basic'),
        smart: selectedRecommendation.systemId.includes('premium'),
        solar: selectedRecommendation.systemId.includes('premium'),
        recharge: selectedRecommendation.systemId.includes('performance') || selectedRecommendation.systemId.includes('premium')
      });
      setMaintenanceSchedule(maintenance);

      setProgress({ message: '🎉 Your perfect system is ready!', stage: 'complete', progress: 100 });
      
      setTimeout(() => {
        setLoading(false);
      }, 500);
      
    } catch (err: any) {
      console.error('❌ Error generating recommendation:', err);
      setError(err.message || 'Failed to generate recommendation');
      setLoading(false);
    }
  };

  // User preferences interface - MOBILE-FIRST RESPONSIVE
  if (showPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-inter text-white">
        {/* PROFESSIONAL HEADER */}
        <header className="sticky top-0 bg-slate-900/95 backdrop-blur-lg z-30 border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {onBack && (
                  <button 
                    onClick={onBack} 
                    className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
                  >
                    <Icon name="arrow_back" className="text-slate-300 text-xl" />
                  </button>
                )}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                    <Icon name="water_drop" className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-white">JalNiti</h1>
                    <p className="text-xs text-slate-400 hidden sm:block">Smart Water Solutions</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-2 text-xs">
                  <div className="bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg border border-purple-500/30">
                    <Icon name="psychology" className="text-sm mr-1" />
                    AI Powered
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-4xl mx-auto py-6 sm:py-8 lg:py-12">
            {/* PROFESSIONAL HERO SECTION */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-4">
                <Icon name="auto_awesome" className="text-blue-400 text-sm" />
                <span className="text-blue-400 text-sm font-medium">AI-Powered Personalization</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Create Your Perfect
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Water Harvesting System
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Tell us about your property and preferences for a personalized AI recommendation tailored to your needs
              </p>
            </div>

            {/* PROFESSIONAL FORM CARD */}
            <form onSubmit={handlePreferencesSubmit} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8 space-y-8 shadow-2xl">
              {/* Property Type - MOBILE RESPONSIVE */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-4">
                  <Icon name="home" className="mr-2 text-blue-400" />
                  Property Type
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { value: 'individual_house', label: 'House', icon: '🏠', desc: 'Independent home' },
                    { value: 'apartment', label: 'Apartment', icon: '🏢', desc: 'Multi-story building' },
                    { value: 'villa', label: 'Villa', icon: '🏘️', desc: 'Premium residence' },
                    { value: 'commercial', label: 'Commercial', icon: '🏬', desc: 'Business property' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPropertyDetails({...propertyDetails, propertyType: option.value as any})}
                      className={`group p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
                        propertyDetails.propertyType === option.value
                          ? 'border-blue-400/60 bg-blue-500/10 ring-2 ring-blue-400/30'
                          : 'border-slate-600/50 hover:border-slate-500/50 hover:bg-slate-700/30'
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl mb-2">{option.icon}</div>
                      <div className={`font-semibold text-sm sm:text-base mb-1 ${
                        propertyDetails.propertyType === option.value ? 'text-blue-300' : 'text-slate-200'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-slate-400">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Family Size and Water Cost - RESPONSIVE GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-4">
                    <Icon name="group" className="mr-2 text-green-400" />
                    Family Members
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[2, 4, 6, 8].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPropertyDetails({...propertyDetails, occupants: num})}
                        className={`p-4 rounded-xl border font-semibold transition-all duration-200 ${
                          propertyDetails.occupants === num
                            ? 'border-green-400/60 bg-green-500/10 text-green-300 ring-2 ring-green-400/30'
                            : 'border-slate-600/50 hover:border-slate-500/50 text-slate-300 hover:bg-slate-700/30'
                        }`}
                      >
                        <div className="text-lg">{num}{num === 8 ? '+' : ''}</div>
                        <div className="text-xs mt-1">{num === 2 ? 'Couple' : num === 4 ? 'Small' : num === 6 ? 'Large' : 'Extended'}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-4">
                    <Icon name="payments" className="mr-2 text-yellow-400" />
                    Current Monthly Water Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-medium">₹</span>
                    <input
                      type="number"
                      value={propertyDetails.currentWaterCost}
                      onChange={(e) => setPropertyDetails({...propertyDetails, currentWaterCost: parseInt(e.target.value) || 0})}
                      className="w-full pl-10 pr-4 py-4 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all"
                      placeholder="2000"
                    />
                    <div className="text-xs text-slate-400 mt-2">Average household spends ₹1,500 - ₹3,000</div>
                  </div>
                </div>
              </div>

              {/* Water Source - RESPONSIVE */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-4">
                  <Icon name="water" className="mr-2 text-cyan-400" />
                  Current Water Source
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { value: 'municipal', label: 'Municipal', icon: '🏛️', desc: 'City supply' },
                    { value: 'borewell', label: 'Borewell', icon: '⚡', desc: 'Private well' },
                    { value: 'tanker', label: 'Tanker', icon: '🚛', desc: 'Water delivery' },
                    { value: 'mixed', label: 'Mixed', icon: '🔀', desc: 'Multiple sources' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPropertyDetails({...propertyDetails, existingWaterSource: option.value as any})}
                      className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                        propertyDetails.existingWaterSource === option.value
                          ? 'border-cyan-400/60 bg-cyan-500/10 text-cyan-300 ring-2 ring-cyan-400/30'
                          : 'border-slate-600/50 hover:border-slate-500/50 text-slate-300 hover:bg-slate-700/30'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-medium text-sm mb-1">{option.label}</div>
                      <div className="text-xs text-slate-400">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Use - MOBILE OPTIMIZED */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-4">
                  <Icon name="category" className="mr-2 text-purple-400" />
                  Water Usage Priority
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: 'drinking_cooking', label: 'Drinking & Cooking', desc: 'High quality water for consumption', icon: '🍽️', benefit: 'Premium filtration included' },
                    { value: 'mixed', label: 'All Household Uses', desc: 'Drinking, cleaning, bathing, gardening', icon: '🔄', benefit: 'Most popular choice' },
                    { value: 'non_potable', label: 'Cleaning & Utilities', desc: 'Bathing, washing, cleaning only', icon: '🚿', benefit: 'Cost-effective solution' },
                    { value: 'irrigation', label: 'Garden & Plants', desc: 'Mainly for gardening and plants', icon: '🌱', benefit: 'Eco-friendly focus' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPropertyDetails({...propertyDetails, primaryUse: option.value as any})}
                      className={`p-5 rounded-xl border text-left transition-all duration-200 ${
                        propertyDetails.primaryUse === option.value
                          ? 'border-purple-400/60 bg-purple-500/10 ring-2 ring-purple-400/30'
                          : 'border-slate-600/50 hover:border-slate-500/50 hover:bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-2xl">{option.icon}</div>
                        <div className="flex-1">
                          <div className={`font-semibold mb-1 ${
                            propertyDetails.primaryUse === option.value ? 'text-purple-300' : 'text-slate-200'
                          }`}>
                            {option.label}
                          </div>
                          <div className="text-sm text-slate-400 mb-2">{option.desc}</div>
                          <div className="text-xs text-green-400 font-medium">{option.benefit}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* System Preference - ENHANCED MOBILE */}
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-4">
                  <Icon name="tune" className="mr-2 text-orange-400" />
                  System Preference (Most Important)
                </label>
                <div className="space-y-4">
                  {[
                    { 
                      value: 'storage_priority', 
                      label: 'Maximum Storage', 
                      desc: 'Focus on storing more water for longer backup periods',
                      icon: '🏺',
                      benefit: 'Best for areas with irregular water supply',
                      color: 'blue'
                    },
                    { 
                      value: 'recharge_priority', 
                      label: 'Groundwater Recharge', 
                      desc: 'Prioritize environmental conservation and groundwater replenishment',
                      icon: '💧',
                      benefit: 'Best for environmental impact and sustainability',
                      color: 'green'
                    },
                    { 
                      value: 'balanced', 
                      label: 'Balanced System', 
                      desc: 'Optimal combination of storage and recharge for best overall value',
                      icon: '⚖️',
                      benefit: 'Best overall value and performance',
                      color: 'purple'
                    }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPropertyDetails({...propertyDetails, preferredSystem: option.value as any})}
                      className={`w-full p-5 sm:p-6 rounded-xl border text-left transition-all duration-200 ${
                        propertyDetails.preferredSystem === option.value
                          ? `border-${option.color}-400/60 bg-${option.color}-500/10 ring-2 ring-${option.color}-400/30`
                          : 'border-slate-600/50 hover:border-slate-500/50 hover:bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{option.icon}</div>
                        <div className="flex-1">
                          <div className={`font-bold text-lg mb-2 ${
                            propertyDetails.preferredSystem === option.value 
                              ? `text-${option.color}-300` 
                              : 'text-slate-200'
                          }`}>
                            {option.label}
                          </div>
                          <div className="text-slate-400 mb-3 leading-relaxed">{option.desc}</div>
                          <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
                            <Icon name="check_circle" className="text-green-400 text-sm" />
                            <span className="text-green-400 text-sm font-medium">{option.benefit}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Maintenance and Power - RESPONSIVE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-4">
                    <Icon name="build" className="mr-2 text-red-400" />
                    Maintenance Preference
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'diy', label: 'DIY Friendly', desc: 'I can handle basic maintenance', icon: '🔧', color: 'bg-blue-500/10 border-blue-500/30 text-blue-300' },
                      { value: 'professional', label: 'Professional Service', desc: 'Prefer expert maintenance', icon: '👨‍🔧', color: 'bg-green-500/10 border-green-500/30 text-green-300' },
                      { value: 'low_maintenance', label: 'Minimal Maintenance', desc: 'Set and forget system', icon: '🎯', color: 'bg-purple-500/10 border-purple-500/30 text-purple-300' }
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPropertyDetails({...propertyDetails, maintenancePreference: option.value as any})}
                        className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                          propertyDetails.maintenancePreference === option.value
                            ? `${option.color} ring-2 ring-current/30`
                            : 'border-slate-600/50 hover:border-slate-500/50 text-slate-300 hover:bg-slate-700/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{option.icon}</span>
                          <div className="flex-1">
                            <div className="font-semibold">{option.label}</div>
                            <div className="text-xs text-slate-400 mt-1">{option.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-4">
                    <Icon name="power" className="mr-2 text-yellow-400" />
                    Power Backup Availability
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: true, label: 'Yes, I have power backup', desc: 'Generator/Inverter available', icon: '🔋', color: 'bg-green-500/10 border-green-500/30 text-green-300' },
                      { value: false, label: 'No power backup', desc: 'Only grid power available', icon: '⚡', color: 'bg-orange-500/10 border-orange-500/30 text-orange-300' }
                    ].map(option => (
                      <button
                        key={option.value.toString()}
                        type="button"
                        onClick={() => setPropertyDetails({...propertyDetails, hasPowerBackup: option.value})}
                        className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                          propertyDetails.hasPowerBackup === option.value
                            ? `${option.color} ring-2 ring-current/30`
                            : 'border-slate-600/50 hover:border-slate-500/50 text-slate-300 hover:bg-slate-700/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{option.icon}</span>
                          <div className="flex-1">
                            <div className="font-semibold">{option.label}</div>
                            <div className="text-xs text-slate-400 mt-1">{option.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PROFESSIONAL SUBMIT SECTION */}
              <div className="border-t border-slate-700/50 pt-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center space-x-2 bg-slate-700/30 px-4 py-2 rounded-full mb-4">
                    <Icon name="auto_awesome" className="text-blue-400 text-sm" />
                    <span className="text-slate-300 text-sm">AI will optimize your system in real-time</span>
                  </div>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Our AI analyzes your preferences with environmental data to create your perfect water harvesting system
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 text-white py-4 sm:py-5 px-8 rounded-xl font-bold text-lg transition-all duration-200 shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Icon name="psychology" className="text-xl" />
                      <span>Get My AI-Perfect System</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPreferences(false);
                      generateSmartRecommendation(propertyDetails);
                    }}
                    className="sm:flex-none bg-slate-700 hover:bg-slate-600 text-slate-200 py-4 sm:py-5 px-6 rounded-xl font-semibold transition-all duration-200"
                  >
                    Skip & Use Defaults
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // PROFESSIONAL LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-inter text-white flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 sm:p-12 text-center w-full max-w-md shadow-2xl">
          {/* Animated Logo */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-blue-400/20 border-b-blue-400 rounded-full animate-spin animation-delay-150"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon name="psychology" className="text-cyan-400 text-3xl" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            AI Creating Your Perfect System
          </h2>
          
          {progress && (
            <div className="mb-8">
              <p className="text-slate-300 mb-4 text-lg leading-relaxed">{progress.message}</p>
              <div className="text-sm text-cyan-400 mb-4 font-medium">
                <Icon name="speed" className="mr-2" />
                Stage: {progress.stage.replace('_', ' ')}
              </div>
              {progress.progress !== undefined && (
                <div className="w-full bg-slate-700 rounded-full h-3 mb-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}

          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 text-sm">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Icon name="auto_awesome" className="text-cyan-400" />
              <span className="text-cyan-400 font-semibold">AI Personalization Engine</span>
            </div>
            <p className="font-semibold text-white mb-2">
              Optimizing for your {propertyDetails.propertyType.replace('_', ' ')} with {propertyDetails.occupants} members
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 mb-3">
              <div>Budget: ₹{budget.toLocaleString()}</div>
              <div>Priority: {propertyDetails.preferredSystem.replace('_', ' ')}</div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-purple-400 text-xs">
              <Icon name="psychology" className="text-sm" />
              <span>AI Powered • Real-time optimization</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PROFESSIONAL ERROR SCREEN
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-inter text-white flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 sm:p-12 text-center w-full max-w-md shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
            <Icon name="error" className="text-red-400 text-4xl" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold mb-4">AI Recommendation Failed</h2>
          <p className="text-slate-300 mb-6 leading-relaxed">{error}</p>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <p className="text-yellow-400 text-sm">
              <Icon name="info" className="mr-2" />
              Don't worry - our fallback system will still provide great recommendations!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setError(null);
                generateSmartRecommendation(propertyDetails);
              }}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              <Icon name="refresh" className="mr-2" />
              Try AI Again
            </button>
            <button
              onClick={onBack}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN RECOMMENDATION INTERFACE
  if (!recommendation) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-inter text-white">
      {/* PROFESSIONAL HEADER */}
      <header className="sticky top-0 bg-slate-900/95 backdrop-blur-lg z-30 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setShowPreferences(true)}
                className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
              >
                <Icon name="arrow_back" className="text-slate-300 text-xl" />
              </button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                  <Icon name="water_drop" className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">JalNiti</h1>
                  <p className="text-xs text-slate-400 hidden sm:block">Smart Water Solutions</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2 text-xs">
                <div className="bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/30">
                  <Icon name="check_circle" className="text-sm mr-1" />
                  Personalized
                </div>
                {aiEnhanced && (
                  <div className="bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-lg border border-purple-500/30">
                    <Icon name="psychology" className="text-sm mr-1" />
                    AI Enhanced
                  </div>
                )}
                <div className="bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/30">
                  <Icon name="stars" className="text-sm mr-1" />
                  Perfect Match
                </div>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto py-6 sm:py-8 lg:py-12">
          {/* PROFESSIONAL HERO SECTION */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full mb-4">
              <Icon name="check_circle" className="text-green-400 text-sm" />
              <span className="text-green-400 text-sm font-medium">
                {aiEnhanced ? 'AI-Enhanced Recommendation Ready' : 'Personalized Recommendation Ready'}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {aiEnhanced ? (
                <>
                  Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">AI-Perfect</span> Water System
                </>
              ) : (
                <>
                  Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Perfect</span> Water System
                </>
              )}
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-4">
              {aiEnhanced ? 
                'AI-engineered recommendation based on your requirements and environmental data analysis' :
                'Personalized recommendation based on your requirements and environmental data analysis'
              }
            </p>
            
            {aiEnhanced && (
              <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full">
                <Icon name="psychology" className="text-purple-400 text-sm" />
                <span className="text-purple-400 text-sm font-medium">AI Powered • Real-time Optimization</span>
              </div>
            )}
          </div>

          {/* ENVIRONMENTAL & PROPERTY SUMMARY - MOBILE RESPONSIVE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {/* Location Card */}
            {locationInfo && marketInfo && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="location_on" className="text-blue-400 text-xl" />
                  <h3 className="text-lg font-bold text-blue-400">Location</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">State</span>
                    <span className="text-slate-200 font-semibold">{marketInfo.stateName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">District</span>
                    <span className="text-slate-200 font-semibold">{marketInfo.districtName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Market Zone</span>
                    <span className="text-slate-200 font-semibold">{marketInfo.regionType.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Environmental Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="eco" className="text-cyan-400 text-xl" />
                <h3 className="text-lg font-bold text-cyan-400">Environment</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Annual Rainfall</span>
                  <span className="text-slate-200 font-semibold">{environmentalData.rainfall.annualRainfall}mm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Soil Type</span>
                  <span className="text-slate-200 font-semibold">{environmentalData.soil.permeabilityClassification}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Groundwater</span>
                  <span className="text-slate-200 font-semibold">{environmentalData.groundwater.depth}m depth</span>
                </div>
              </div>
            </div>

            {/* Preferences Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-2 mb-4">
                <Icon name="person" className="text-purple-400 text-xl" />
                <h3 className="text-lg font-bold text-purple-400">Your Preferences</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Property Type</span>
                  <span className="text-slate-200 font-semibold">{propertyDetails.propertyType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Family Size</span>
                  <span className="text-slate-200 font-semibold">{propertyDetails.occupants} members</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">System Priority</span>
                  <span className="text-slate-200 font-semibold">{propertyDetails.preferredSystem.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* GOVERNMENT SUBSIDY CARD - MOBILE OPTIMIZED */}
          {subsidyInfo && subsidyInfo.isEligible && (
            <div className="bg-gradient-to-r from-green-500/10 via-green-500/5 to-blue-500/10 border border-green-500/30 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12 backdrop-blur-sm">
              <div className="text-center sm:text-left mb-6">
                <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                  <Icon name="celebration" className="text-green-400 text-2xl" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-green-400">Government Subsidy Available!</h2>
                </div>
                <p className="text-slate-300">You're eligible for government support on your water harvesting system</p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">
                    ₹{subsidyInfo.subsidyAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-300">Subsidy Amount</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">
                    {subsidyInfo.subsidyPercentage}%
                  </div>
                  <div className="text-sm text-slate-300">Coverage</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                  <div className="text-lg sm:text-xl font-bold text-purple-400 mb-1 leading-tight">
                    {subsidyInfo.schemeName.split(' ').slice(0, 2).join(' ')}
                  </div>
                  <div className="text-sm text-slate-300">Government Scheme</div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-1">
                    ₹{subsidyInfo.maxSubsidy.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-300">Maximum Available</div>
                </div>
              </div>
            </div>
          )}

          {/* ENVIRONMENTAL IMPACT CARD - MOBILE RESPONSIVE */}
          {environmentalImpact && (
            <div className="bg-gradient-to-r from-green-500/10 via-cyan-500/5 to-blue-500/10 border border-green-500/20 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12 backdrop-blur-sm">
              <div className="text-center sm:text-left mb-6">
                <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
                  <Icon name="eco" className="text-green-400 text-2xl" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-green-400">
                    Environmental Impact
                    {aiEnhanced && <span className="text-purple-400 ml-2">• AI Calculated</span>}
                  </h2>
                </div>
                <p className="text-slate-300">Your positive contribution to the environment and community</p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">
                    {environmentalImpact.carbonSaved} kg
                  </div>
                  <div className="text-xs text-slate-300">CO₂ Saved Annually</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">
                    {environmentalImpact.treesEquivalent}
                  </div>
                  <div className="text-xs text-slate-300">Trees Equivalent</div>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-cyan-400 mb-1">
                    {environmentalImpact.municipalWaterSaved.toLocaleString()}L
                  </div>
                  <div className="text-xs text-slate-300">Municipal Water Saved</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-400 mb-1">
                    {environmentalImpact.groundwaterContribution.toLocaleString()}L
                  </div>
                  <div className="text-xs text-slate-300">Groundwater Recharge</div>
                </div>
              </div>
            </div>
          )}

          {/* MAIN RECOMMENDATION CARD - MOBILE FIRST DESIGN */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 lg:p-10 mb-8 sm:mb-12 shadow-2xl">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8 space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-4">
                  {aiEnhanced && <Icon name="psychology" className="text-purple-400 text-2xl" />}
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                    {recommendation.systemName}
                  </h2>
                </div>
                
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Icon
                        key={i}
                        name="star"
                        className={`text-xl ${
                          i < Math.round(recommendation.suitabilityScore / 20)
                            ? 'text-yellow-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`font-bold text-lg sm:text-xl ${aiEnhanced ? 'text-purple-400' : 'text-teal-400'}`}>
                    {recommendation.suitabilityScore}% Perfect Match for You
                  </span>
                </div>
                
                <p className="text-slate-300 leading-relaxed mb-6">{recommendation.description}</p>
                
                {aiEnhanced && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 sm:p-5">
                    <div className="flex items-start space-x-3">
                      <Icon name="psychology" className="text-purple-400 text-xl mt-0.5" />
                      <div>
                        <p className="text-purple-300 font-medium mb-1">AI-Engineered Design</p>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          This system was intelligently designed by our AI engineer specifically for your environmental conditions and personal preferences.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Price Section */}
              <div className="text-center lg:text-right lg:ml-8 flex-shrink-0">
                <div className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 ${aiEnhanced ? 'text-purple-400' : 'text-teal-400'}`}>
                  ₹{recommendation.afterSubsidy.toLocaleString()}
                </div>
                <div className="text-lg text-slate-400 mb-3">After Government Subsidy</div>
                {subsidyInfo && subsidyInfo.subsidyAmount > 0 && (
                  <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
                    <Icon name="savings" className="text-green-400" />
                    <span className="text-green-400 font-semibold">
                      You Save ₹{subsidyInfo.subsidyAmount.toLocaleString()}!
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics - Mobile Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 sm:p-5 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">
                  {recommendation.annualCollection.toLocaleString()}L
                </div>
                <div className="text-sm text-slate-400">Annual Collection</div>
                <div className="text-xs text-blue-300 mt-1">
                  {Math.round(recommendation.annualCollection/365)} L/day
                </div>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 sm:p-5 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">
                  {recommendation.storageCapacity.toLocaleString()}L
                </div>
                <div className="text-sm text-slate-400">Storage Capacity</div>
                <div className="text-xs text-green-300 mt-1">
                  Premium tank system
                </div>
              </div>
              
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 sm:p-5 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2">
                  {Math.round(recommendation.storageCapacity/propertyDetails.dailyWaterNeed)} days
                </div>
                <div className="text-sm text-slate-400">Water Backup</div>
                <div className="text-xs text-cyan-300 mt-1">
                  Emergency supply
                </div>
              </div>
              
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 sm:p-5 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-2">
                  {Math.min(recommendation.roiYears, 25)} years
                </div>
                <div className="text-sm text-slate-400">Payback Period</div>
                <div className="text-xs text-orange-300 mt-1">
                  Return on investment
                </div>
              </div>
            </div>

            {/* Key Benefits - Mobile Optimized */}
            <div className="mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-green-400 mb-4 flex items-center">
                <Icon name="check_circle" className="mr-2" />
                Why This System Is {aiEnhanced ? 'AI-Perfect' : 'Perfect'} for You
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {recommendation.pros.map((pro, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-green-500/5 border border-green-500/10 rounded-xl p-4">
                    <Icon name="check" className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-200 leading-relaxed">{pro}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <button
                onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon name={showDetailedBreakdown ? "expand_less" : "expand_more"} className="text-xl" />
                  <span>{showDetailedBreakdown ? 'Hide' : 'Show'} Complete Cost Breakdown & Details</span>
                </div>
              </button>
            </div>
          </div>

          {/* DETAILED BREAKDOWN SECTION - MOBILE RESPONSIVE */}
          {showDetailedBreakdown && detailedBreakdown && (
            <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
              {/* Component Breakdown Table - Mobile Optimized */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center space-x-2 mb-6">
                  <Icon name="inventory" className="text-green-400 text-2xl" />
                  <h3 className="text-2xl sm:text-3xl font-bold text-green-400">
                    Detailed Component Breakdown
                    {aiEnhanced && <span className="text-purple-400 ml-2">• AI Optimized</span>}
                  </h3>
                </div>
                
                {/* Mobile: Card Layout, Desktop: Table Layout */}
                <div className="block sm:hidden space-y-4">
                  {Object.entries(detailedBreakdown.components).map(([key, component]) => (
                    <div key={key} className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{component.item}</h4>
                          <p className="text-sm text-slate-400 capitalize">{key} System</p>
                          <p className="text-sm text-slate-300 mt-1">{component.brand}</p>
                          <p className="text-xs text-slate-400">{component.warranty || 'Standard Warranty'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-blue-400 font-bold">₹{component.price.toLocaleString()}</div>
                          <div className="text-slate-400">Component</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-400 font-bold">₹{component.installation.toLocaleString()}</div>
                          <div className="text-slate-400">Installation</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-bold">₹{(component.price + component.installation).toLocaleString()}</div>
                          <div className="text-slate-400">Total</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-4 text-slate-300 font-semibold">Component</th>
                        <th className="text-left py-4 text-slate-300 font-semibold">Brand & Model</th>
                        <th className="text-right py-4 text-slate-300 font-semibold">Component Cost</th>
                        <th className="text-right py-4 text-slate-300 font-semibold">Installation</th>
                        <th className="text-right py-4 text-slate-300 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(detailedBreakdown.components).map(([key, component]) => (
                        <tr key={key} className="border-b border-slate-800 hover:bg-slate-700/20 transition-colors">
                          <td className="py-4 text-slate-300">
                            <div className="font-medium">{component.item}</div>
                            <div className="text-xs text-slate-500 capitalize">{key} System</div>
                          </td>
                          <td className="py-4 text-slate-300">
                            <div className="font-medium">{component.brand}</div>
                            <div className="text-xs text-slate-500">{component.warranty || 'Standard Warranty'}</div>
                          </td>
                          <td className="py-4 text-right text-blue-400 font-semibold">₹{component.price.toLocaleString()}</td>
                          <td className="py-4 text-right text-green-400 font-semibold">₹{component.installation.toLocaleString()}</td>
                          <td className="py-4 text-right text-white font-bold">
                            ₹{(component.price + component.installation).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cost Summary & Financing - Mobile Responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  {/* Cost Summary */}
                  <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6">
                    <h4 className="font-bold text-slate-200 mb-4 flex items-center">
                      <Icon name="receipt" className="mr-2 text-blue-400" />
                      Cost Summary
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Components Total:</span>
                        <span className="text-blue-400 font-semibold">₹{detailedBreakdown.subtotals.components.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Installation Total:</span>
                        <span className="text-green-400 font-semibold">₹{detailedBreakdown.subtotals.installation.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-slate-600/50 pt-3 flex justify-between items-center">
                        <span className="text-slate-300 font-semibold">System Subtotal:</span>
                        <span className="text-white font-bold text-lg">₹{detailedBreakdown.subtotals.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center bg-red-500/10 border border-red-500/20 rounded-lg p-3 -m-1">
                        <span className="text-red-400 font-medium">Government Subsidy ({detailedBreakdown.subsidy.percentage}%):</span>
                        <span className="text-red-400 font-bold">-₹{detailedBreakdown.subsidy.amount.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-slate-600/50 pt-3 flex justify-between items-center bg-gradient-to-r from-teal-500/10 to-green-500/10 border border-teal-500/20 rounded-lg p-3 -m-1">
                        <span className="text-teal-400 font-bold text-lg">Your Final Cost:</span>
                        <span className="text-teal-400 font-bold text-2xl">₹{detailedBreakdown.finalCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financing Options */}
                  <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6">
                    <h4 className="font-bold text-slate-200 mb-4 flex items-center">
                      <Icon name="credit_card" className="mr-2 text-purple-400" />
                      Financing Options
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-300 font-medium">12 Months EMI</span>
                          <span className="text-blue-400 font-bold text-lg">₹{detailedBreakdown.financing.emi12.toLocaleString()}/mo</span>
                        </div>
                        <div className="text-xs text-slate-400">Quick payoff • Higher monthly amount</div>
                      </div>
                      
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-300 font-medium">24 Months EMI</span>
                          <span className="text-green-400 font-bold text-lg">₹{detailedBreakdown.financing.emi24.toLocaleString()}/mo</span>
                        </div>
                        <div className="text-xs text-slate-400">Most popular • Balanced option</div>
                      </div>
                      
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-300 font-medium">36 Months EMI</span>
                          <span className="text-purple-400 font-bold text-lg">₹{detailedBreakdown.financing.emi36.toLocaleString()}/mo</span>
                        </div>
                        <div className="text-xs text-slate-400">Lowest monthly • Extended payment</div>
                      </div>
                      
                      <div className="border-t border-slate-600/50 pt-4 space-y-1">
                        <div className="text-xs text-slate-500">• Interest rates starting from 8.5% p.a.</div>
                        <div className="text-xs text-slate-500">• Processing fee may apply</div>
                        <div className="text-xs text-slate-500">• Zero down payment available</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FINAL ACTION BUTTONS - MOBILE RESPONSIVE */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-4xl mx-auto">
              <button
                onClick={() => {
                  if (supplierMatching && supplierMatching.length > 0) {
                    const supplier = supplierMatching[0];
                    window.open(`tel:${supplier.contact}`, '_self');
                  }
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="call" className="text-xl" />
                  <span>Contact {aiEnhanced ? 'AI-Recommended' : 'Top'} Installation Partner</span>
                </div>
              </button>
              
              <button 
                onClick={() => {
                  const reportData = {
                    recommendation,
                    subsidyInfo,
                    detailedBreakdown,
                    locationInfo,
                    marketInfo,
                    environmentalData,
                    propertyDetails,
                    performancePrediction,
                    aiEnhanced
                  };
                  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `JalNiti_${aiEnhanced ? 'AI_' : ''}${recommendation.systemName.replace(/[^a-zA-Z0-9]/g, '_')}_Report.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="download" className="text-xl" />
                  <span>Download {aiEnhanced ? 'AI' : 'Complete'} Report</span>
                </div>
              </button>
              
              {subsidyInfo && subsidyInfo.isEligible && subsidyInfo.contactInfo?.website && (
                <button
                  onClick={() => window.open(subsidyInfo.contactInfo?.website, '_blank')}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Icon name="account_balance" className="text-xl" />
                    <span>Apply for Government Subsidy</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SmartRecommendations;
