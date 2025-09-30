// types/environmental.ts
import { CGWBPrincipalAquifer } from './aquifer';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RainfallData {
  annualRainfall: number;
  monthlyAverage: number;
  seasonalPattern: {
    monsoon: number;
    postMonsoon: number;
    winter: number;
    preMonsoon: number;
  };
  governmentValidation?: {
    wrisAnnual: number;
    wrisStation: string;
    validationAccuracy: string;
    credibilityBoost: string;
  };
  confidence: number;
  source: string;
  lastUpdated: string;
}

export interface GroundwaterData {
  depth: number;
  level: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
  classification: string;
  wrisEnhancement: {
    districtProfile: string;
    cgwbStationsUsed: number;
    nearestStation: {
      name: string;
      distance: number;
      coordinates: { lat: number; lng: number };
      waterLevel: number;
    };
    districtAverageDepth: number;
    interpolationMethod: string;
    dataReliability: string;
    stationDetails?: {
      wellType: string;
      wellDepth: number;
      aquiferType: string;
      dataMode: string;
    };
    elevationEnhancement?: {
      altitude: number;
      elevationAdjustment: number;
      elevationSource: string;
      elevationConfidence: string;
      confidenceBoost: string;
    };
  };
  confidence: number;
  source: string;
  lastUpdated: string;
}

export interface SoilData {
  soilMoisture: number;
  moistureLevel: 'Low' | 'Medium' | 'High' | 'Very Low' | 'Very High';
  permeabilityClassification: 'Very Low' | 'Low' | 'Medium-Low' | 'Medium' | 'High';
  infiltrationRateMMPerHour: number;
  clayContent: number;
  sandContent: number;
  siltContent: number;
  wrisEnhancement: {
    districtMoistureData: {
      averageMoisture: number;
      recordCount: number;
      seasonalPatterns: any[];
      dataQuality: string;
    };
    coordinateAdjustments: {
      landUse: number;
      drainage: number;
      proximity: number;
      elevation: number;
    };
    permeabilityCalculation: {
      methods: string[];
      combinedResult: string;
      scientificBasis: string;
    };
  };
  confidence: number;
  source: string;
  lastUpdated: string;
}

export interface CalculationRequest {
  location: Coordinates;
  rooftopArea: number;
  openSpaceArea: number;
  budget: number; // ← ADD THIS
}

export interface WaterHarvestingRecommendations {
  primary: string;
  secondary: string;
  considerations: string[];
  // NEW: Budget-specific recommendations
  budgetOptimized: {
    systemType: string;
    estimatedCost: number;
    components: BudgetComponent[];
    alternatives: BudgetAlternative[];
  };
  rooftopHarvest: number;
  groundwaterRecharge: number;
  totalWaterManagement: number;
  peakDailyCollection: number;
}

interface BudgetComponent {
  name: string;
  cost: number;
  priority: 'essential' | 'recommended' | 'optional';
  description: string;
}

interface BudgetAlternative {
  name: string;
  cost: number;
  efficiency: number;
  description: string;
}

export interface EnvironmentalAnalysis {
  location: Coordinates;
  rainfall: RainfallData;
  groundwater: GroundwaterData;
  soil: SoilData;
  principalAquifer: CGWBPrincipalAquifer;
  waterHarvesting: WaterHarvestingRecommendations;
  governmentValidation: {
    rainfall: string;
    groundwater: string;
    soil: string;
    aquifer: string;
    overallCredibility: string;
  };
  systemAccuracy: {
    confidence: number;
    accuracy: string;
    dataQuality: string;
    competitiveAdvantage: string;
  };
}
