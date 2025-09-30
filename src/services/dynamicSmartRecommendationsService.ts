// src/services/dynamicSmartRecommendationsService.ts - REFACTORED WITH AI IMPORT
import { Coordinates, EnvironmentalAnalysis } from '../types/environmental';
import { PropertyDetails, SimpleRecommendation, SubsidyInfo, DetailedCostBreakdown, ComponentSpecs } from '../types/recommendations';
import { EnhancedGeographicService } from './enhancedGeographicService';
import { GeminiAIService } from './geminiAIService'; // ✅ IMPORT SEPARATE AI SERVICE
import { COMPONENT_PRICING_DATABASE, REGIONAL_PRICING_MODIFIERS } from '../config/componentPricing';
import locationService from './locationService';

// ✅ CLEAN: Main Service Class with AI Import
export class DynamicSmartRecommendationsService {
  private geographicService: EnhancedGeographicService;
  private aiService: GeminiAIService; // ✅ IMPORTED SERVICE

  constructor() {
    this.geographicService = new EnhancedGeographicService();
    this.aiService = new GeminiAIService(); // ✅ IMPORTED SERVICE
  }

  // ✅ MAIN: AI-enhanced recommendation method
  async generateDynamicRecommendations(
    environmentalData: EnvironmentalAnalysis,
    coordinates: Coordinates,
    rooftopArea: number,
    openSpaceArea: number,
    budget: number,
    propertyDetails: PropertyDetails
  ): Promise<{
    recommendations: SimpleRecommendation[];
    subsidyInfo: SubsidyInfo;
    detailedBreakdowns: DetailedCostBreakdown[];
    marketInfo: any;
    locationInfo: any;
    aiEnhanced?: boolean;
  }> {

    console.log('🤖 Starting AI-Enhanced Dynamic Recommendations...');

    try {
      // 1. Get location and subsidy info
      const locationInfo = await locationService.getAdministrativeContext(coordinates);
      console.log('📍 Location context:', locationInfo);

      const subsidyInfo = await this.geographicService.getSubsidyInformation(
        coordinates, budget, propertyDetails
      );
      console.log('🏛️ Subsidy information:', subsidyInfo);

      const marketModifier = await this.geographicService.getMarketModifier(coordinates);
      console.log('💰 Market modifier:', marketModifier);

      // ✅ 2. Try AI recommendation first
      try {
        console.log('🧠 Attempting AI-powered recommendation...');
        const aiRecommendation = await this.aiService.generateWaterSystemRecommendation(
          environmentalData,
          propertyDetails,
          budget + subsidyInfo.subsidyAmount,
          coordinates
        );

        console.log('✅ AI Recommendation Generated:', {
          systemName: aiRecommendation.systemName,
          suitabilityScore: aiRecommendation.suitabilityScore,
          confidence: aiRecommendation.confidence
        });

        // Generate detailed breakdowns for AI recommendation
        const detailedBreakdowns = await this.generateDetailedBreakdowns(
          [aiRecommendation],
          subsidyInfo,
          propertyDetails,
          marketModifier,
          locationInfo
        );

        return {
          recommendations: [aiRecommendation], // Single AI recommendation
          subsidyInfo,
          detailedBreakdowns,
          locationInfo,
          marketInfo: {
            regionType: this.getRegionType(locationInfo),
            marketModifier,
            stateName: locationInfo.state,
            districtName: locationInfo.district
          },
          aiEnhanced: true // ✅ AI enhancement flag
        };

      } catch (aiError) {
        console.log('⚠️ AI recommendation failed, falling back to rule-based system:', aiError);
        
        // ✅ 3. Fallback to existing rule-based system
        return this.generateRuleBasedRecommendations(
          environmentalData, coordinates, rooftopArea, openSpaceArea, 
          budget, propertyDetails, locationInfo, subsidyInfo, marketModifier
        );
      }

    } catch (error: any) {
      console.error('❌ Complete recommendation system failure:', error?.message);
      throw new Error(`Failed to generate recommendations: ${error?.message || 'Unknown error'}`);
    }
  }

  // ✅ Keep all your existing methods unchanged
  private async generateRuleBasedRecommendations(
    environmentalData: EnvironmentalAnalysis,
    coordinates: Coordinates,
    rooftopArea: number,
    openSpaceArea: number,
    budget: number,
    propertyDetails: PropertyDetails,
    locationInfo: any,
    subsidyInfo: SubsidyInfo,
    marketModifier: number
  ) {
    console.log('🔧 Using rule-based recommendation engine...');

    const optimizedComponents = this.selectOptimizedComponents(
      environmentalData, propertyDetails, budget + subsidyInfo.subsidyAmount
    );

    const recommendations = this.buildDynamicRecommendations(
      optimizedComponents, environmentalData, subsidyInfo, marketModifier, propertyDetails
    );

    const detailedBreakdowns = await this.generateDetailedBreakdowns(
      recommendations, subsidyInfo, propertyDetails, marketModifier, locationInfo
    );

    return {
      recommendations,
      subsidyInfo,
      detailedBreakdowns,
      locationInfo,
      marketInfo: {
        regionType: this.getRegionType(locationInfo),
        marketModifier,
        stateName: locationInfo.state,
        districtName: locationInfo.district
      },
      aiEnhanced: false // Rule-based fallback
    };
  }

