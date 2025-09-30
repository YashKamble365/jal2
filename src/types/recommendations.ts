// src/types/recommendations.ts - COMPLETE DYNAMIC RECOMMENDATIONS TYPES
export interface PropertyDetails {
    propertyType: 'individual_house' | 'apartment' | 'villa' | 'commercial' | 'institutional' | 'farmhouse';
    occupants: number;
    dailyWaterNeed: number;
    primaryUse: 'drinking_cooking' | 'non_potable' | 'mixed' | 'irrigation' | 'industrial';
    existingWaterSource: 'municipal' | 'borewell' | 'tanker' | 'mixed' | 'none';
    currentWaterCost: number;
    preferredSystem: 'storage_priority' | 'recharge_priority' | 'balanced' | 'cost_effective' | 'premium';
    hasPowerBackup: boolean;
    maintenancePreference: 'diy' | 'professional' | 'low_maintenance' | 'automated';
    // ✅ NEW: Dynamic property attributes
    plotSize?: number;
    buildingAge?: number;
    familyIncome?: 'low' | 'medium' | 'high' | 'premium';
    sustainabilityFocus?: boolean;
    technologyAdoption?: 'conservative' | 'moderate' | 'early_adopter';
  }
  
  export interface SimpleRecommendation {
    systemId: string;
    systemName: string;
    description: string;
    suitabilityScore: number;
    totalCost: number;
    afterSubsidy: number;
    annualCollection: number;
    storageCapacity: number;
    roiYears: number;
    pros: string[];
    cons: string[];
    // ✅ NEW: Enhanced recommendation features
    environmentalMatch: number;
    smartFeatures?: string[];
    sustainability: {
      carbonSavings: number;
      waterEfficiency: number;
      energyRating: 'A+' | 'A' | 'B+' | 'B' | 'C';
    };
    complexity: 'simple' | 'moderate' | 'complex';
    recommendedFor: string[];
    // ✅ NEW: Additional properties used in the service
    confidence?: number;
    systemType?: string;
  }
  
  export interface SubsidyInfo {
    isEligible: boolean;
    schemeName: string;
    subsidyAmount: number;
    subsidyPercentage: number;
    maxSubsidy: number;
    eligibilityCriteria: string[];
    applicationProcess: string;
    documentsRequired: string[];
    // ✅ NEW: Enhanced subsidy information
    processingTime: string;
    applicationFee?: number;
    renewalRequired?: boolean;
    conditions?: string[];
    contactInfo?: {
      department: string;
      phone: string;
      website: string;
      email?: string;
      address?: string;
      officerName?: string;
    };
  }
  
  export interface DetailedCostBreakdown {
    systemName: string;
    location: {
      state: string;
      district: string;
      confidence: string;
      pincode?: string;
    };
    components: {
      storage: { item: string; brand: string; price: number; installation: number; warranty: string; };
      filtration: { item: string; brand: string; price: number; installation: number; warranty: string; };
      pumping?: { item: string; brand: string; price: number; installation: number; warranty: string; };
      recharge?: { item: string; brand: string; price: number; installation: number; warranty: string; };
      smart?: { item: string; brand: string; price: number; installation: number; warranty: string; };
      solar?: { item: string; brand: string; price: number; installation: number; warranty: string; };
      // ✅ NEW: Additional components
      piping?: { item: string; brand: string; price: number; installation: number; warranty: string; };
      electrical?: { item: string; brand: string; price: number; installation: number; warranty: string; };
      civilWork?: { item: string; brand: string; price: number; installation: number; warranty: string; };
    };
    subtotals: {
      components: number;
      installation: number;
      civilWork: number;
      permits: number;
      total: number;
    };
    subsidy: {
      scheme: string;
      amount: number;
      percentage: number;
      eligibility: string[];
      contactInfo: any;
    };
    finalCost: number;
    financing: {
      emi12: number;
      emi24: number;
      emi36: number;
      emi48?: number;
      emi60?: number;
      // ✅ NEW: Enhanced financing options
      bankLoans: {
        name: string;
        interestRate: number;
        maxAmount: number;
        tenure: number;
      }[];
      governmentSchemes: {
        name: string;
        interestRate: number;
        maxAmount: number;
        eligibility: string[];
      }[];
    };
    savings: {
      monthlyWaterSavings: number;
      annualSavings: number;
      roiYears: number;
      breakEvenMonth: number;
      // ✅ NEW: Enhanced savings metrics
      cumulativeSavings: {
        year1: number;
        year5: number;
        year10: number;
      };
      maintenanceCosts: number;
      netSavings: number;
    };
    marketInfo: {
      regionType: string;
      priceModifier: number;
      localFactors: string[];
      competitiveness: 'high' | 'medium' | 'low';
      priceValidUntil: string;
    };
    // ✅ NEW: Additional breakdown features
    timeline: InstallationTimeline;
    riskAssessment: RiskAssessment;
    performancePrediction: PerformancePrediction;
  }
  
  export interface ComponentBrand {
    name: string;
    model: string;
    priceMultiplier: number;
    rating: number;
    warranty: string;
    availability: 'high' | 'medium' | 'low';
    // ✅ NEW: Enhanced brand information
    marketShare?: number;
    serviceNetwork?: 'national' | 'regional' | 'local';
    customerSupport?: 'excellent' | 'good' | 'average';
    sparePartsAvailability?: 'high' | 'medium' | 'low';
  }
  
  export interface ComponentSpecs {
    id: string;
    name: string;
    type: 'storage' | 'filtration' | 'pumping' | 'piping' | 'recharge' | 'smart_features' | 'solar' | 'electrical';
    category: 'basic' | 'performance' | 'premium' | 'luxury';
    basePrice: number;
    pricePerUnit?: number;
    specifications: string[];
    brands: ComponentBrand[];
    installation: {
      complexity: 'simple' | 'moderate' | 'complex';
      baseCost: number;
      timeHours: number;
      skillLevel: 'basic' | 'intermediate' | 'expert';
      toolsRequired: string[];
    };
    maintenance: {
      frequency: string;
      annualCost: number;
      diyFriendly: boolean;
      expertRequired?: boolean;
      sparePartsCost?: number;
    };
    environmentalOptimization?: {
      rainfallRange: [number, number];
      soilTypes: string[];
      groundwaterDepthRange: [number, number];
      climateZones?: string[];
      idealConditions?: string[];
    };
    // ✅ NEW: Enhanced component features
    lifespan: number;
    energyConsumption?: number;
    carbonFootprint?: number;
    recyclingInfo?: string;
    certifications?: string[];
  }
  
  // ✅ NEW: Performance Prediction Interface
  export interface PerformancePrediction {
    monthlyPerformance: {
      month: number;
      collection: number;
      storageUtilization: number;
      waterAvailability: number;
      efficiency: number;
    }[];
    annualSummary: {
      totalCollection: number;
      averageMonthly: number;
      peakMonth: number;
      leanMonth: number;
      variability: number;
    };
    seasonalAnalysis: {
      monsoon: { collection: number; efficiency: number; };
      postMonsoon: { collection: number; efficiency: number; };
      winter: { collection: number; efficiency: number; };
      preMonsoon: { collection: number; efficiency: number; };
    };
  }
  
  // ✅ NEW: Risk Assessment Interface
  export interface RiskAssessment {
    risks: {
      type: string;
      level: 'low' | 'medium' | 'high' | 'critical';
      probability: number;
      impact: number;
      mitigation: string;
      cost?: number;
    }[];
    overallRisk: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    recommendations: string[];
    contingencyBudget: number;
  }
  
  // ✅ NEW: Environmental Impact Interface
  export interface EnvironmentalImpact {
    carbonSaved: number;
    treesEquivalent: number;
    municipalWaterSaved: number;
    groundwaterContribution: number;
    energySaved?: number;
    wasteReduced?: number;
    biodiversityImpact?: 'positive' | 'neutral' | 'negative';
    sustainabilityScore: number;
  }
  
  // ✅ NEW: Maintenance Schedule Interface
  export interface MaintenanceSchedule {
    monthly: string[];
    quarterly: string[];
    biannual: string[];
    annual: string[];
    emergency: string[];
    costs: {
      monthly: number;
      quarterly: number;
      biannual: number;
      annual: number;
      total: number;
    };
    diyTasks: string[];
    professionalTasks: string[];
  }
  
  // ✅ NEW: Cost Optimization Interface
  export interface CostOptimization {
    suggestions: string[];
    potentialSavings: number;
    alternativeFinancing: string[];
    phaseImplementation?: {
      phase1: { items: string[]; cost: number; timeline: string; };
      phase2?: { items: string[]; cost: number; timeline: string; };
      phase3?: { items: string[]; cost: number; timeline: string; };
    };
    discountOpportunities: {
      seasonal: string[];
      bulk: string[];
      government: string[];
    };
  }
  
  export interface SupplierInfo {
    name: string;
    location: string;
    distance: number;
    rating: number;
    contact: string;
    email?: string;
    website?: string;
    services: string[];
    specialization: string[];
    certifications: string[];
    experience: number;
    availability: 'available' | 'busy' | 'unavailable';
    // ✅ NEW: Enhanced supplier information
    teamSize?: number;
    projectsCompleted?: number;
    averageProjectCost?: number;
    customerReviews?: {
      rating: number;
      count: number;
      highlights: string[];
    };
    insurance?: boolean;
    warranty?: {
      installation: string;
      components: string;
      service: string;
    };
    paymentTerms?: string[];
  }
  
  export interface MarketInfo {
    regionType: 'metro' | 'tier1' | 'tier2' | 'tier3' | 'rural';
    marketModifier: number;
    stateName: string;
    districtName: string;
    localFactors: string[];
    competitiveness: 'high' | 'medium' | 'low';
    averageSystemCost: {
      basic: number;
      performance: number;
      premium: number;
      luxury?: number;
    };
    // ✅ NEW: Enhanced market information
    marketTrends: {
      priceDirection: 'increasing' | 'stable' | 'decreasing';
      demandLevel: 'high' | 'medium' | 'low';
      seasonalVariation: number;
    };
    supplierDensity: 'high' | 'medium' | 'low';
    governmentIncentives: string[];
    regulatoryCompliance: string[];
  }
  
  export interface InstallationTimeline {
    design: {
      duration: string;
      activities: string[];
      deliverables: string[];
    };
    procurement: {
      duration: string;
      activities: string[];
      leadTimes: { [component: string]: string };
    };
    installation: {
      duration: string;
      activities: string[];
      requirements: string[];
      phases: string[];
    };
    commissioning: {
      duration: string;
      activities: string[];
      testingRequired: string[];
    };
    total: {
      duration: string;
      criticalPath: string[];
      bufferTime: string;
    };
    // ✅ NEW: Enhanced timeline features
    milestones: {
      name: string;
      date: string;
      deliverables: string[];
    }[];
    dependencies: string[];
    risks: string[];
  }
  
  export interface FinancingOptions {
    emi: {
      months12: number;
      months24: number;
      months36: number;
      months48?: number;
      months60?: number;
    };
    interestRates: {
      bank: number;
      nbfc: number;
      government: number;
      manufacturer?: number;
    };
    processingFees: {
      bank: number;
      nbfc: number;
      government?: number;
    };
    eligibility: {
      minIncome: number;
      creditScore: number;
      documents: string[];
      collateral?: string[];
    };
    // ✅ NEW: Enhanced financing
    schemes: {
      name: string;
      provider: string;
      interestRate: number;
      maxAmount: number;
      tenure: number;
      eligibility: string[];
      benefits: string[];
    }[];
    subsidyIntegration: boolean;
    flexiblePayment: boolean;
  }
  
  export interface SystemPerformance {
    efficiency: {
      collection: number;
      storage: number;
      distribution: number;
      overall: number;
      seasonal: {
        monsoon: number;
        winter: number;
        summer: number;
      };
    };
    maintenance: {
      frequency: string;
      annualCost: number;
      diyTasks: string[];
      professionalTasks: string[];
      criticalTasks: string[];
    };
    monitoring: {
      iotEnabled: boolean;
      parameters: string[];
      alertSystem: boolean;
      mobileApp: boolean;
      cloudIntegration?: boolean;
      dataAnalytics?: boolean;
    };
    // ✅ NEW: Enhanced performance metrics
    reliability: {
      uptime: number;
      failureRate: number;
      meanTimeRepair: string;
    };
    scalability: {
      expandable: boolean;
      maxCapacity: number;
      upgradeOptions: string[];
    };
  }
  
  export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
    // ✅ NEW: Enhanced validation
    score: number;
    criticalIssues: string[];
    optimizationOpportunities: string[];
    complianceStatus: {
      building: boolean;
      environment: boolean;
      safety: boolean;
    };
  }
  
  export interface RecommendationError {
    code: string;
    message: string;
    details?: any;
    suggestions: string[];
    // ✅ NEW: Enhanced error handling
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'data' | 'calculation' | 'component' | 'market' | 'subsidy';
    recoverable: boolean;
    fallbackOptions?: string[];
  }
  
  // ✅ NEW: Complete Dynamic Recommendation Response
  export interface DynamicRecommendationResponse {
    recommendations: SimpleRecommendation[];
    subsidyInfo: SubsidyInfo;
    detailedBreakdowns: DetailedCostBreakdown[];
    marketInfo: MarketInfo;
    locationInfo: {
      state: string;
      district: string;
      confidence: string;
      pincode?: string;
      climate?: string;
    };
    // ✅ NEW: Enhanced response features
    waterAnalysis: WaterAnalysis;
    performanceMetrics: SystemPerformance;
    suppliers: SupplierInfo[];
    timeline: InstallationTimeline;
    financing: FinancingOptions;
    validation: ValidationResult;
    environmentalImpact: EnvironmentalImpact;
    riskAssessment: RiskAssessment;
    maintenanceSchedule: MaintenanceSchedule;
    costOptimizations: CostOptimization;
    performancePrediction: PerformancePrediction;
    errors?: RecommendationError[];
    metadata: {
      generatedAt: string;
      version: string;
      processingTime: number;
      dataSource: string[];
      confidence: number;
    };
  }
  
  export interface WaterAnalysis {
    potential: {
      annualCollection: number;
      dailyAverage: number;
      groundwaterRecharge: number;
      totalWaterManagement: number;
      peakDailyCollection: number;
      monsoonCollection: number;
      // ✅ NEW: Enhanced potential analysis
      seasonalVariation: number;
      reliabilityFactor: number;
      qualityScore: number;
    };
    requirements: {
      dailyNeed: number;
      annualNeed: number;
      supplyRatio: number;
      gapAnalysis: 'surplus' | 'deficit' | 'balanced';
      monthlyGap: number;
      // ✅ NEW: Enhanced requirements
      peakDemandMonth: number;
      minimumDemandMonth: number;
      bufferRequirement: number;
    };
    storage: {
      recommended: number;
      minimum: number;
      optimal: number;
      // ✅ NEW: Enhanced storage analysis
      costEffective: number;
      premium: number;
      modular: boolean;
    };
    recharge: {
      potential: number;
      benefit: 'high' | 'medium' | 'low';
      soilSuitability: string;
      // ✅ NEW: Enhanced recharge analysis
      infiltrationRate: number;
      aquiferType: string;
      rechargeEfficiency: number;
    };
    environmental: {
      rainfall: any;
      soil: any;
      groundwater: any;
      confidence: {
        overall: number;
        rainfall: number;
        soil: number;
        groundwater: number;
      };
      // ✅ NEW: Enhanced environmental data
      climateRisk: 'low' | 'medium' | 'high';
      adaptationRequired: boolean;
      sustainability: number;
    };
  }
  
  export interface RecommendationRequest {
    environmentalData: any;
    coordinates: { lat: number; lng: number };
    rooftopArea: number;
    openSpaceArea: number;
    budget: number;
    propertyDetails: PropertyDetails;
    preferences?: {
      preferredBrands?: string[];
      prioritizeLocal?: boolean;
      ecoFriendly?: boolean;
      smartFeatures?: boolean;
      // ✅ NEW: Enhanced preferences
      automationLevel?: 'manual' | 'semi_auto' | 'full_auto';
      qualityTier?: 'budget' | 'standard' | 'premium' | 'luxury';
      timelineFlexibility?: 'urgent' | 'normal' | 'flexible';
      maintenanceCapability?: 'minimal' | 'moderate' | 'high';
    };
    // ✅ NEW: Additional request features
    constraints?: {
      structural?: string[];
      regulatory?: string[];
      financial?: string[];
      environmental?: string[];
    };
    futureExpansion?: {
      planned: boolean;
      timeframe?: string;
      requirements?: string[];
    };
  }
  
  // ✅ NEW: System Comparison Interface
  export interface SystemComparison {
    comparison: {
      metric: string;
      basic?: number | string;
      performance?: number | string;
      premium?: number | string;
      luxury?: number | string;
    }[];
    winner: {
      costEffective: string;
      performance: string;
      sustainability: string;
      overall: string;
    };
    recommendations: {
      bestFor: { [userType: string]: string };
      avoided: { system: string; reason: string }[];
    };
  }
  
  // ✅ NEW: Analytics and Insights
  export interface RecommendationAnalytics {
    userBehavior: {
      preferredSystems: string[];
      budgetDistribution: { [range: string]: number };
      popularFeatures: string[];
    };
    marketInsights: {
      regionalTrends: { [region: string]: any };
      priceMovements: { [period: string]: number };
      demandPatterns: { [season: string]: number };
    };
    performanceMetrics: {
      recommendationAccuracy: number;
      userSatisfaction: number;
      implementationSuccess: number;
    };
  }
