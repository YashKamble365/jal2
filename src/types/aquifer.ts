export interface CGWBPrincipalAquifer {
  name: string;
  code: string;
  type: string;
  description: string;
  area_coverage_percent: number;
  weathered_zone: string;
  fracture_zones: string;
  yield_range: string;
  dtw_range: string;
  age: string;
  states: string[];
  confidence: 'High' | 'Medium' | 'Low';
  aquifer_system_type: string;
  transmissivity_range: string;
  specific_yield: string;
  quality_ec_range: string;
  thickness_range?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeologicalContext {
  elevation: number;
  climate: 'Arid' | 'Semi-Arid' | 'Sub-Humid' | 'Humid';
  terrain: 'Plains' | 'Hills' | 'Plateau' | 'Coastal' | 'Mountain';
  urbanization: 'Rural' | 'Urban' | 'Metropolitan';
  industrial: boolean;
  coastalDistance: number;
}

export interface AquiferMatch {
  aquifer: CGWBPrincipalAquifer;
  confidence: number;
  matchType: 'Polygon' | 'Geological' | 'Proximity' | 'Default';
  adjustments: string[];
}

export interface AquiferPolygon {
  coordinates: { lat: number; lng: number }[];
  priority: number; // Lower number = higher priority
}

export interface CGWBAquiferDefinition {
  aquifer: CGWBPrincipalAquifer;
  polygons: AquiferPolygon[];
  stateWiseData: Record<string, {
    area_sq_km: number;
    specific_characteristics?: Partial<CGWBPrincipalAquifer>;
  }>;
}