  // ✅ ALL YOUR EXISTING METHODS - Keep unchanged
  private selectOptimizedComponents(environmentalData: EnvironmentalAnalysis, propertyDetails: PropertyDetails, availableBudget: number) {
    const rainfall = environmentalData.rainfall.annualRainfall;
    const soilType = environmentalData.soil.permeabilityClassification;
    const groundwaterDepth = environmentalData.groundwater.depth;
    const dailyNeed = propertyDetails.dailyWaterNeed;
    const annualCollection = environmentalData.waterHarvesting.rooftopHarvest;

    const optimalStorageSize = this.calculateOptimalStorage(dailyNeed, annualCollection, rainfall);
    
    const componentSets = {
      basic: this.selectBasicComponents(optimalStorageSize, rainfall, soilType, groundwaterDepth),
      performance: this.selectPerformanceComponents(optimalStorageSize, rainfall, soilType, groundwaterDepth),
      premium: this.selectPremiumComponents(optimalStorageSize, rainfall, soilType, groundwaterDepth)
    };

    return componentSets;
  }

  private calculateOptimalStorage(dailyNeed: number, annualCollection: number, rainfall: number): number {
    const baseStorage = Math.max(
      dailyNeed * 7,
      Math.min(dailyNeed * 30, annualCollection * 0.15)
    );

    if (rainfall > 1500) {
      return Math.round(baseStorage * 1.2);
    } else if (rainfall < 600) {
      return Math.round(baseStorage * 1.5);
    }
    
    return Math.round(baseStorage);
  }

  private selectBasicComponents(storageSize: number, rainfall: number, soilType: string, groundwaterDepth: number) {
    try {
      const tankComponent = COMPONENT_PRICING_DATABASE.find(c => 
        c.type === 'storage' && 
        c.category === 'basic' &&
        this.isEnvironmentallyOptimal(c, rainfall, soilType, groundwaterDepth)
      );

      const filterComponent = COMPONENT_PRICING_DATABASE.find(c => 
        c.type === 'filtration' && 
        c.category === 'basic'
      );

      const pumpComponent = COMPONENT_PRICING_DATABASE.find(c => 
        c.type === 'pumping' && 
        c.category === 'basic'
      );

      return {
        storage: { component: tankComponent, size: Math.min(storageSize, 3000) },
        filtration: { component: filterComponent },
        pumping: { component: pumpComponent },
        recharge: null,
        smart: null,
        solar: null
      };
    } catch (error) {
      return this.handleComponentError('basic', error);
    }
  }

  private selectPerformanceComponents(storageSize: number, rainfall: number, soilType: string, groundwaterDepth: number) {
    try {
      const tankComponent = COMPONENT_PRICING_DATABASE.find(c => 
        c.type === 'storage' && 
        c.category === 'performance'
      );

      const filterComponent = COMPONENT_PRICING_DATABASE.find(c => 
        c.type === 'filtration' && 
        c.category === 'performance'
      );

      const pumpComponent = COMPONENT_PRICING_DATABASE.find(c => 
        c.type === 'pumping' && 
        c.category === 'performance'
      );

      const rechargeComponent = soilType === 'High' && groundwaterDepth < 20 ? 
        COMPONENT_PRICING_DATABASE.find(c => c.type === 'recharge' && c.category === 'basic') : null;

      const smartComponent = COMPONENT_PRICING_DATABASE.find(c => 
        c.type === 'smart_features' && 
        c.category === 'performance' &&
        c.id === 'iot_basic_monitoring'
      );

      return {
        storage: { component: tankComponent, size: Math.min(storageSize, 7000) },
        filtration: { component: filterComponent },
        pumping: { component: pumpComponent },
        recharge: rechargeComponent ? { component: rechargeComponent } : null,
        smart: { component: smartComponent },
        solar: null
      };
    } catch (error) {
      return this.handleComponentError('performance', error);
    }
  }

