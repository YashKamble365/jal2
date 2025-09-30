import { ALL_STATES_SUBSIDY_DATA } from '../config/allStatesSubsidyData';
import locationService from './locationService'; // ← USE YOUR EXISTING SERVICE
export class EnhancedGeographicService {
    // Get state information using your existing locationService
    async getStateFromCoordinates(coordinates) {
        try {
            // Use your existing locationService to get state and district
            const locationInfo = await locationService.getAdministrativeContext(coordinates);
            console.log('🗺️ Location service returned:', locationInfo);
            // Find matching state in subsidy database
            const matchingState = ALL_STATES_SUBSIDY_DATA.find(state => state.state.toUpperCase() === locationInfo.state.toUpperCase() ||
                state.state.toUpperCase().includes(locationInfo.state.toUpperCase()) ||
                locationInfo.state.toUpperCase().includes(state.state.toUpperCase()));
            if (matchingState) {
                console.log('✅ Found matching state subsidy data:', matchingState.state);
                return matchingState;
            }
            console.warn('⚠️ No matching state found in subsidy database for:', locationInfo.state);
            return this.findClosestStateByCoordinates(coordinates);
        }
        catch (error) {
            console.error('❌ Error getting state from coordinates:', error?.message || 'Unknown error');
            return this.findClosestStateByCoordinates(coordinates);
        }
    }
    // Fallback: Find closest state by coordinate bounds
    findClosestStateByCoordinates(coordinates) {
        const { lat, lng } = coordinates;
        let closestState = ALL_STATES_SUBSIDY_DATA[0];
        let minDistance = this.calculateDistanceToStateBounds(coordinates, closestState);
        for (const state of ALL_STATES_SUBSIDY_DATA) {
            const distance = this.calculateDistanceToStateBounds(coordinates, state);
            if (distance < minDistance) {
                minDistance = distance;
                closestState = state;
            }
        }
        console.log('📍 Using closest state by coordinates:', closestState.state);
        return closestState;
    }
    // Calculate distance to state coordinate bounds
    calculateDistanceToStateBounds(coordinates, state) {
        const bounds = state.coordinateBounds;
        const centerLat = (bounds.north + bounds.south) / 2;
        const centerLng = (bounds.east + bounds.west) / 2;
        return this.calculateDistance(coordinates, { lat: centerLat, lng: centerLng });
    }
    // Haversine distance calculation
    calculateDistance(coord1, coord2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(coord2.lat - coord1.lat);
        const dLng = this.toRadians(coord2.lng - coord1.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(coord1.lat)) * Math.cos(this.toRadians(coord2.lat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    // Get comprehensive subsidy information using location service
    async getSubsidyInformation(coordinates, budget, propertyDetails) {
        console.log('🏛️ Getting subsidy information for coordinates:', coordinates);
        try {
            // Get state data using your location service
            const stateData = await this.getStateFromCoordinates(coordinates);
            if (!stateData) {
                console.warn('⚠️ No state data found, using default subsidy');
                return this.getDefaultSubsidyInfo(budget);
            }
            console.log('🏛️ Found state subsidy data:', stateData.state);
            // Find applicable schemes for property type
            const applicableSchemes = stateData.schemes.filter(scheme => scheme.eligibility.propertyTypes.includes(propertyDetails.propertyType));
            if (applicableSchemes.length === 0) {
                console.warn('⚠️ No applicable schemes for property type:', propertyDetails.propertyType);
                return this.getDefaultSubsidyInfo(budget);
            }
            // Select best scheme (highest subsidy amount)
            const bestScheme = applicableSchemes.reduce((best, current) => current.subsidy.maxAmount > best.subsidy.maxAmount ? current : best);
            console.log('✅ Selected best scheme:', bestScheme.name);
            // Calculate actual subsidy amount
            const calculatedSubsidy = Math.min(budget * (bestScheme.subsidy.percentage / 100), bestScheme.subsidy.maxAmount);
            // Check eligibility criteria
            const isEligible = this.checkEligibility(bestScheme, propertyDetails);
            return {
                isEligible,
                schemeName: bestScheme.name,
                subsidyAmount: isEligible ? calculatedSubsidy : 0,
                subsidyPercentage: bestScheme.subsidy.percentage,
                maxSubsidy: bestScheme.subsidy.maxAmount,
                eligibilityCriteria: [
                    `Property type: ${bestScheme.eligibility.propertyTypes.join(', ')}`,
                    ...(bestScheme.eligibility.areaCriteria ? [`Area criteria: ${bestScheme.eligibility.areaCriteria}`] : []),
                    ...(bestScheme.eligibility.occupancyLimit ? [`Max occupancy: ${bestScheme.eligibility.occupancyLimit}`] : []),
                    ...(bestScheme.eligibility.incomeLimit ? [`Income limit: ₹${bestScheme.eligibility.incomeLimit.toLocaleString()}`] : [])
                ],
                applicationProcess: bestScheme.applicationProcess,
                documentsRequired: bestScheme.documentsRequired,
                contactInfo: bestScheme.contactInfo
            };
        }
        catch (error) {
            console.error('❌ Error getting subsidy information:', error?.message || 'Unknown error');
            return this.getDefaultSubsidyInfo(budget);
        }
    }
    // Check if user meets eligibility criteria
    checkEligibility(scheme, propertyDetails) {
        // Check property type
        if (!scheme.eligibility.propertyTypes.includes(propertyDetails.propertyType)) {
            console.log('❌ Property type not eligible:', propertyDetails.propertyType);
            return false;
        }
        // Check occupancy limit (if specified)
        if (scheme.eligibility.occupancyLimit && propertyDetails.occupants > scheme.eligibility.occupancyLimit * 4) {
            console.log('❌ Too many occupants for scheme');
            return false;
        }
        // Check income limit (simplified - use water cost as proxy)
        if (scheme.eligibility.incomeLimit && propertyDetails.currentWaterCost * 12 > scheme.eligibility.incomeLimit * 0.1) {
            console.log('❌ Income appears too high for scheme');
            return false;
        }
        console.log('✅ User meets eligibility criteria');
        return true;
    }
    // Default subsidy for cases where no specific state data is available
    getDefaultSubsidyInfo(budget) {
        console.log('🏛️ Using default national subsidy scheme');
        return {
            isEligible: true,
            schemeName: 'Jal Shakti Abhiyan: Catch The Rain (National)',
            subsidyAmount: budget * 0.3, // 30% default
            subsidyPercentage: 30,
            maxSubsidy: budget * 0.3,
            eligibilityCriteria: [
                'All property types eligible',
                'Participate in community water conservation',
                'Follow technical specifications',
                'Rural and urban areas covered'
            ],
            applicationProcess: 'Apply through local administration or NGO partnerships',
            documentsRequired: [
                'Property documents',
                'Technical proposal',
                'Community participation certificate',
                'Income proof (if required)'
            ],
            contactInfo: {
                department: 'Ministry of Jal Shakti',
                phone: '011-24362100',
                website: 'https://nwm.gov.in'
            }
        };
    }
    // Get market price modifier based on location
    async getMarketModifier(coordinates) {
        try {
            const locationInfo = await locationService.getAdministrativeContext(coordinates);
            const stateData = await this.getStateFromCoordinates(coordinates);
            if (stateData) {
                console.log('💰 Using state market modifier:', stateData.marketModifier);
                return stateData.marketModifier;
            }
            // Fallback: Use basic geographic estimation
            return this.getRegionalPriceModifier(locationInfo.state, locationInfo.district);
        }
        catch (error) {
            console.warn('⚠️ Could not determine market modifier, using default (1.0)');
            return 1.0;
        }
    }
    // Regional price modifier based on state/district
    getRegionalPriceModifier(state, district) {
        // Metro cities have higher prices
        const metroCities = ['MUMBAI', 'DELHI', 'BENGALURU', 'CHENNAI', 'KOLKATA', 'HYDERABAD'];
        if (metroCities.some(city => district.includes(city))) {
            return 1.3;
        }
        // State capitals and major cities
        const majorCities = ['PUNE', 'AHMEDABAD', 'SURAT', 'LUCKNOW', 'KANPUR', 'JAIPUR', 'INDORE'];
        if (majorCities.some(city => district.includes(city))) {
            return 1.2;
        }
        // Default pricing for other areas
        return 1.0;
    }
    // Get all available schemes for a location
    async getAllSchemesForLocation(coordinates) {
        return await this.getStateFromCoordinates(coordinates);
    }
    // Search states by name (for manual selection)
    searchStateByName(stateName) {
        return ALL_STATES_SUBSIDY_DATA.find(state => state.state.toLowerCase().includes(stateName.toLowerCase()) ||
            state.stateCode.toLowerCase() === stateName.toLowerCase()) || null;
    }
    // Get all states list (for dropdowns)
    getAllStates() {
        return ALL_STATES_SUBSIDY_DATA.map(state => ({
            name: state.state,
            code: state.stateCode
        }));
    }
}
