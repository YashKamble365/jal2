// config/allStatesSubsidyData.ts
export interface StateSubsidyScheme {
    state: string;
    stateCode: string;
    schemes: {
      name: string;
      eligibility: {
        propertyTypes: string[];
        areaCriteria?: string;
        occupancyLimit?: number;
        incomeLimit?: number;
      };
      subsidy: {
        percentage: number;
        maxAmount: number;
        minAmount?: number;
      };
      contactInfo: {
        department: string;
        phone: string;
        website: string;
        email?: string;
      };
      documentsRequired: string[];
      applicationProcess: string;
    }[];
    coordinateBounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
    marketModifier: number; // Price adjustment factor
  }
  
  export const ALL_STATES_SUBSIDY_DATA: StateSubsidyScheme[] = [
    // NORTHERN STATES
    {
      state: 'Delhi',
      stateCode: 'DL',
      schemes: [{
        name: 'Delhi Rainwater Harvesting Scheme',
        eligibility: {
          propertyTypes: ['apartment', 'institutional', 'commercial'],
          areaCriteria: 'Roof area > 100 sq.m'
        },
        subsidy: { percentage: 50, maxAmount: 50000 },
        contactInfo: {
          department: 'Delhi Jal Board',
          phone: '1916',
          website: 'www.delhijalboard.nic.in',
          email: 'ceo@delhijalboard.nic.in'
        },
        documentsRequired: ['Property documents', 'Building plan', 'RWA registration'],
        applicationProcess: 'Online through DJB portal'
      }],
      coordinateBounds: { north: 28.88, south: 28.40, east: 77.35, west: 76.84 },
      marketModifier: 1.3
    },
    {
      state: 'Punjab',
      stateCode: 'PB',
      schemes: [{
        name: 'Punjab Water Conservation Scheme',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'commercial', 'institutional'],
          areaCriteria: 'All properties eligible'
        },
        subsidy: { percentage: 40, maxAmount: 40000 },
        contactInfo: {
          department: 'Punjab Water Supply & Sanitation Department',
          phone: '0172-2741436',
          website: 'www.punjab.gov.in',
          email: 'secy-water@punjab.gov.in'
        },
        documentsRequired: ['Property documents', 'Income certificate', 'Technical proposal'],
        applicationProcess: 'Apply through District Collector office'
      }],
      coordinateBounds: { north: 32.50, south: 29.53, east: 76.93, west: 73.88 },
      marketModifier: 1.1
    },
    {
      state: 'Haryana',
      stateCode: 'HR',
      schemes: [{
        name: 'Haryana Rainwater Harvesting Promotion Scheme',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'commercial'],
          areaCriteria: 'Minimum 50 sq.m roof area'
        },
        subsidy: { percentage: 35, maxAmount: 35000 },
        contactInfo: {
          department: 'Haryana Public Health Engineering Department',
          phone: '0172-2560349',
          website: 'www.haryana.gov.in',
          email: 'secy-phed@haryana.gov.in'
        },
        documentsRequired: ['Property ownership proof', 'Building plan', 'Bank account details'],
        applicationProcess: 'Online application through Haryana government portal'
      }],
      coordinateBounds: { north: 30.93, south: 27.65, east: 77.36, west: 74.46 },
      marketModifier: 1.2
    },
    {
      state: 'Himachal Pradesh',
      stateCode: 'HP',
      schemes: [{
        name: 'Himachal Pradesh Jal Shakti Scheme',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'All hill areas eligible',
          incomeLimit: 500000
        },
        subsidy: { percentage: 60, maxAmount: 75000 },
        contactInfo: {
          department: 'Himachal Pradesh Jal Shakti Vibhag',
          phone: '0177-2620573',
          website: 'www.hpiph.org',
          email: 'secy-jalshakti@himachal.gov.in'
        },
        documentsRequired: ['BPL certificate', 'Property documents', 'Income certificate'],
        applicationProcess: 'Apply through Block Development Office'
      }],
      coordinateBounds: { north: 33.22, south: 30.22, east: 79.04, west: 75.47 },
      marketModifier: 1.15
    },
    {
      state: 'Uttar Pradesh',
      stateCode: 'UP',
      schemes: [{
        name: 'UP Per Drop More Crop Scheme',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'villa', 'commercial'],
          areaCriteria: 'All properties eligible'
        },
        subsidy: { percentage: 45, maxAmount: 52000 },
        contactInfo: {
          department: 'Uttar Pradesh Irrigation Department',
          phone: '0522-2239171',
          website: 'www.upagripardarshi.gov.in',
          email: 'secy-irrigation@up.gov.in'
        },
        documentsRequired: ['Aadhar card', 'Property documents', 'Bank account details'],
        applicationProcess: 'Online through UP Agriculture portal'
      }],
      coordinateBounds: { north: 30.24, south: 23.83, east: 84.63, west: 77.05 },
      marketModifier: 0.95
    },
    {
      state: 'Uttarakhand',
      stateCode: 'UK',
      schemes: [{
        name: 'Uttarakhand Jal Sanrakshan Yojana',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'Hill areas priority',
          incomeLimit: 300000
        },
        subsidy: { percentage: 55, maxAmount: 65000 },
        contactInfo: {
          department: 'Uttarakhand Jal Sansthan',
          phone: '0135-2710346',
          website: 'www.ukjalvigyan.org',
          email: 'secy-jal@uttarakhand.gov.in'
        },
        documentsRequired: ['Income certificate', 'Property documents', 'Environmental clearance'],
        applicationProcess: 'Through District Magistrate office'
      }],
      coordinateBounds: { north: 31.45, south: 28.43, east: 81.03, west: 77.34 },
      marketModifier: 1.05
    },
    {
      state: 'Jammu and Kashmir',
      stateCode: 'JK',
      schemes: [{
        name: 'J&K Water Conservation Mission',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 50, maxAmount: 60000 },
        contactInfo: {
          department: 'J&K Public Health Engineering Department',
          phone: '0191-2520292',
          website: 'www.jkphed.nic.in',
          email: 'secy-phed@jk.gov.in'
        },
        documentsRequired: ['Domicile certificate', 'Property documents', 'Income certificate'],
        applicationProcess: 'Apply through Deputy Commissioner office'
      }],
      coordinateBounds: { north: 37.10, south: 32.30, east: 80.30, west: 72.60 },
      marketModifier: 1.25
    },
    {
      state: 'Ladakh',
      stateCode: 'LA',
      schemes: [{
        name: 'Ladakh Water Harvesting Initiative',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'All properties eligible'
        },
        subsidy: { percentage: 70, maxAmount: 80000 },
        contactInfo: {
          department: 'Ladakh Autonomous Hill Development Council',
          phone: '01982-252101',
          website: 'www.leh.nic.in',
          email: 'secy-ladakh@ladakh.gov.in'
        },
        documentsRequired: ['Local certificate', 'Property documents', 'Income proof'],
        applicationProcess: 'Through LAHDC office'
      }],
      coordinateBounds: { north: 36.50, south: 32.50, east: 79.50, west: 75.50 },
      marketModifier: 1.4
    },
  
    // WESTERN STATES  
    {
      state: 'Rajasthan',
      stateCode: 'RJ',
      schemes: [{
        name: 'Rajasthan Farm Pond Scheme',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'villa'],
          areaCriteria: 'Desert areas priority'
        },
        subsidy: { percentage: 70, maxAmount: 135000 },
        contactInfo: {
          department: 'Rajasthan Water Resources Department',
          phone: '0141-5114054',
          website: 'www.water.rajasthan.gov.in',
          email: 'secy-water@rajasthan.gov.in'
        },
        documentsRequired: ['Farmer ID', 'Property documents', 'Caste certificate'],
        applicationProcess: 'Through Agriculture Department'
      }],
      coordinateBounds: { north: 30.18, south: 23.03, east: 78.17, west: 69.30 },
      marketModifier: 0.9
    },
    {
      state: 'Gujarat',
      stateCode: 'GJ',
      schemes: [{
        name: 'Gujarat Jal Sanchay Abhiyan',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'commercial', 'institutional'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 50, maxAmount: 75000 },
        contactInfo: {
          department: 'Gujarat Water Resources Department',
          phone: '079-23254880',
          website: 'www.gujaratindia.gov.in',
          email: 'secy-narmada@gujarat.gov.in'
        },
        documentsRequired: ['Aadhar card', 'Property documents', 'Income certificate'],
        applicationProcess: 'Online through Gujarat government portal'
      }],
      coordinateBounds: { north: 24.71, south: 20.06, east: 74.47, west: 68.16 },
      marketModifier: 1.1
    },
    {
      state: 'Maharashtra',
      stateCode: 'MH',
      schemes: [{
        name: 'Maharashtra Jalyukta Shivar Abhiyan',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'commercial', 'villa'],
          areaCriteria: 'Drought-prone areas priority'
        },
        subsidy: { percentage: 40, maxAmount: 50000 },
        contactInfo: {
          department: 'Maharashtra Water Conservation Department',
          phone: '022-22026082',
          website: 'www.maharashtra.gov.in',
          email: 'secy-water@maharashtra.gov.in'
        },
        documentsRequired: ['Property documents', 'Income certificate', 'Technical proposal'],
        applicationProcess: 'Through District Collector office'
      }],
      coordinateBounds: { north: 22.03, south: 15.60, east: 80.89, west: 72.66 },
      marketModifier: 1.2
    },
    {
      state: 'Goa',
      stateCode: 'GA',
      schemes: [{
        name: 'Goa Rainwater Harvesting Scheme',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'commercial', 'villa'],
          areaCriteria: 'All properties eligible'
        },
        subsidy: { percentage: 50, maxAmount: 100000, minAmount: 10000 },
        contactInfo: {
          department: 'Goa Water Resources Department',
          phone: '0832-2419501',
          website: 'https://goawrd.gov.in',
          email: 'secy-wrd@goa.gov.in'
        },
        documentsRequired: ['Property documents', 'Technical proposal', 'Environmental clearance'],
        applicationProcess: 'Online application through Goa government portal'
      }],
      coordinateBounds: { north: 15.80, south: 14.90, east: 74.34, west: 73.40 },
      marketModifier: 1.35
    },
    {
      state: 'Madhya Pradesh',
      stateCode: 'MP',
      schemes: [{
        name: 'MP Kapildhara Scheme',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'commercial'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 45, maxAmount: 60000 },
        contactInfo: {
          department: 'MP Water Resources Department',
          phone: '0755-2441242',
          website: 'www.mp.gov.in',
          email: 'secy-water@mp.gov.in'
        },
        documentsRequired: ['Property documents', 'Income certificate', 'Bank details'],
        applicationProcess: 'Through Panchayat or Municipal Corporation'
      }],
      coordinateBounds: { north: 26.87, south: 21.08, east: 82.78, west: 74.02 },
      marketModifier: 0.85
    },
    {
      state: 'Chhattisgarh',
      stateCode: 'CG',
      schemes: [{
        name: 'Chhattisgarh Narwa Development Program',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 50, maxAmount: 45000 },
        contactInfo: {
          department: 'Chhattisgarh Water Resources Department',
          phone: '0771-2443051',
          website: 'www.cgwater.gov.in',
          email: 'secy-water@chhattisgarh.gov.in'
        },
        documentsRequired: ['Aadhar card', 'Property documents', 'Income proof'],
        applicationProcess: 'Through Block office or online portal'
      }],
      coordinateBounds: { north: 24.10, south: 17.78, east: 84.35, west: 80.27 },
      marketModifier: 0.8
    },
  
    // SOUTHERN STATES
    {
      state: 'Tamil Nadu',
      stateCode: 'TN',
      schemes: [{
        name: 'Tamil Nadu Mandatory RWH Program',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'commercial', 'institutional'],
          areaCriteria: 'Mandatory for all buildings'
        },
        subsidy: { percentage: 30, maxAmount: 35000 },
        contactInfo: {
          department: 'Tamil Nadu Water Resources Organisation',
          phone: '044-25674070',
          website: 'www.twro.tn.gov.in',
          email: 'secy-wr@tn.gov.in'
        },
        documentsRequired: ['Building plan approval', 'Property documents', 'Compliance certificate'],
        applicationProcess: 'Mandatory compliance - no application needed'
      }],
      coordinateBounds: { north: 13.48, south: 8.07, east: 80.35, west: 76.23 },
      marketModifier: 1.1
    },
    {
      state: 'Karnataka',
      stateCode: 'KA',
      schemes: [{
        name: 'Karnataka Krishi Bhagya Scheme',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'commercial', 'villa'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 50, maxAmount: 70000 },
        contactInfo: {
          department: 'Karnataka Water Resources Department',
          phone: '080-22253351',
          website: 'www.waterresources.kar.nic.in',
          email: 'secy-wr@karnataka.gov.in'
        },
        documentsRequired: ['Property documents', 'Income certificate', 'Technical approval'],
        applicationProcess: 'Online through Karnataka government portal'
      }],
      coordinateBounds: { north: 18.45, south: 11.31, east: 78.59, west: 74.12 },
      marketModifier: 1.05
    },
    {
      state: 'Kerala',
      stateCode: 'KL',
      schemes: [{
        name: 'Kerala Mandatory RWH Rules',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'commercial', 'institutional'],
          areaCriteria: 'Mandatory for new constructions'
        },
        subsidy: { percentage: 40, maxAmount: 50000 },
        contactInfo: {
          department: 'Kerala Water Authority',
          phone: '0471-2325977',
          website: 'www.kwa.kerala.gov.in',
          email: 'cmd@kwa.kerala.gov.in'
        },
        documentsRequired: ['Building permit', 'Property documents', 'Environmental clearance'],
        applicationProcess: 'Through Kerala Water Authority'
      }],
      coordinateBounds: { north: 12.78, south: 8.18, east: 77.42, west: 74.86 },
      marketModifier: 1.2
    },
    {
      state: 'Andhra Pradesh',
      stateCode: 'AP',
      schemes: [{
        name: 'AP Neeru Chettu Program',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'commercial', 'institutional'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 45, maxAmount: 55000 },
        contactInfo: {
          department: 'AP Water Resources Department',
          phone: '0863-2340327',
          website: 'www.apwater.gov.in',
          email: 'secy-water@ap.gov.in'
        },
        documentsRequired: ['Aadhar card', 'Property documents', 'Income certificate'],
        applicationProcess: 'Through Village/Ward Secretariat'
      }],
      coordinateBounds: { north: 19.92, south: 12.62, east: 84.75, west: 76.76 },
      marketModifier: 0.9
    },
    {
      state: 'Telangana',
      stateCode: 'TG',
      schemes: [{
        name: 'Telangana Mission Kakatiya',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'commercial'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 50, maxAmount: 60000 },
        contactInfo: {
          department: 'Telangana Water Resources Department',
          phone: '040-23454909',
          website: 'www.telangana.gov.in',
          email: 'secy-irrigation@telangana.gov.in'
        },
        documentsRequired: ['Property documents', 'Income proof', 'Technical proposal'],
        applicationProcess: 'Online through TS-iPASS portal'
      }],
      coordinateBounds: { north: 19.92, south: 15.85, east: 81.78, west: 77.27 },
      marketModifier: 0.95
    },
  
    // EASTERN STATES
    {
      state: 'West Bengal',
      stateCode: 'WB',
      schemes: [{
        name: 'West Bengal Jal Dharo Jal Bharo',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 40, maxAmount: 40000 },
        contactInfo: {
          department: 'West Bengal Water Investigation & Development Department',
          phone: '033-22143526',
          website: 'www.wbiwd.gov.in',
          email: 'secy-wid@wb.gov.in'
        },
        documentsRequired: ['Voter ID', 'Property documents', 'Income certificate'],
        applicationProcess: 'Through Panchayat/Municipality'
      }],
      coordinateBounds: { north: 27.23, south: 21.25, east: 89.83, west: 85.82 },
      marketModifier: 1.0
    },
    {
      state: 'Odisha',
      stateCode: 'OD',
      schemes: [{
        name: 'CHHATA - Rooftop Rainwater Harvesting Scheme',
        eligibility: {
          propertyTypes: ['individual_house'],
          areaCriteria: 'Roof area 50-200 sq.m',
          occupancyLimit: 3 // floors
        },
        subsidy: { percentage: 50, maxAmount: 55000 },
        contactInfo: {
          department: 'Housing & Urban Development Department',
          phone: '0674-2536000',
          website: 'https://echhata.odisha.gov.in',
          email: 'secy-hudd@odisha.gov.in'
        },
        documentsRequired: ['Property documents', 'Building plan', 'Aadhar card', 'Bank details'],
        applicationProcess: 'Online through CHHATA portal'
      }],
      coordinateBounds: { north: 22.57, south: 17.78, east: 87.53, west: 81.37 },
      marketModifier: 0.85
    },
    {
      state: 'Jharkhand',
      stateCode: 'JH',
      schemes: [{
        name: 'Jharkhand Mukhyamantri Jal Swavlamban Yojana',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 50, maxAmount: 45000 },
        contactInfo: {
          department: 'Jharkhand Water Resources Department',
          phone: '0651-2491040',
          website: 'www.jharkhand.gov.in',
          email: 'secy-water@jharkhand.gov.in'
        },
        documentsRequired: ['Aadhar card', 'Property documents', 'Income proof'],
        applicationProcess: 'Through Block Development Office'
      }],
      coordinateBounds: { north: 25.32, south: 21.95, east: 87.57, west: 83.32 },
      marketModifier: 0.8
    },
    {
      state: 'Bihar',
      stateCode: 'BR',
      schemes: [{
        name: 'Bihar Jal-Jeevan-Hariyali Mission',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 60, maxAmount: 50000 },
        contactInfo: {
          department: 'Bihar Water Resources Department',
          phone: '0612-2215497',
          website: 'www.wrd.bih.nic.in',
          email: 'secy-water@bihar.gov.in'
        },
        documentsRequired: ['BPL card', 'Property documents', 'Income certificate'],
        applicationProcess: 'Through Mukhiya/Ward Member'
      }],
      coordinateBounds: { north: 27.52, south: 24.20, east: 88.17, west: 83.19 },
      marketModifier: 0.75
    },
  
    // NORTHEASTERN STATES
    {
      state: 'Assam',
      stateCode: 'AS',
      schemes: [{
        name: 'Assam Jal Nirmal Mission',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'Hill areas priority'
        },
        subsidy: { percentage: 65, maxAmount: 70000 },
        contactInfo: {
          department: 'Assam Public Health Engineering Department',
          phone: '0361-2540994',
          website: 'www.phe.assam.gov.in',
          email: 'secy-phe@assam.gov.in'
        },
        documentsRequired: ['ST/SC certificate', 'Property documents', 'Income proof'],
        applicationProcess: 'Through District Commissioner'
      }],
      coordinateBounds: { north: 28.22, south: 24.44, east: 96.02, west: 89.70 },
      marketModifier: 1.1
    },
    {
      state: 'Meghalaya',
      stateCode: 'ML',
      schemes: [{
        name: 'Meghalaya Water Conservation Mission',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 70, maxAmount: 75000 },
        contactInfo: {
          department: 'Meghalaya Public Health Engineering Department',
          phone: '0364-2500590',
          website: 'www.meghalaya.gov.in',
          email: 'secy-phe@meghalaya.gov.in'
        },
        documentsRequired: ['Tribal certificate', 'Property documents', 'Income proof'],
        applicationProcess: 'Through Autonomous District Council'
      }],
      coordinateBounds: { north: 26.11, south: 25.01, east: 92.80, west: 89.87 },
      marketModifier: 1.3
    },
    {
      state: 'Manipur',
      stateCode: 'MN',
      schemes: [{
        name: 'Manipur Loktak Jal Shakti Abhiyan',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'Valley areas priority'
        },
        subsidy: { percentage: 65, maxAmount: 65000 },
        contactInfo: {
          department: 'Manipur Public Health Engineering Department',
          phone: '0385-2447987',
          website: 'www.manipur.gov.in',
          email: 'secy-phed@manipur.gov.in'
        },
        documentsRequired: ['Manipuri certificate', 'Property documents', 'Income proof'],
        applicationProcess: 'Through Deputy Commissioner'
      }],
      coordinateBounds: { north: 25.68, south: 23.83, east: 94.78, west: 93.03 },
      marketModifier: 1.2
    },
    {
      state: 'Tripura',
      stateCode: 'TR',
      schemes: [{
        name: 'Tripura Jal Jeewan Mission',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 60, maxAmount: 55000 },
        contactInfo: {
          department: 'Tripura Public Health Engineering Department',
          phone: '0381-2325248',
          website: 'www.tripura.gov.in',
          email: 'secy-phe@tripura.gov.in'
        },
        documentsRequired: ['ST certificate', 'Property documents', 'BPL card'],
        applicationProcess: 'Through Block Development Office'
      }],
      coordinateBounds: { north: 24.54, south: 22.93, east: 92.67, west: 91.10 },
      marketModifier: 1.15
    },
    {
      state: 'Mizoram',
      stateCode: 'MZ',
      schemes: [{
        name: 'Mizoram New Land Use Policy Water Component',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'Hill areas eligible'
        },
        subsidy: { percentage: 75, maxAmount: 80000 },
        contactInfo: {
          department: 'Mizoram Public Health Engineering Department',
          phone: '0389-2322656',
          website: 'www.mizoram.gov.in',
          email: 'secy-phed@mizoram.gov.in'
        },
        documentsRequired: ['Mizo certificate', 'Property documents', 'Income proof'],
        applicationProcess: 'Through Village Council'
      }],
      coordinateBounds: { north: 24.64, south: 21.94, east: 93.63, west: 92.16 },
      marketModifier: 1.4
    },
    {
      state: 'Arunachal Pradesh',
      stateCode: 'AR',
      schemes: [{
        name: 'Arunachal Pradesh Hill Area Development Program',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'All hill areas eligible'
        },
        subsidy: { percentage: 80, maxAmount: 90000 },
        contactInfo: {
          department: 'Arunachal Pradesh Public Health Engineering & Water Supply',
          phone: '0360-2214740',
          website: 'www.arunachalpradesh.gov.in',
          email: 'secy-phe@arunachal.gov.in'
        },
        documentsRequired: ['ST certificate', 'Property documents', 'Income proof'],
        applicationProcess: 'Through Deputy Commissioner'
      }],
      coordinateBounds: { north: 29.45, south: 26.63, east: 97.43, west: 91.60 },
      marketModifier: 1.5
    },
    {
      state: 'Nagaland',
      stateCode: 'NL',
      schemes: [{
        name: 'Nagaland Water Conservation & Livelihood Mission',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'All tribal areas eligible'
        },
        subsidy: { percentage: 75, maxAmount: 85000 },
        contactInfo: {
          department: 'Nagaland Public Health Engineering Department',
          phone: '0370-2290524',
          website: 'www.nagaland.gov.in',
          email: 'secy-phed@nagaland.gov.in'
        },
        documentsRequired: ['ST certificate', 'Property documents', 'Village certification'],
        applicationProcess: 'Through Traditional Village Council'
      }],
      coordinateBounds: { north: 27.04, south: 25.21, east: 95.76, west: 93.32 },
      marketModifier: 1.35
    },
    {
      state: 'Sikkim',
      stateCode: 'SK',
      schemes: [{
        name: 'Sikkim Organic Water Management Program',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 70, maxAmount: 75000 },
        contactInfo: {
          department: 'Sikkim Public Health Engineering Department',
          phone: '03592-202544',
          website: 'www.sikkim.gov.in',
          email: 'secy-phed@sikkim.gov.in'
        },
        documentsRequired: ['ST certificate', 'Property documents', 'Organic certification'],
        applicationProcess: 'Through Block Administrative Centre'
      }],
      coordinateBounds: { north: 28.13, south: 27.05, east: 88.91, west: 87.97 },
      marketModifier: 1.25
    },
  
    // UNION TERRITORIES
    {
      state: 'Chandigarh',
      stateCode: 'CH',
      schemes: [{
        name: 'Chandigarh Smart City Water Initiative',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'commercial', 'institutional'],
          areaCriteria: 'All sectors eligible'
        },
        subsidy: { percentage: 45, maxAmount: 55000 },
        contactInfo: {
          department: 'Chandigarh Municipal Corporation',
          phone: '0172-2749376',
          website: 'www.chandigarhmc.gov.in',
          email: 'mc@chd.gov.in'
        },
        documentsRequired: ['Property documents', 'Building plan', 'Income certificate'],
        applicationProcess: 'Online through Chandigarh government portal'
      }],
      coordinateBounds: { north: 30.76, south: 30.67, east: 76.86, west: 76.72 },
      marketModifier: 1.3
    },
    {
      state: 'Puducherry',
      stateCode: 'PY',
      schemes: [{
        name: 'Puducherry Water Security Mission',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'commercial'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 40, maxAmount: 45000 },
        contactInfo: {
          department: 'Puducherry Public Works Department',
          phone: '0413-2334817',
          website: 'www.py.gov.in',
          email: 'secy-pwd@py.gov.in'
        },
        documentsRequired: ['Property documents', 'Income certificate', 'Technical proposal'],
        applicationProcess: 'Through Commune Panchayat/Municipality'
      }],
      coordinateBounds: { north: 12.07, south: 11.73, east: 79.86, west: 79.74 },
      marketModifier: 1.15
    },
    {
      state: 'Andaman and Nicobar Islands',
      stateCode: 'AN',
      schemes: [{
        name: 'A&N Islands Water Conservation Program',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'All islands eligible'
        },
        subsidy: { percentage: 75, maxAmount: 100000 },
        contactInfo: {
          department: 'A&N Administration Public Health Engineering Department',
          phone: '03192-232102',
          website: 'www.andaman.gov.in',
          email: 'secy-phe@and.gov.in'
        },
        documentsRequired: ['Local certificate', 'Property documents', 'Income proof'],
        applicationProcess: 'Through Deputy Commissioner'
      }],
      coordinateBounds: { north: 13.68, south: 6.75, east: 93.90, west: 92.20 },
      marketModifier: 1.6
    },
    {
      state: 'Lakshadweep',
      stateCode: 'LD',
      schemes: [{
        name: 'Lakshadweep Freshwater Initiative',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'institutional'],
          areaCriteria: 'All inhabited islands'
        },
        subsidy: { percentage: 80, maxAmount: 120000 },
        contactInfo: {
          department: 'Lakshadweep Administration',
          phone: '04896-262221',
          website: 'www.lakshadweep.gov.in',
          email: 'admin@lakshadweep.gov.in'
        },
        documentsRequired: ['Island domicile', 'Property documents', 'Community certificate'],
        applicationProcess: 'Through Island Administration'
      }],
      coordinateBounds: { north: 12.30, south: 8.00, east: 74.00, west: 71.70 },
      marketModifier: 2.0
    },
    {
      state: 'Dadra and Nagar Haveli and Daman and Diu',
      stateCode: 'DD',
      schemes: [{
        name: 'DNH & DD Water Conservation Scheme',
        eligibility: {
          propertyTypes: ['individual_house', 'apartment', 'commercial'],
          areaCriteria: 'All areas eligible'
        },
        subsidy: { percentage: 50, maxAmount: 60000 },
        contactInfo: {
          department: 'DNH & DD Administration',
          phone: '0260-2642451',
          website: 'www.dnh.gov.in',
          email: 'admin@dnh.gov.in'
        },
        documentsRequired: ['Property documents', 'Income certificate', 'Local certificate'],
        applicationProcess: 'Through Collector office'
      }],
      coordinateBounds: { north: 20.43, south: 20.13, east: 73.23, west: 70.90 },
      marketModifier: 1.2
    }
  ];
  