  private selectPremiumComponents(storageSize: number, rainfall: number, soilType: string, groundwaterDepth: number) {
    try {
      const tankComponent = COMPONENT_PRICING_DATABASE.find(c => 
        c.type === 'storage' && 
        c.category === 'premium'
      );

      const filterComponent = COMPONENT_PRICING_DATABASE.find(c => 
        c.type === 'filtration' && 
        c.category === 'performance'
      );

      const pumpComponent = COMPONENT_PRICING_DATABASE.find(c => 
        c.type === 'pumping' && 
        c.category === 'performance'
      );

      const rechargeComponent = COMPONENT_PRICING_DATABASE.find(c => 
        c.type === 'recharge' && 
        c.category === 'basic'
      );

      const smartComponent = COMPONENT_PRICING_DATABASE.find(c => 
        c.id === 'iot_advanced_ai'
      );

      const solarComponent = COMPONENT_PRICING_DATABASE.find(c => 
        c.id === 'solar_basic_100w'
      );

      return {
        storage: { component: tankComponent, size: Math.min(storageSize, 12000) },
        filtration: { component: filterComponent },
        pumping: { component: pumpComponent },
        recharge: { component: rechargeComponent },
        smart: { component: smartComponent },
        solar: { component: solarComponent }
      };
    } catch (error) {
      return this.handleComponentError('premium', error);
    }
  }

  private isEnvironmentallyOptimal(component: ComponentSpecs, rainfall: number, soilType: string, groundwaterDepth: number): boolean {
    if (!component.environmentalOptimization) return true;

    const opt = component.environmentalOptimization;
    
    if (rainfall < opt.rainfallRange[0] || rainfall > opt.rainfallRange[1]) return false;
    if (!opt.soilTypes.includes(soilType)) return false;
    if (groundwaterDepth < opt.groundwaterDepthRange[0] || groundwaterDepth > opt.groundwaterDepthRange[1]) return false;
    
    return true;
  }

