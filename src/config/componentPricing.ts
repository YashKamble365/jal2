// src/config/componentPricing.ts - COMPLETE DYNAMIC PRICING
export interface ComponentSpecs {
    id: string;
    name: string;
    type: 'storage' | 'filtration' | 'pumping' | 'piping' | 'recharge' | 'smart_features';
    category: 'basic' | 'performance' | 'premium';
    basePrice: number;
    pricePerUnit?: number; // For tanks (per liter), pipes (per meter)
    specifications: string[];
    brands: {
      name: string;
      model: string;
      priceMultiplier: number; // Multiply base price
      rating: number;
      warranty: string;
      availability: 'high' | 'medium' | 'low';
    }[];
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
    };
    environmentalOptimization?: {
      rainfallRange: [number, number]; // mm
      soilTypes: string[];
      groundwaterDepthRange: [number, number]; // meters
    };
    lifespan: number; // Years of expected lifespan
  }
  
  export const COMPONENT_PRICING_DATABASE: ComponentSpecs[] = [
    // STORAGE TANKS
    {
      id: 'tank_basic_2000l',
      name: 'Basic Storage Tank',
      type: 'storage',
      category: 'basic',
      basePrice: 8000, // Base price for 1000L
      pricePerUnit: 8, // Per liter
      specifications: [
        'Food-grade plastic construction',
        'UV stabilized for outdoor use',
        'Standard fittings included',
        'Overflow pipe connection',
        'Easy access lid'
      ],
      brands: [
        { name: 'Sintex', model: 'AS Series', priceMultiplier: 1.0, rating: 4.2, warranty: '5 years', availability: 'high' },
        { name: 'Supreme', model: 'Aqua Series', priceMultiplier: 0.95, rating: 4.0, warranty: '4 years', availability: 'high' },
        { name: 'Penguin', model: 'Water Tank', priceMultiplier: 0.85, rating: 3.8, warranty: '3 years', availability: 'medium' },
        { name: 'Vectus', model: 'Reno Series', priceMultiplier: 0.92, rating: 4.1, warranty: '5 years', availability: 'medium' }
      ],
      installation: {
        complexity: 'moderate',
        baseCost: 3000,
        timeHours: 6,
        skillLevel: 'intermediate',
        toolsRequired: ['Measuring tape', 'Spirit level', 'Basic plumbing tools', 'Ladder']
      },
      maintenance: {
        frequency: 'Quarterly cleaning',
        annualCost: 2000,
        diyFriendly: true
      },
      environmentalOptimization: {
        rainfallRange: [400, 2000],
        soilTypes: ['Low', 'Medium', 'High'],
        groundwaterDepthRange: [1, 50]
      },
      lifespan: 15
    },
    {
      id: 'tank_performance_5000l',
      name: 'High-Performance Storage Tank',
      type: 'storage',
      category: 'performance',
      basePrice: 12000,
      pricePerUnit: 9,
      specifications: [
        'Triple-layer construction',
        'Anti-bacterial inner coating',
        'UV stabilized with color protection',
        'Reinforced structure for durability',
        'Smart overflow management',
        'Multiple inlet/outlet options'
      ],
      brands: [
        { name: 'Sintex', model: 'AS-Pro Series', priceMultiplier: 1.1, rating: 4.5, warranty: '7 years', availability: 'high' },
        { name: 'Supreme', model: 'Aqua-Pro Series', priceMultiplier: 1.05, rating: 4.3, warranty: '6 years', availability: 'high' },
        { name: 'Vectus', model: 'Reno-Pro Series', priceMultiplier: 1.0, rating: 4.2, warranty: '6 years', availability: 'medium' },
        { name: 'RC Plasto', model: 'Premium Tank', priceMultiplier: 0.95, rating: 4.1, warranty: '5 years', availability: 'medium' }
      ],
      installation: {
        complexity: 'moderate',
        baseCost: 5000,
        timeHours: 8,
        skillLevel: 'intermediate',
        toolsRequired: ['Measuring tape', 'Spirit level', 'Basic plumbing tools', 'Ladder', 'Sealant']
      },
      maintenance: {
        frequency: 'Bi-annual cleaning',
        annualCost: 3000,
        diyFriendly: true
      },
      environmentalOptimization: {
        rainfallRange: [600, 3000],
        soilTypes: ['Medium', 'High'],
        groundwaterDepthRange: [2, 30]
      },
      lifespan: 20
    },
    {
      id: 'tank_premium_10000l',
      name: 'Premium Modular Storage System',
      type: 'storage',
      category: 'premium',
      basePrice: 18000,
      pricePerUnit: 12,
      specifications: [
        'Modular design for easy expansion',
        'Hospital-grade anti-bacterial coating',
        'Insulated for temperature control',
        'Smart level monitoring ready',
        'Earthquake resistant design',
        'Professional installation required'
      ],
      brands: [
        { name: 'Graf', model: 'Modular System', priceMultiplier: 1.3, rating: 4.8, warranty: '10 years', availability: 'low' },
        { name: 'Sintex', model: 'Fortress Series', priceMultiplier: 1.2, rating: 4.6, warranty: '8 years', availability: 'medium' },
        { name: 'Supreme', model: 'Elite Series', priceMultiplier: 1.15, rating: 4.4, warranty: '7 years', availability: 'medium' }
      ],
      installation: {
        complexity: 'complex',
        baseCost: 12000,
        timeHours: 16,
        skillLevel: 'expert',
        toolsRequired: ['Measuring tape', 'Spirit level', 'Heavy machinery', 'Crane', 'Welding equipment', 'Safety harness']
      },
      maintenance: {
        frequency: 'Professional annual service',
        annualCost: 8000,
        diyFriendly: false
      },
      environmentalOptimization: {
        rainfallRange: [800, 4000],
        soilTypes: ['High'],
        groundwaterDepthRange: [5, 25]
      },
      lifespan: 25
    },
  
    // FILTRATION SYSTEMS
    {
      id: 'filter_basic_first_flush',
      name: 'Basic First Flush Diverter',
      type: 'filtration',
      category: 'basic',
      basePrice: 3500,
      specifications: [
        'First flush diverter mechanism',
        'Coarse mesh filter',
        'Manual operation',
        'Basic sediment removal',
        'Easy maintenance'
      ],
      brands: [
        { name: 'Rainy Filters', model: 'RF-Basic', priceMultiplier: 1.0, rating: 4.0, warranty: '2 years', availability: 'high' },
        { name: 'HarvestRain', model: 'Standard FF', priceMultiplier: 0.9, rating: 3.8, warranty: '1 year', availability: 'high' },
        { name: 'AquaTech', model: 'Simple Diverter', priceMultiplier: 0.85, rating: 3.7, warranty: '1 year', availability: 'medium' }
      ],
      installation: {
        complexity: 'simple',
        baseCost: 1500,
        timeHours: 3,
        skillLevel: 'basic',
        toolsRequired: ['Screwdriver', 'Measuring tape', 'Basic plumbing tools']
      },
      maintenance: {
        frequency: 'Monthly cleaning',
        annualCost: 1000,
        diyFriendly: true
      },
      environmentalOptimization: {
        rainfallRange: [300, 1500],
        soilTypes: ['Low', 'Medium'],
        groundwaterDepthRange: [1, 50]
      },
      lifespan: 8
    },
    {
      id: 'filter_performance_multi_stage',
      name: 'Multi-Stage Filtration System',
      type: 'filtration',
      category: 'performance',
      basePrice: 18000,
      specifications: [
        'Multi-stage sand and carbon filtration',
        'UV sterilization chamber',
        'TDS control system',
        'Automatic backwash feature',
        'Flow rate optimization',
        'Water quality monitoring'
      ],
      brands: [
        { name: 'Aquaguard', model: 'RWH-Pro', priceMultiplier: 1.1, rating: 4.4, warranty: '3 years', availability: 'high' },
        { name: 'Kent', model: 'RO-RWH System', priceMultiplier: 1.15, rating: 4.3, warranty: '3 years', availability: 'medium' },
        { name: 'Eureka Forbes', model: 'Aquasure', priceMultiplier: 1.05, rating: 4.2, warranty: '2 years', availability: 'high' },
        { name: 'Blue Star', model: 'Aristo', priceMultiplier: 1.0, rating: 4.1, warranty: '2 years', availability: 'medium' }
      ],
      installation: {
        complexity: 'moderate',
        baseCost: 4000,
        timeHours: 6,
        skillLevel: 'intermediate',
        toolsRequired: ['Pipe cutter', 'Measuring tape', 'Basic plumbing tools', 'Electrical tester', 'Sealant']
      },
      maintenance: {
        frequency: 'Bi-monthly service',
        annualCost: 4000,
        diyFriendly: false
      },
      environmentalOptimization: {
        rainfallRange: [600, 2500],
        soilTypes: ['Medium', 'High'],
        groundwaterDepthRange: [3, 40]
      },
      lifespan: 12
    },
  
    // PUMPING SYSTEMS
    {
      id: 'pump_basic_manual',
      name: 'Basic Manual Pump System',
      type: 'pumping',
      category: 'basic',
      basePrice: 8000,
      specifications: [
        '0.5 HP electric pump',
        'Manual on/off operation',
        'Basic pressure switch',
        'Dry run protection',
        'Standard fittings'
      ],
      brands: [
        { name: 'Crompton', model: 'Mini Sapphire', priceMultiplier: 1.0, rating: 4.2, warranty: '2 years', availability: 'high' },
        { name: 'Kirloskar', model: 'Jalraaj', priceMultiplier: 1.05, rating: 4.3, warranty: '2 years', availability: 'high' },
        { name: 'V-Guard', model: 'Jeevan', priceMultiplier: 0.95, rating: 4.0, warranty: '1 year', availability: 'high' },
        { name: 'Havells', model: 'Hi-Flow', priceMultiplier: 1.02, rating: 4.1, warranty: '2 years', availability: 'medium' }
      ],
      installation: {
        complexity: 'moderate',
        baseCost: 3500,
        timeHours: 4,
        skillLevel: 'intermediate',
        toolsRequired: ['Pipe wrench', 'Electrical tester', 'Measuring tape', 'Basic plumbing tools', 'Sealant']
      },
      maintenance: {
        frequency: 'Annual service',
        annualCost: 2000,
        diyFriendly: false
      },
      environmentalOptimization: {
        rainfallRange: [400, 2000],
        soilTypes: ['Low', 'Medium', 'High'],
        groundwaterDepthRange: [2, 20]
      },
      lifespan: 10
    },
    {
      id: 'pump_smart_auto',
      name: 'Smart Automated Pump System',
      type: 'pumping',
      category: 'performance',
      basePrice: 15000,
      specifications: [
        '1 HP variable speed pump',
        'Automatic level control',
        'Smart pressure management',
        'Energy efficient operation',
        'Remote monitoring capability',
        'Soft start technology'
      ],
      brands: [
        { name: 'Grundfos', model: 'Smart Series', priceMultiplier: 1.3, rating: 4.7, warranty: '3 years', availability: 'medium' },
        { name: 'Crompton', model: 'Smart Sapphire', priceMultiplier: 1.1, rating: 4.4, warranty: '3 years', availability: 'high' },
        { name: 'Kirloskar', model: 'Jalraaj Smart', priceMultiplier: 1.15, rating: 4.5, warranty: '3 years', availability: 'medium' },
        { name: 'Wilo', model: 'Smart Pump', priceMultiplier: 1.25, rating: 4.6, warranty: '3 years', availability: 'low' }
      ],
      installation: {
        complexity: 'complex',
        baseCost: 6000,
        timeHours: 8,
        skillLevel: 'expert',
        toolsRequired: ['Electrical tester', 'Pipe wrench', 'Measuring tape', 'Circuit breaker tools', 'Safety equipment']
      },
      maintenance: {
        frequency: 'Bi-annual service',
        annualCost: 3500,
        diyFriendly: false
      },
      environmentalOptimization: {
        rainfallRange: [600, 3000],
        soilTypes: ['Medium', 'High'],
        groundwaterDepthRange: [5, 30]
      },
      lifespan: 12
    },
  
    // RECHARGE SYSTEMS
    {
      id: 'recharge_basic_pit',
      name: 'Basic Recharge Pit',
      type: 'recharge',
      category: 'basic',
      basePrice: 8000,
      specifications: [
        '3ft x 3ft x 6ft recharge pit',
        'Gravel filter layers',
        'PVC pipe connections',
        'Overflow management',
        'Basic maintenance access'
      ],
      brands: [
        { name: 'EcoRecharge', model: 'Standard Pit', priceMultiplier: 1.0, rating: 4.0, warranty: '5 years', availability: 'medium' },
        { name: 'GreenTech', model: 'Basic Recharge', priceMultiplier: 0.9, rating: 3.8, warranty: '3 years', availability: 'medium' },
        { name: 'AquaRecharge', model: 'Simple Pit', priceMultiplier: 0.85, rating: 3.7, warranty: '3 years', availability: 'high' }
      ],
      installation: {
        complexity: 'complex',
        baseCost: 8000,
        timeHours: 24,
        skillLevel: 'expert',
        toolsRequired: ['Excavation equipment', 'Measuring tape', 'Spirit level', 'Heavy machinery', 'Safety equipment', 'Concrete tools']
      },
      maintenance: {
        frequency: 'Annual cleaning',
        annualCost: 1500,
        diyFriendly: false
      },
      environmentalOptimization: {
        rainfallRange: [500, 2000],
        soilTypes: ['Medium', 'High'],
        groundwaterDepthRange: [3, 15]
      },
      lifespan: 20
    },
  
    // SMART FEATURES
    {
      id: 'iot_basic_monitoring',
      name: 'Basic IoT Monitoring System',
      type: 'smart_features',
      category: 'performance',
      basePrice: 12000,
      specifications: [
        'Water level sensors',
        'Flow rate monitoring',
        'Basic mobile app',
        'SMS alerts',
        'Cloud data storage'
      ],
      brands: [
        { name: 'SmartWater', model: 'IoT-Basic', priceMultiplier: 1.0, rating: 4.2, warranty: '2 years', availability: 'medium' },
        { name: 'AquaSmart', model: 'Monitor Pro', priceMultiplier: 1.1, rating: 4.3, warranty: '2 years', availability: 'low' },
        { name: 'WaterTech', model: 'Smart Monitor', priceMultiplier: 0.9, rating: 4.0, warranty: '1 year', availability: 'medium' }
      ],
      installation: {
        complexity: 'complex',
        baseCost: 5000,
        timeHours: 8,
        skillLevel: 'expert',
        toolsRequired: ['Electrical tester', 'Soldering iron', 'Network cable tools', 'Laptop for configuration', 'Signal meter']
      },
      maintenance: {
        frequency: 'Software updates',
        annualCost: 2000,
        diyFriendly: false
      },
      environmentalOptimization: {
        rainfallRange: [600, 3000],
        soilTypes: ['Medium', 'High'],
        groundwaterDepthRange: [3, 30]
      },
      lifespan: 8
    },
    {
      id: 'iot_advanced_ai',
      name: 'Advanced AI Control System',
      type: 'smart_features',
      category: 'premium',
      basePrice: 25000,
      specifications: [
        'AI-powered optimization',
        'Weather integration',
        'Predictive analytics',
        'Advanced mobile app',
        'Voice control support',
        'Machine learning algorithms'
      ],
      brands: [
        { name: 'SmartWater Pro', model: 'AI-Controller', priceMultiplier: 1.2, rating: 4.6, warranty: '3 years', availability: 'low' },
        { name: 'AquaAI', model: 'Smart Controller', priceMultiplier: 1.15, rating: 4.5, warranty: '3 years', availability: 'low' },
        { name: 'WaterGenius', model: 'AI-Pro', priceMultiplier: 1.1, rating: 4.4, warranty: '2 years', availability: 'medium' }
      ],
      installation: {
        complexity: 'complex',
        baseCost: 8000,
        timeHours: 12,
        skillLevel: 'expert',
        toolsRequired: ['Electrical tester', 'Soldering iron', 'Network cable tools', 'Laptop for configuration', 'Signal meter', 'Programming tools']
      },
      maintenance: {
        frequency: 'Quarterly updates',
        annualCost: 5000,
        diyFriendly: false
      },
      environmentalOptimization: {
        rainfallRange: [800, 4000],
        soilTypes: ['High'],
        groundwaterDepthRange: [5, 25]
      },
      lifespan: 5
    },
  
    // SOLAR SYSTEMS
    {
      id: 'solar_basic_100w',
      name: 'Basic Solar Power System',
      type: 'smart_features',
      category: 'performance',
      basePrice: 20000,
      specifications: [
        '100W solar panel',
        '100Ah battery',
        'PWM charge controller',
        '500W inverter',
        'Basic monitoring'
      ],
      brands: [
        { name: 'Luminous', model: 'Solar-100W', priceMultiplier: 1.0, rating: 4.4, warranty: '5 years', availability: 'high' },
        { name: 'Microtek', model: 'Solar-Basic', priceMultiplier: 0.95, rating: 4.2, warranty: '4 years', availability: 'high' },
        { name: 'Su-Kam', model: 'Solar-100', priceMultiplier: 0.9, rating: 4.0, warranty: '3 years', availability: 'medium' },
        { name: 'Exide', model: 'Solar-Pro', priceMultiplier: 1.05, rating: 4.3, warranty: '5 years', availability: 'medium' }
      ],
      installation: {
        complexity: 'complex',
        baseCost: 5000,
        timeHours: 10,
        skillLevel: 'expert',
        toolsRequired: ['Electrical tester', 'Solar panel mounting tools', 'Battery cable tools', 'Inverter setup tools', 'Safety harness']
      },
      maintenance: {
        frequency: 'Bi-annual cleaning',
        annualCost: 2500,
        diyFriendly: true
      },
      environmentalOptimization: {
        rainfallRange: [400, 3000],
        soilTypes: ['Low', 'Medium', 'High'],
        groundwaterDepthRange: [2, 50]
      },
      lifespan: 15
    }
  ];
  
  // Regional pricing modifiers
  export const REGIONAL_PRICING_MODIFIERS = {
    'metro': 1.25, // Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad
    'tier1': 1.15, // State capitals and major cities
    'tier2': 1.0,  // District headquarters
    'tier3': 0.9,  // Smaller towns
    'rural': 0.8   // Rural areas
  };
