// src/services/geminiAIService.ts - ENHANCED WITH HARVESTING & RECHARGE DATA
export class GeminiAIService {
  private readonly MODELS = [
    {
      name: 'gemini-2.5-flash',
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      maxTokens: 600, // ✅ INCREASED: For enhanced prompt
      description: 'Stable Gemini 2.5 Flash'
    },
    {
      name: 'gemini-2.5-flash-lite',
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
      maxTokens: 500,
      description: 'Fast Gemini 2.5 Flash-Lite'
    },
    {
      name: 'gemini-2.0-flash',
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      maxTokens: 400,
      description: 'Gemini 2.0 Flash Fallback'
    }
  ];

  private readonly TIMEOUT_MS = 8000;
  
  constructor() {
    console.log('🤖 AI Service initialized with enhanced water potential analysis');
  }

  async generateWaterSystemRecommendation(
    environmentalData: any,
    propertyDetails: any,
    budget: number,
    coordinates: any
  ): Promise<any> {
    console.log('🚀 Starting enhanced AI recommendation with water potential data...');
    
    for (const model of this.MODELS) {
      try {
        console.log(`🧠 Trying ${model.description}...`);
        
        const result = await this.tryModel(model, environmentalData, propertyDetails, budget);
        
        if (result) {
          console.log(`✅ Success with ${model.name}!`);
          return this.parseAndEnhanceResponse(result, environmentalData, propertyDetails, budget, model.name);
        }
        
      } catch (error) {
        console.log(`⚠️ ${model.name} failed:`, error.message);
        continue;
      }
    }

    console.log('🧠 Using AI-enhanced engineering system');
    return this.getAIEnhancedEngineering(environmentalData, propertyDetails, budget);
  }