  private buildDynamicRecommendations(
    componentSets: any,
    environmentalData: EnvironmentalAnalysis,
    subsidyInfo: SubsidyInfo,
    marketModifier: number,
    propertyDetails: PropertyDetails
  ): SimpleRecommendation[] {
    
    const recommendations: SimpleRecommendation[] = [];

    // Build Basic System
    if (componentSets.basic && this.validateComponentSelection(componentSets.basic)) {
      const basicRec = this.buildRecommendationFromComponents(
        'basic_dynamic',
        '🌱 Environment-Optimized Basic System',
        componentSets.basic,
        environmentalData,
        subsidyInfo,
        marketModifier,
        propertyDetails,
        0.75
      );
      if (basicRec) recommendations.push(basicRec);
    }

    // Build Performance System
    if (componentSets.performance && this.validateComponentSelection(componentSets.performance)) {
      const perfRec = this.buildRecommendationFromComponents(
        'performance_dynamic',
        '🏆 High-Performance Environmental System',
        componentSets.performance,
        environmentalData,
        subsidyInfo,
        marketModifier,
        propertyDetails,
        0.90
      );
      if (perfRec) recommendations.push(perfRec);
    }

    // Build Premium System
    if (componentSets.premium && this.validateComponentSelection(componentSets.premium)) {
      const premiumRec = this.buildRecommendationFromComponents(
        'premium_dynamic',
        '💎 Premium AI-Optimized Ecosystem',
        componentSets.premium,
        environmentalData,
        subsidyInfo,
        marketModifier,
        propertyDetails,
        0.95
      );
      if (premiumRec) recommendations.push(premiumRec);
    }

    return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  private buildRecommendationFromComponents(
    systemId: string,
    systemName: string,
    components: any,
    environmentalData: EnvironmentalAnalysis,
    subsidyInfo: SubsidyInfo,
    marketModifier: number,
    propertyDetails: PropertyDetails,
    efficiency: number
  ): SimpleRecommendation | null {

    let totalComponentCost = 0;
    let totalInstallationCost = 0;
    const pros: string[] = [];
    const cons: string[] = [];

    try {
      // Calculate costs for each component
      if (components.storage) {
        const storagePrice = this.calculateComponentPrice(components.storage.component, components.storage.size, marketModifier);
        totalComponentCost += storagePrice.componentCost;
        totalInstallationCost += storagePrice.installationCost;
        pros.push(`${components.storage.size.toLocaleString()}L storage = ${Math.round(components.storage.size/propertyDetails.dailyWaterNeed)} days backup`);
      }

      if (components.filtration) {
        const filterPrice = this.calculateComponentPrice(components.filtration.component, 1, marketModifier);
        totalComponentCost += filterPrice.componentCost;
        totalInstallationCost += filterPrice.installationCost;
        pros.push(`${components.filtration.component?.category || 'Advanced'} filtration system`);
      }

      if (components.pumping) {
        const pumpPrice = this.calculateComponentPrice(components.pumping.component, 1, marketModifier);
        totalComponentCost += pumpPrice.componentCost;
        totalInstallationCost += pumpPrice.installationCost;
        pros.push(`${components.pumping.component?.category || 'Advanced'} automated pumping`);
      }

      if (components.recharge) {
        const rechargePrice = this.calculateComponentPrice(components.recharge.component, 1, marketModifier);
        totalComponentCost += rechargePrice.componentCost;
        totalInstallationCost += rechargePrice.installationCost;
        pros.push(`Groundwater recharge: ${environmentalData.waterHarvesting.groundwaterRecharge.toLocaleString()}L annually`);
      }

      if (components.smart) {
        const smartPrice = this.calculateComponentPrice(components.smart.component, 1, marketModifier);
        totalComponentCost += smartPrice.componentCost;
        totalInstallationCost += smartPrice.installationCost;
        pros.push('IoT monitoring and control');
      }

      if (components.solar) {
        const solarPrice = this.calculateComponentPrice(components.solar.component, 1, marketModifier);
        totalComponentCost += solarPrice.componentCost;
        totalInstallationCost += solarPrice.installationCost;
        pros.push('Solar-powered operation');
      }

      const totalCost = totalComponentCost + totalInstallationCost;
      const afterSubsidy = Math.max(0, totalCost - subsidyInfo.subsidyAmount);
      
      const annualCollection = Math.round(environmentalData.waterHarvesting.rooftopHarvest * efficiency);
      const storageCapacity = components.storage ? components.storage.size : 0;
      
      const suitabilityScore = this.calculateDynamicSuitabilityScore(
        totalCost, subsidyInfo.subsidyAmount, annualCollection, 
        propertyDetails.dailyWaterNeed * 365, environmentalData, propertyDetails
      );

      // Add system-specific pros and cons
      if (systemId.includes('basic')) {
        pros.unshift(`Optimized for ${environmentalData.rainfall.annualRainfall}mm rainfall`);
        pros.push('Cost-effective with government subsidy');
        cons.push('Basic automation level', 'Manual operation required');
      } else if (systemId.includes('performance')) {
        pros.unshift(`90% efficiency = ${annualCollection.toLocaleString()}L collection`);
        pros.push('Automated operation', 'Professional installation');
        cons.push('Higher investment than basic', 'Professional maintenance required');
      } else if (systemId.includes('premium')) {
        pros.unshift(`AI-optimized for ${environmentalData.soil.permeabilityClassification} soil conditions`);
        pros.push('Complete automation', 'Weather integration', 'Maximum efficiency');
        cons.push('Highest investment', 'Complex system', 'Professional setup required');
      }

      const monthlyWaterSavings = Math.round(Math.min(annualCollection / 12, propertyDetails.currentWaterCost));
      const roiYears = monthlyWaterSavings > 0 ? 
        Math.min(25, Math.round((afterSubsidy / (monthlyWaterSavings * 12)) * 10) / 10) : 25;

      return {
        systemId,
        systemName,
        description: `Dynamic system optimized for your ${environmentalData.rainfall.annualRainfall}mm rainfall, ${environmentalData.soil.permeabilityClassification} soil, and ${environmentalData.groundwater.depth}m groundwater depth. Location-specific pricing with ${subsidyInfo.subsidyPercentage}% government subsidy.`,
        suitabilityScore,
        totalCost,
        afterSubsidy,
        annualCollection,
        storageCapacity,
        roiYears,
        pros,
        cons,
        environmentalMatch: suitabilityScore,
        sustainability: {
          carbonSavings: Math.round(annualCollection * 0.0003),
          waterEfficiency: Math.round((annualCollection / (propertyDetails.dailyWaterNeed * 365)) * 100),
          energyRating: efficiency > 0.9 ? 'A+' : efficiency > 0.8 ? 'A' : 'B+'
        },
        complexity: systemId.includes('premium') ? 'complex' : systemId.includes('performance') ? 'moderate' : 'simple',
        recommendedFor: [propertyDetails.propertyType, `${environmentalData.rainfall.annualRainfall}mm rainfall region`]
      };

    } catch (error) {
      console.error('❌ Error building recommendation:', error);
      return null;
    }
  }

  private calculateDynamicSuitabilityScore(
    totalCost: number,
    subsidyAmount: number,
    annualCollection: number,
    annualNeed: number,
    environmentalData: EnvironmentalAnalysis,
    propertyDetails: PropertyDetails
  ): number {
    let score = 50;

    // Budget efficiency (30 points)
    const effectiveCost = totalCost - subsidyAmount;
    const budgetRatio = effectiveCost / (propertyDetails.currentWaterCost * 12 * 3);
    if (budgetRatio <= 1) score += 30;
    else if (budgetRatio <= 1.5) score += 20;
    else if (budgetRatio <= 2) score += 10;

    // Water needs coverage (25 points)
    const coverageRatio = annualCollection / annualNeed;
    if (coverageRatio >= 0.8) score += 25;
    else if (coverageRatio >= 0.6) score += 20;
    else if (coverageRatio >= 0.4) score += 15;
    else score += 10;

    // Environmental optimization (25 points)
    const rainfallScore = environmentalData.rainfall.annualRainfall > 800 ? 10 : 5;
    const soilScore = environmentalData.soil.permeabilityClassification === 'High' ? 8 : 5;
    const groundwaterScore = environmentalData.groundwater.depth < 15 ? 7 : 4;
    score += rainfallScore + soilScore + groundwaterScore;

    // Property compatibility (20 points)
    if (propertyDetails.propertyType === 'individual_house') score += 15;
    else if (propertyDetails.propertyType === 'villa') score += 20;
    else score += 10;

    return Math.min(100, Math.max(60, Math.round(score)));
  }

  private calculateComponentPrice(component: ComponentSpecs | undefined, size: number, marketModifier: number) {
    // Handle null/undefined components
    if (!component) {
      console.warn('⚠️ Component is null/undefined');
      return {
        componentCost: 0,
        installationCost: 0,
        selectedBrand: { name: 'Unknown', model: 'N/A', priceMultiplier: 1, rating: 0, warranty: '0 years', availability: 'low' as const }
      };
    }

    // Select best available brand (highest rating with good availability)
    const availableBrands = component.brands.filter(b => b.availability !== 'low');
    if (availableBrands.length === 0) {
      console.warn('⚠️ No available brands for component:', component.name);
      // Fallback to all brands if none are available
      availableBrands.push(...component.brands);
    }

    const selectedBrand = availableBrands.reduce((best, current) => 
      current.rating > best.rating && current.availability !== 'low' ? current : best
    );

    let componentCost = component.basePrice;
    
    // Add per-unit pricing for tanks (if size-based pricing)
    if (component.pricePerUnit && size > 1000) {
      componentCost = component.pricePerUnit * size;
    }

    // Apply brand multiplier
    componentCost *= selectedBrand.priceMultiplier;
    
    // Apply market modifier (regional pricing)
    componentCost *= marketModifier;
    
    // Calculate installation cost
    const installationCost = component.installation.baseCost * marketModifier;

    return {
      componentCost: Math.round(componentCost),
      installationCost: Math.round(installationCost),
      selectedBrand
    };
  }

  // ✅ Enhanced features
  calculateEnvironmentalImpact(annualCollection: number, groundwaterRecharge: number) {
    const carbonPerLiter = 0.0003;
    const carbonSaved = Math.round(annualCollection * carbonPerLiter * 100) / 100;
    const treesEquivalent = Math.round((carbonSaved / 22) * 10) / 10;

    return {
      carbonSaved,
      treesEquivalent,
      municipalWaterSaved: annualCollection,
      groundwaterContribution: groundwaterRecharge
    };
  }

  generateMaintenanceSchedule(components: any) {
    const schedule = {
      monthly: ['Clean gutters and downspouts', 'Check first flush diverter'],
      quarterly: ['Inspect tank for algae', 'Clean mesh filters'],
      biannual: ['Service pumps', 'Check electrical connections'],
      annual: ['Professional system inspection', 'Water quality testing']
    };

    if (components.smart) {
      schedule.monthly.push('Check IoT sensor readings');
      schedule.quarterly.push('Update system software');
    }

    if (components.solar) {
      schedule.monthly.push('Clean solar panels');
      schedule.biannual.push('Check battery health');
    }

    if (components.recharge) {
      schedule.quarterly.push('Clear recharge pit of debris');
      schedule.annual.push('Inspect infiltration rates');
    }

    return schedule;
  }

  matchSuppliersToSystem(coordinates: Coordinates, systemType: 'basic' | 'performance' | 'premium', components: any) {
    const baseSuppliers = [
      {
        name: 'EcoWater Solutions Pvt Ltd',
        location: 'Local Area',
        distance: 5.2,
        rating: 4.3,
        contact: '+91-9876543210',
        email: 'info@ecowatersolutions.in',
        services: ['Design', 'Installation', 'Maintenance'],
        specialization: ['Residential RWH', 'Environmental Compliance'],
        experience: 8,
        availability: 'available' as const
      },
      {
        name: 'Green Harvest Systems',
        location: 'City Center',
        distance: 8.7,
        rating: 4.1,
        contact: '+91-9876543211',
        email: 'contact@greenharvest.co.in',
        services: ['Installation', 'Components', 'IoT Setup'],
        specialization: ['Smart Systems', 'Solar Integration'],
        experience: 6,
        availability: 'available' as const
      }
    ];

    if (systemType === 'premium') {
      baseSuppliers.push({
        name: 'SmartWater Technologies',
        location: 'Tech Park',
        distance: 12.3,
        rating: 4.6,
        contact: '+91-9876543212',
        email: 'solutions@smartwater.tech',
        services: ['AI Systems', 'IoT Installation', 'Smart Monitoring'],
        specialization: ['Premium Systems', 'AI Integration', 'Remote Monitoring'],
        experience: 10,
        availability: 'available' as const
      });
    }

    return baseSuppliers;
  }

  generateCostOptimizations(recommendation: SimpleRecommendation, subsidyInfo: SubsidyInfo, budget: number) {
    const suggestions: string[] = [];
    let potentialSavings = 0;
    const alternativeFinancing: string[] = [];

    if (recommendation.afterSubsidy > budget * 1.2) {
      suggestions.push('Consider phased installation to spread costs');
      suggestions.push('Opt for DIY-friendly components to reduce labor costs');
      potentialSavings += Math.round(recommendation.totalCost * 0.15);
    }

    if (recommendation.afterSubsidy > budget * 0.8) {
      suggestions.push('Explore additional government schemes');
      suggestions.push('Consider bank financing at low interest rates');
      alternativeFinancing.push('SBI Green Loan: 8.5% interest');
      alternativeFinancing.push('HDFC Eco-friendly Loan: 9% interest');
    }

    if (recommendation.storageCapacity > 5000) {
      suggestions.push('Consider modular tanks for easier installation');
      potentialSavings += 3000;
    }

    return { suggestions, potentialSavings, alternativeFinancing };
  }

  assessImplementationRisks(coordinates: Coordinates, components: any, environmentalData: EnvironmentalAnalysis) {
    const risks: { type: string; level: 'low' | 'medium' | 'high'; mitigation: string }[] = [];

    if (environmentalData.rainfall.annualRainfall > 2000) {
      risks.push({
        type: 'Overflow Risk',
        level: 'medium',
        mitigation: 'Install adequate overflow management and larger storage'
      });
    }

    if (environmentalData.soil.permeabilityClassification === 'Low') {
      risks.push({
        type: 'Poor Recharge',
        level: 'medium',
        mitigation: 'Focus on storage systems rather than recharge'
      });
    }

    if (environmentalData.groundwater.depth > 30) {
      risks.push({
        type: 'High Pumping Costs',
        level: 'high',
        mitigation: 'Consider surface storage with gravity-fed distribution'
      });
    }

    if (components.smart && components.solar) {
      risks.push({
        type: 'Technical Complexity',
        level: 'medium',
        mitigation: 'Ensure professional installation and training'
      });
    }

    const highRisks = risks.filter(r => r.level === 'high').length;
    const mediumRisks = risks.filter(r => r.level === 'medium').length;
    
    let overallRisk: 'low' | 'medium' | 'high';
    if (highRisks > 1 || (highRisks === 1 && mediumRisks > 2)) overallRisk = 'high';
    else if (highRisks === 1 || mediumRisks > 1) overallRisk = 'medium';
    else overallRisk = 'low';

    return { risks, overallRisk };
  }

  predictSystemPerformance(recommendation: SimpleRecommendation, environmentalData: EnvironmentalAnalysis, propertyDetails: PropertyDetails) {
    const monthlyPerformance = [];
    const seasonalFactors = {
      monsoon: 2.5,
      postMonsoon: 0.8,
      winter: 0.3,
      preMonsoon: 0.7
    };

    for (let month = 0; month < 12; month++) {
      let factor = seasonalFactors.winter;
      if (month >= 5 && month <= 8) factor = seasonalFactors.monsoon;
      else if (month >= 9 && month <= 11) factor = seasonalFactors.postMonsoon;
      else if (month >= 2 && month <= 4) factor = seasonalFactors.preMonsoon;

      const monthlyCollection = Math.round((recommendation.annualCollection / 12) * factor);
      const storageUtilization = Math.min(100, (monthlyCollection / recommendation.storageCapacity) * 100);
      const efficiency = Math.min(95, 70 + (monthlyCollection / 1000));

      monthlyPerformance.push({
        month: month + 1,
        collection: monthlyCollection,
        storageUtilization: Math.round(storageUtilization),
        waterAvailability: Math.min(100, (monthlyCollection / propertyDetails.dailyWaterNeed / 30) * 100),
        efficiency: Math.round(efficiency)
      });
    }

    return {
      monthlyPerformance,
      annualSummary: {
        totalCollection: recommendation.annualCollection,
        averageMonthly: Math.round(recommendation.annualCollection / 12),
        peakMonth: Math.max(...monthlyPerformance.map(m => m.collection)),
        leanMonth: Math.min(...monthlyPerformance.map(m => m.collection)),
        variability: Math.round((Math.max(...monthlyPerformance.map(m => m.collection)) / Math.min(...monthlyPerformance.map(m => m.collection))) * 10) / 10
      }
    };
  }

  exportSystemConfiguration(recommendation: SimpleRecommendation) {
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      system: recommendation,
      configuration: {
        exportedBy: 'JalNiti AI-Enhanced Recommendations Engine',
        format: 'JSON'
      }
    };
  }