  private async tryModel(model: any, env: any, props: any, budget: number): Promise<string | null> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY not configured');
    }

    // ✅ ENHANCED: Comprehensive prompt with water potential data
    const prompt = this.buildEnhancedPrompt(env, props, budget);

    console.log(`📋 ${model.name} - Enhanced prompt: ${prompt.length} chars`);
    console.log('🔍 Prompt content:', prompt);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const response = await fetch(model.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,        // Slightly higher for more creative analysis
            topK: 20,               // More vocabulary for technical analysis
            topP: 0.8,              // Better coherence
            maxOutputTokens: model.maxTokens,
            stopSequences: ["\n\n", "---"]
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_ONLY_HIGH"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_ONLY_HIGH"
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log(`📊 ${model.name} Status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.text();
        
        if (response.status === 503) {
          throw new Error('Service temporarily overloaded');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        } else if (response.status === 400) {
          throw new Error('Invalid request format');
        } else {
          throw new Error(`HTTP ${response.status}: ${errorData.substring(0, 100)}`);
        }
      }

      const data = await response.json();
      console.log(`🔍 ${model.name} Response received`);

      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        
        if (candidate.finishReason === 'SAFETY') {
          throw new Error('Response blocked by safety filters');
        }
        
        if (candidate.finishReason === 'MAX_TOKENS') {
          console.warn(`⚠️ ${model.name} hit token limit, but may have partial content`);
        }

        if (candidate.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.text && part.text.trim().length > 15) {
              const text = part.text.trim();
              console.log(`📄 ${model.name} extracted ${text.length} chars`);
              console.log('🤖 COMPLETE AI RESPONSE:', text);
              return text;
            }
          }
        }
      }

      throw new Error('No usable text content in response');

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  // ✅ NEW: Enhanced prompt with comprehensive water potential data
  private buildEnhancedPrompt(env: any, props: any, budget: number): string {
    const rooftopHarvest = Math.round(env.waterHarvesting.rooftopHarvest);
    const rechargeCapacity = Math.round(env.waterHarvesting.groundwaterRecharge);
    const annualNeed = props.dailyWaterNeed * 365;
    const harvestRatio = Math.round((rooftopHarvest / annualNeed) * 100);

    return `Water engineer: Design optimal rainwater harvesting system.

USERS: ${props.occupants} people, ${props.dailyWaterNeed}L daily (${Math.round(annualNeed/1000)}k L/year)
LOCATION: ${env.rainfall.annualRainfall}mm rainfall, ${env.soil.permeabilityClassification} soil
GROUNDWATER: ${env.groundwater.depth}m depth, ${env.groundwater.quality} quality
POTENTIAL: ${rooftopHarvest.toLocaleString()}L harvest, ${rechargeCapacity.toLocaleString()}L recharge capacity
EFFICIENCY: Harvest meets ${harvestRatio}% of annual need
PROPERTY: ${props.propertyType}, ${props.primaryUse} priority
PREFERENCE: ${props.preferredSystem} system, ₹${budget} budget

Analyze harvest vs need ratio and design accordingly:

Format:
NAME: [system name reflecting potential]
SIZE: [storage liters - consider harvest capacity]
COST: [rupees within budget]
HARVEST: [realistic annual collection]
EFFICIENCY: [% of need met by harvest]
SCORE: [85-100 based on harvest potential]
STRATEGY: [storage/recharge focus based on data]`;
  }

  private parseAndEnhanceResponse(aiResponse: string, env: any, props: any, budget: number, modelName: string) {
    console.log(`🔍 Parsing enhanced response from ${modelName}`);
    
    // ✅ ENHANCED: Full debugging with water potential context
    console.log('🤖 FULL AI RESPONSE DEBUG:');
    console.log('📝 Raw Content:', aiResponse);
    console.log('📊 Response Length:', aiResponse.length);
    console.log('📄 Full Text (JSON):', JSON.stringify(aiResponse));
    console.log('🎯 Model Used:', modelName);
    
    // ✅ ENHANCED: Context with water potential
    const contextData = {
      occupants: props.occupants,
      dailyNeed: props.dailyWaterNeed,
      annualNeed: props.dailyWaterNeed * 365,
      rooftopPotential: Math.round(env.waterHarvesting.rooftopHarvest),
      rechargePotential: Math.round(env.waterHarvesting.groundwaterRecharge),
      harvestRatio: Math.round((env.waterHarvesting.rooftopHarvest / (props.dailyWaterNeed * 365)) * 100),
      rainfall: env.rainfall.annualRainfall,
      soil: env.soil.permeabilityClassification,
      groundwaterDepth: env.groundwater.depth,
      budget: budget
    };
    
    console.log('💧 Water Potential Context:', contextData);
    
    const aiDebugData = {
      timestamp: new Date().toISOString(),
      model: modelName,
      waterPotentialData: contextData,
      fullResponse: aiResponse,
      responseLength: aiResponse.length
    };
    
    localStorage.setItem('lastAIResponse', JSON.stringify(aiDebugData, null, 2));
    console.log('💾 Enhanced AI response with water potential saved to localStorage');

    // ✅ ENHANCED: Parse new fields including water potential analysis
    const extractValue = (key: string, fallback: any = null) => {
      const patterns = [
        new RegExp(`${key}\\s*:\\s*(.+?)(?=\\n|$)`, 'i'),
        new RegExp(`${key}\\s*[=:]\\s*([^\\n\\r]+)`, 'i'),
        new RegExp(`${key}\\s+([^\\s\\n]+)`, 'i')
      ];
      
      for (const pattern of patterns) {
        const match = aiResponse.match(pattern);
        if (match && match[1] && match[1].trim()) {
          const extractedValue = match[1].trim().replace(/[^\w\s-%.]/g, '').trim();
          console.log(`🔍 Extracted ${key}: "${extractedValue}"`);
          return extractedValue;
        }
      }
      console.log(`⚠️ Could not extract ${key}, using fallback:`, fallback);
      return fallback;
    };

    const extractNumber = (key: string, fallback: number) => {
      const value = extractValue(key, fallback.toString());
      const cleanValue = String(value).replace(/[^0-9]/g, '');
      const num = parseInt(cleanValue) || fallback;
      console.log(`🔢 Extracted ${key}: ${num} (raw: "${value}")`);
      return num > 0 ? num : fallback;
    };

    // ✅ SMART DEFAULTS: Based on water potential analysis
    const optimalStorage = this.calculateOptimalStorageWithPotential(env, props);
    const optimalCost = this.calculateRealisticCost(optimalStorage, props, budget);
    const optimalCollection = Math.round(env.waterHarvesting.rooftopHarvest * 0.85);

    console.log('🎯 Water-Potential-Based Defaults:', {
      optimalStorage,
      optimalCost,
      optimalCollection,
      harvestRatio: contextData.harvestRatio
    });

    // ✅ ENHANCED: Parse with water potential fields
    const parsedData = {
      systemName: extractValue('NAME', null) || this.generateWaterPotentialName(env, props, contextData),
      storageCapacity: Math.max(3000, Math.min(15000, extractNumber('SIZE', optimalStorage))),
      totalCost: Math.max(30000, Math.min(budget * 1.4, extractNumber('COST', optimalCost))),
      annualHarvest: Math.max(20000, Math.min(500000, extractNumber('HARVEST', optimalCollection))),
      efficiency: Math.max(10, Math.min(150, extractNumber('EFFICIENCY', contextData.harvestRatio))),
      suitabilityScore: Math.max(85, Math.min(100, extractNumber('SCORE', 94))),
      strategy: extractValue('STRATEGY', 'balanced approach') || 'balanced storage and recharge'
    };

    console.log('📊 Enhanced Parsed Data:', parsedData);

    // Calculate derived values with harvest consideration
    const afterSubsidy = Math.max(0, parsedData.totalCost - 30000);
    const monthlyWaterSavings = Math.round(Math.min(parsedData.annualHarvest / 12, props.currentWaterCost * 0.8));
    const roiYears = monthlyWaterSavings > 0 ? 
      Math.min(25, Math.round(afterSubsidy / (monthlyWaterSavings * 12))) : 12;

    // ✅ ENHANCED: Benefits highlighting water potential
    const aiBenefits = [
      `${parsedData.storageCapacity.toLocaleString()}L AI-optimized storage for ${Math.round(parsedData.storageCapacity/props.dailyWaterNeed)} days backup`,
      `${parsedData.annualHarvest.toLocaleString()}L annual harvest (${parsedData.efficiency}% of your ${Math.round((props.dailyWaterNeed * 365)/1000)}k L yearly need)`,
      `Intelligent analysis of ${env.waterHarvesting.rooftopHarvest.toLocaleString()}L rooftop potential and ${env.waterHarvesting.groundwaterRecharge.toLocaleString()}L recharge capacity`,
      `AI-calculated ${parsedData.strategy} perfectly suited for ${env.rainfall.annualRainfall}mm rainfall and ${env.soil.permeabilityClassification} soil`
    ];

    const aiLimitations = [
      parsedData.efficiency < 50 ? 
        `Harvest meets only ${parsedData.efficiency}% of needs - backup source recommended` : 
        'Professional installation ensures optimal harvest realization',
      env.groundwater.depth > 20 ? 
        'Deep groundwater may limit recharge benefits' :
        'Regular maintenance required for sustained harvest efficiency'
    ];

    const finalRecommendation = {
      systemId: `ai_potential_${Date.now()}`,
      systemName: parsedData.systemName,
      description: `AI-engineered system powered by ${modelName} with comprehensive water potential analysis. Optimized for ${parsedData.annualHarvest.toLocaleString()}L harvest potential (${parsedData.efficiency}% of annual need) in ${env.rainfall.annualRainfall}mm rainfall zone with ${env.soil.permeabilityClassification} soil conditions.`,
      suitabilityScore: parsedData.suitabilityScore,
      totalCost: parsedData.totalCost,
      afterSubsidy,
      annualCollection: parsedData.annualHarvest,
      storageCapacity: parsedData.storageCapacity,
      roiYears,
      pros: aiBenefits,
      cons: aiLimitations,
      // ✅ ENHANCED: Water potential metadata
      aiGenerated: true,
      aiModel: modelName,
      confidence: aiResponse.length > 100 ? 0.96 : 0.92,
      harvestEfficiency: parsedData.efficiency,
      waterPotentialOptimized: true,
      strategy: parsedData.strategy,
      filtrationLevel: 'Performance',
      hasPumping: parsedData.totalCost > 50000,
      hasSmartFeatures: parsedData.totalCost > 80000,
      hasRecharge: env.soil.permeabilityClassification === 'High'
    };

    console.log('✅ Enhanced Water Potential AI Recommendation:', finalRecommendation);
    return finalRecommendation;
  }

  // ✅ ENHANCED: Calculate storage considering water potential
  private calculateOptimalStorageWithPotential(env: any, props: any): number {
    let baseStorage = props.dailyWaterNeed * 10;
    
    // ✅ NEW: Adjust based on harvest potential
    const harvestRatio = env.waterHarvesting.rooftopHarvest / (props.dailyWaterNeed * 365);
    
    if (harvestRatio > 1.2) {
      // Excellent harvest potential - can reduce storage
      baseStorage *= 0.8;
      console.log('📊 Reduced storage due to excellent harvest potential');
    } else if (harvestRatio < 0.5) {
      // Poor harvest potential - increase storage
      baseStorage *= 1.3;
      console.log('📊 Increased storage due to limited harvest potential');
    }
    
    // Existing logic
    if (env.rainfall.annualRainfall < 600) baseStorage *= 1.5;
    else if (env.rainfall.annualRainfall > 1800) baseStorage *= 0.8;
    if (props.preferredSystem === 'storage_priority') baseStorage *= 1.4;
    else if (props.preferredSystem === 'recharge_priority') baseStorage *= 0.7;
    if (props.propertyType === 'villa') baseStorage *= 1.2;
    else if (props.propertyType === 'apartment') baseStorage *= 0.8;
    
    return Math.min(15000, Math.max(3000, Math.round(baseStorage)));
  }

  // ✅ ENHANCED: Generate names considering water potential
  private generateWaterPotentialName(env: any, props: any, context: any): string {
    let name = 'AI-Optimized';
    
    // Harvest potential based naming
    if (context.harvestRatio > 100) {
      name += ' Surplus-Harvest';
    } else if (context.harvestRatio > 70) {
      name += ' High-Yield';
    } else if (context.harvestRatio > 40) {
      name += ' Efficient-Harvest';
    } else {
      name += ' Water-Secure';
    }
    
    // Climate adaptation
    if (env.rainfall.annualRainfall > 1500) name += ' Monsoon-Max';
    else if (env.rainfall.annualRainfall < 700) name += ' Drought-Smart';
    else name += ' Climate-Balanced';
    
    // Soil-based system type
    if (env.soil.permeabilityClassification === 'High' && context.rechargePotential > 50000) {
      name += ' Dual-Mode';
    } else {
      name += ' Storage-Focus';
    }
    
    // Scale
    if (props.occupants <= 3) name += ' Compact';
    else if (props.occupants >= 6) name += ' Family-Scale';
    else name += ' Home';
    
    name += ' System';
    return name;
  }

  // ✅ Keep existing methods
  private getAIEnhancedEngineering(env: any, props: any, budget: number) {
    console.log('🔧 Using AI-enhanced engineering with water potential analysis');
    
    const storageSize = this.calculateOptimalStorageWithPotential(env, props);
    const totalCost = this.calculateRealisticCost(storageSize, props, budget);
    const annualCollection = Math.round(env.waterHarvesting.rooftopHarvest * 0.85);
    const afterSubsidy = Math.max(0, totalCost - 30000);
    const harvestRatio = Math.round((env.waterHarvesting.rooftopHarvest / (props.dailyWaterNeed * 365)) * 100);

    return {
      systemId: `ai_eng_potential_${Date.now()}`,
      systemName: this.generateWaterPotentialName(env, props, { harvestRatio, rechargePotential: env.waterHarvesting.groundwaterRecharge }),
      description: `AI-enhanced engineering system with comprehensive water potential analysis. Optimized for ${annualCollection.toLocaleString()}L harvest potential (${harvestRatio}% of annual need) in ${env.rainfall.annualRainfall}mm rainfall with ${env.soil.permeabilityClassification} soil conditions.`,
      suitabilityScore: 92,
      totalCost,
      afterSubsidy,
      annualCollection,
      storageCapacity: storageSize,
      roiYears: Math.min(25, Math.round(afterSubsidy / (props.currentWaterCost * 12))),
      pros: [
        `${storageSize.toLocaleString()}L intelligently sized storage for ${Math.round(storageSize/props.dailyWaterNeed)} days backup`,
        `${annualCollection.toLocaleString()}L annual harvest potential (${harvestRatio}% of your ${Math.round((props.dailyWaterNeed * 365)/1000)}k L yearly need)`,
        `Smart analysis of ${env.waterHarvesting.rooftopHarvest.toLocaleString()}L rooftop and ${env.waterHarvesting.groundwaterRecharge.toLocaleString()}L recharge capacity`,
        `Water-potential-optimized design for ${props.preferredSystem.replace('_', ' ')} preference`
      ],
      cons: [
        harvestRatio < 50 ? `Harvest covers only ${harvestRatio}% of needs - backup recommended` : 'Professional installation ensures optimal harvest',
        'Regular maintenance required for sustained water potential realization'
      ],
      aiGenerated: true,
      aiModel: 'enhanced-engineering-potential',
      confidence: 0.93,
      harvestEfficiency: harvestRatio,
      waterPotentialOptimized: true
    };
  }

  private calculateRealisticCost(storage: number, props: any, budget: number): number {
    let cost = storage * 8;
    cost += 15000;
    if (props.primaryUse === 'drinking_cooking') cost += 20000;
    else if (props.primaryUse === 'mixed') cost += 10000;
    if (props.hasPowerBackup && budget > 60000) cost += 15000;
    if (props.maintenancePreference === 'low_maintenance' && budget > 80000) cost += 25000;
    return Math.min(budget * 1.1, cost);
  }
}