  private getRegionType(locationInfo: any): string {
    if (!locationInfo || !locationInfo.district) {
      return 'tier2';
    }

    const district = locationInfo.district.toUpperCase();
    
    const metros = [
      'MUMBAI', 'DELHI', 'NEW DELHI', 'BENGALURU', 'BANGALORE', 
      'CHENNAI', 'KOLKATA', 'HYDERABAD', 
      'PUNE', 'GURUGRAM', 'GURGAON', 'NOIDA'
    ];
    if (metros.some(metro => district.includes(metro))) {
      return 'metro';
    }
    
    const majorCities = [
      'AHMEDABAD', 'SURAT', 'LUCKNOW', 'KANPUR', 'JAIPUR', 'INDORE',
      'NAGPUR', 'VISAKHAPATNAM', 'BHOPAL', 'PATNA', 'VADODARA',
      'KOCHI', 'COIMBATORE', 'MADURAI', 'AGRA', 'NASHIK'
    ];
    if (majorCities.some(city => district.includes(city))) {
      return 'tier1';
    }
    
    return 'tier3';
  }

  private async generateDetailedBreakdowns(
    recommendations: SimpleRecommendation[],
    subsidyInfo: SubsidyInfo,
    propertyDetails: PropertyDetails,
    marketModifier: number,
    locationInfo: any
  ): Promise<DetailedCostBreakdown[]> {
    
    console.log('📊 Generating detailed cost breakdowns for', recommendations.length, 'recommendations');
    
    return recommendations.map((rec, index) => {
      const supplyRatio = rec.annualCollection / (propertyDetails.dailyWaterNeed * 365);
      const monthlyWaterSavings = Math.round(Math.min(supplyRatio, 1) * propertyDetails.currentWaterCost);
      const annualSavings = monthlyWaterSavings * 12;
      const roiYears = rec.afterSubsidy > 0 && monthlyWaterSavings > 0 ? 
        Math.min(25, Math.round((rec.afterSubsidy / annualSavings) * 10) / 10) : 25;
      const breakEvenMonth = monthlyWaterSavings > 0 ? 
        Math.min(300, Math.round(rec.afterSubsidy / monthlyWaterSavings)) : 300;
      
      const componentBreakdown = this.generateComponentBreakdown(rec, index);
      
      return {
        systemName: rec.systemName,
        location: {
          state: locationInfo.state || 'Unknown',
          district: locationInfo.district || 'Unknown',
          confidence: 'high'
        },
        components: componentBreakdown,
        subtotals: {
          components: Math.round(rec.totalCost * 0.75),
          installation: Math.round(rec.totalCost * 0.25),
          civilWork: Math.round(rec.totalCost * 0.05),
          permits: Math.round(rec.totalCost * 0.02),
          total: rec.totalCost
        },
        subsidy: {
          scheme: subsidyInfo.schemeName,
          amount: subsidyInfo.subsidyAmount,
          percentage: subsidyInfo.subsidyPercentage,
          eligibility: subsidyInfo.eligibilityCriteria,
          contactInfo: subsidyInfo.contactInfo
        },
        finalCost: rec.afterSubsidy,
        financing: {
          emi12: Math.round(rec.afterSubsidy / 12),
          emi24: Math.round(rec.afterSubsidy / 24),
          emi36: Math.round(rec.afterSubsidy / 36),
          bankLoans: [
            {
              name: 'SBI Green Loan',
              interestRate: 8.5,
              maxAmount: 500000,
              tenure: 60
            },
            {
              name: 'HDFC Eco Loan',
              interestRate: 9.0,
              maxAmount: 300000,
              tenure: 48
            }
          ],
          governmentSchemes: [
            {
              name: 'PM Surya Ghar Yojana',
              interestRate: 7.0,
              maxAmount: 200000,
              eligibility: ['Residential property', 'Valid electricity connection']
            }
          ]
        },
        savings: {
          monthlyWaterSavings,
          annualSavings,
          roiYears,
          breakEvenMonth,
          cumulativeSavings: {
            year1: annualSavings,
            year5: annualSavings * 5,
            year10: annualSavings * 10
          },
          maintenanceCosts: Math.round(rec.totalCost * 0.02),
          netSavings: annualSavings - Math.round(rec.totalCost * 0.02)
        },
        marketInfo: {
          regionType: this.getRegionType(locationInfo),
          priceModifier: marketModifier,
          localFactors: [
            `${locationInfo.state || 'Regional'} market rates applied`,
            `${locationInfo.district || 'Local'} supplier availability`,
            `Installation costs for ${this.getRegionType(locationInfo)} region`
          ],
          competitiveness: 'medium' as const,
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        timeline: {
          design: { duration: '1-2 weeks', activities: ['Site survey', 'System design'], deliverables: ['Design drawings', 'Component list'] },
          procurement: { duration: '2-3 weeks', activities: ['Component sourcing'], leadTimes: {} },
          installation: { duration: '1-2 weeks', activities: ['Component installation'], requirements: ['Site access'], phases: ['Foundation', 'Assembly', 'Testing'] },
          commissioning: { duration: '3-5 days', activities: ['System testing'], testingRequired: ['Flow test', 'Quality check'] },
          total: { duration: '4-7 weeks', criticalPath: ['Design', 'Procurement'], bufferTime: '1 week' },
          milestones: [
            { name: 'Design Approval', date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), deliverables: ['Final design', 'Component specifications'] },
            { name: 'Procurement Complete', date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(), deliverables: ['All components', 'Quality certificates'] },
            { name: 'Installation Complete', date: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000).toISOString(), deliverables: ['System installed', 'Testing completed'] }
          ],
          dependencies: ['Site access', 'Component availability', 'Weather conditions'],
          risks: ['Weather delays', 'Component delivery delays', 'Site preparation issues']
        },
        riskAssessment: {
          risks: [],
          overallRisk: 'low' as const,
          riskScore: 25,
          recommendations: ['Standard installation practices'],
          contingencyBudget: Math.round(rec.totalCost * 0.1)
        },
        performancePrediction: {
          monthlyPerformance: [],
          annualSummary: {
            totalCollection: rec.annualCollection,
            averageMonthly: Math.round(rec.annualCollection / 12),
            peakMonth: Math.round(rec.annualCollection * 0.3),
            leanMonth: Math.round(rec.annualCollection * 0.05),
            variability: 2.5
          },
          seasonalAnalysis: {
            monsoon: { collection: Math.round(rec.annualCollection * 0.4), efficiency: 85 },
            postMonsoon: { collection: Math.round(rec.annualCollection * 0.2), efficiency: 75 },
            winter: { collection: Math.round(rec.annualCollection * 0.1), efficiency: 60 },
            preMonsoon: { collection: Math.round(rec.annualCollection * 0.3), efficiency: 70 }
          }
        }
      };
    });
  }

  private generateComponentBreakdown(rec: SimpleRecommendation, systemIndex: number) {
    const systemTypes = ['basic', 'performance', 'premium'];
    const systemType = systemTypes[systemIndex] || 'basic';
    
    const baseComponents: any = {
      storage: { 
        item: `${rec.storageCapacity}L Storage Tank`, 
        brand: systemType === 'premium' ? 'Graf Modular System' : 
               systemType === 'performance' ? 'Sintex AS-Pro Series' : 'Sintex AS Series',
        price: Math.round(rec.totalCost * (systemType === 'basic' ? 0.45 : 0.35)), 
        installation: Math.round(rec.totalCost * 0.08),
        warranty: systemType === 'premium' ? '10 years' : '5 years'
      },
      filtration: { 
        item: systemType === 'premium' ? 'Advanced RO+UV System' :
              systemType === 'performance' ? 'Multi-stage UV System' : 'Basic First Flush Diverter',
        brand: systemType === 'premium' ? 'Kent RO-RWH System' :
               systemType === 'performance' ? 'Aquaguard RWH-Pro' : 'Rainy Filters RF-Basic',
        price: Math.round(rec.totalCost * (systemType === 'basic' ? 0.15 : systemType === 'performance' ? 0.20 : 0.25)), 
        installation: Math.round(rec.totalCost * 0.04),
        warranty: systemType === 'premium' ? '5 years' : '3 years'
      }
    };

    if (systemType === 'performance' || systemType === 'premium') {
      baseComponents['pumping'] = {
        item: systemType === 'premium' ? 'Smart Variable Speed Pump' : 'Automated Pump System',
        brand: systemType === 'premium' ? 'Grundfos Smart Series' : 'Crompton Smart Sapphire',
        price: Math.round(rec.totalCost * 0.15),
        installation: Math.round(rec.totalCost * 0.05),
        warranty: '3 years'
      };
    }

    if (systemType === 'premium') {
      baseComponents['smart'] = {
        item: 'AI IoT Control System',
        brand: 'SmartWater Pro AI-Controller',
        price: Math.round(rec.totalCost * 0.12),
        installation: Math.round(rec.totalCost * 0.04),
        warranty: '2 years'
      };

      baseComponents['solar'] = {
        item: '100W Solar Power System',
        brand: 'Luminous Solar-Climate-150W',
        price: Math.round(rec.totalCost * 0.18),
        installation: Math.round(rec.totalCost * 0.03),
        warranty: '10 years'
      };
    }

    return baseComponents;
  }

  private handleComponentError(componentType: string, error: any) {
    console.error(`❌ Error selecting ${componentType} component:`, error?.message || 'Unknown error');
    return null;
  }

  private validateComponentSelection(components: any): boolean {
    const required = ['storage', 'filtration'];
    const missing = required.filter(type => !components[type] || !components[type].component);
    
    if (missing.length > 0) {
      console.warn('⚠️ Missing required components:', missing);
      return false;
    }
    
    return true;
  }
}
