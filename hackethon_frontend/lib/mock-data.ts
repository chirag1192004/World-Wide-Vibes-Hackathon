// Mock data for CivicPulse Atlas Edition
// This data structure matches the backend API contract for future integration

export interface HeatmapPoint {
  lat: number
  lng: number
  survival_score: number
}

export interface PermitHistory {
  year: number
  business_name: string
  permit_type: string
  status: 'active' | 'expired_closed' | 'revoked'
}

export interface BlockAnalysis {
  address: string
  lat: number
  lng: number
  survival_score: number
  business_category: string
  permit_history: PermitHistory[]
  crime_density_halfmile: number
  competitor_count: number
  investment_trend: 'rising' | 'stable' | 'declining'
  city_spend_last_3yr: number
  top_3_alternatives: {
    address: string
    survival_score: number
  }[]
}

export interface Contract {
  contract_id: string
  category: string
  estimated_value: number
  historical_frequency: string
  last_awarded: string
  predicted_next: string
  matched_business: {
    name: string
    address: string
    industry: string
    website: string
    match_score: number
  }
}

export interface Neighborhood {
  name: string
  lat: number
  lng: number
  civic_health_score: number
  infrastructure_score: number
  permit_velocity_score: number
  safety_score: number
  contract_equity_score: number
  city_spend_last_3yr: number
  active_permits_count: number
  crime_incidents_last_yr: number
  council_member: string
  comparison_district: {
    name: string
    city_spend_last_3yr: number
  }
  investment_gap: number
}

// Montgomery, AL heatmap data points
export const mockHeatmapData: HeatmapPoint[] = [
  { lat: 32.3792, lng: -86.3077, survival_score: 72 },
  { lat: 32.3617, lng: -86.2964, survival_score: 85 },
  { lat: 32.3550, lng: -86.2800, survival_score: 45 },
  { lat: 32.3680, lng: -86.3150, survival_score: 61 },
  { lat: 32.3720, lng: -86.2890, survival_score: 38 },
  { lat: 32.3480, lng: -86.3020, survival_score: 92 },
  { lat: 32.3590, lng: -86.2750, survival_score: 55 },
  { lat: 32.3750, lng: -86.2680, survival_score: 78 },
  { lat: 32.3420, lng: -86.2920, survival_score: 28 },
  { lat: 32.3650, lng: -86.2550, survival_score: 67 },
  { lat: 32.3810, lng: -86.3200, survival_score: 42 },
  { lat: 32.3530, lng: -86.3100, survival_score: 89 },
  { lat: 32.3700, lng: -86.2400, survival_score: 51 },
  { lat: 32.3580, lng: -86.3250, survival_score: 76 },
  { lat: 32.3450, lng: -86.2650, survival_score: 33 },
  { lat: 32.3840, lng: -86.2780, survival_score: 64 },
  { lat: 32.3620, lng: -86.3080, survival_score: 81 },
  { lat: 32.3490, lng: -86.2480, survival_score: 47 },
  { lat: 32.3760, lng: -86.2600, survival_score: 94 },
  { lat: 32.3560, lng: -86.2950, survival_score: 59 },
]

export const mockBlockAnalysis: BlockAnalysis = {
  address: '123 Dexter Ave, Montgomery AL',
  lat: 32.3792,
  lng: -86.3077,
  survival_score: 61,
  business_category: 'restaurant',
  permit_history: [
    {
      year: 2023,
      business_name: 'Southern Comfort Cafe',
      permit_type: 'food_service',
      status: 'active',
    },
    {
      year: 2021,
      business_name: 'Quick Bites Diner',
      permit_type: 'food_service',
      status: 'expired_closed',
    },
    {
      year: 2019,
      business_name: "Mama's Kitchen",
      permit_type: 'new_commercial',
      status: 'expired_closed',
    },
    {
      year: 2017,
      business_name: 'Downtown Grill',
      permit_type: 'food_service',
      status: 'revoked',
    },
  ],
  crime_density_halfmile: 14,
  competitor_count: 3,
  investment_trend: 'rising',
  city_spend_last_3yr: 245000,
  top_3_alternatives: [
    { address: '456 Fairview Ave, Montgomery AL', survival_score: 84 },
    { address: '789 Atlanta Hwy, Montgomery AL', survival_score: 81 },
    { address: '321 Mobile Rd, Montgomery AL', survival_score: 79 },
  ],
}

export const mockContracts: Contract[] = [
  {
    contract_id: 'MGM-2025-0042',
    category: 'landscaping',
    estimated_value: 42000,
    historical_frequency: 'Annual',
    last_awarded: '2024-04-15',
    predicted_next: 'April 2025',
    matched_business: {
      name: 'Green Thumb Montgomery',
      address: '88 Oak Park Dr',
      industry: 'landscaping',
      website: 'greenthumbmgm.com',
      match_score: 91,
    },
  },
  {
    contract_id: 'MGM-2025-0067',
    category: 'janitorial_services',
    estimated_value: 85000,
    historical_frequency: 'Bi-annual',
    last_awarded: '2024-01-20',
    predicted_next: 'July 2025',
    matched_business: {
      name: 'Spotless Solutions LLC',
      address: '220 Commerce St',
      industry: 'cleaning',
      website: 'spotlessmgm.com',
      match_score: 87,
    },
  },
  {
    contract_id: 'MGM-2025-0089',
    category: 'road_maintenance',
    estimated_value: 156000,
    historical_frequency: 'Quarterly',
    last_awarded: '2024-12-01',
    predicted_next: 'March 2025',
    matched_business: {
      name: 'Alabama Paving Co',
      address: '455 Industrial Blvd',
      industry: 'construction',
      website: 'alpaving.com',
      match_score: 94,
    },
  },
  {
    contract_id: 'MGM-2025-0103',
    category: 'security_services',
    estimated_value: 72000,
    historical_frequency: 'Annual',
    last_awarded: '2024-06-15',
    predicted_next: 'June 2025',
    matched_business: {
      name: 'River Region Security',
      address: '128 Guard Lane',
      industry: 'security',
      website: 'rrsecurity.com',
      match_score: 82,
    },
  },
]

export const mockNeighborhoods: Record<string, Neighborhood> = {
  capitol_heights: {
    name: 'Capitol Heights',
    lat: 32.3617,
    lng: -86.2792,
    civic_health_score: 48,
    infrastructure_score: 45,
    permit_velocity_score: 62,
    safety_score: 71,
    contract_equity_score: 24,
    city_spend_last_3yr: 180000,
    active_permits_count: 12,
    crime_incidents_last_yr: 94,
    council_member: 'Robert Gambote',
    comparison_district: {
      name: 'Garden District',
      city_spend_last_3yr: 2100000,
    },
    investment_gap: 1920000,
  },
  cloverdale: {
    name: 'Cloverdale',
    lat: 32.3550,
    lng: -86.3100,
    civic_health_score: 78,
    infrastructure_score: 82,
    permit_velocity_score: 75,
    safety_score: 88,
    contract_equity_score: 67,
    city_spend_last_3yr: 890000,
    active_permits_count: 28,
    crime_incidents_last_yr: 32,
    council_member: 'Audrey Graham',
    comparison_district: {
      name: 'Garden District',
      city_spend_last_3yr: 2100000,
    },
    investment_gap: 1210000,
  },
  garden_district: {
    name: 'Garden District',
    lat: 32.3680,
    lng: -86.3200,
    civic_health_score: 92,
    infrastructure_score: 95,
    permit_velocity_score: 88,
    safety_score: 94,
    contract_equity_score: 91,
    city_spend_last_3yr: 2100000,
    active_permits_count: 45,
    crime_incidents_last_yr: 18,
    council_member: 'Charles Jinright',
    comparison_district: {
      name: 'Capitol Heights',
      city_spend_last_3yr: 180000,
    },
    investment_gap: 0,
  },
  old_cloverdale: {
    name: 'Old Cloverdale',
    lat: 32.3480,
    lng: -86.3020,
    civic_health_score: 65,
    infrastructure_score: 58,
    permit_velocity_score: 72,
    safety_score: 76,
    contract_equity_score: 54,
    city_spend_last_3yr: 420000,
    active_permits_count: 19,
    crime_incidents_last_yr: 47,
    council_member: 'Audrey Graham',
    comparison_district: {
      name: 'Garden District',
      city_spend_last_3yr: 2100000,
    },
    investment_gap: 1680000,
  },
  downtown: {
    name: 'Downtown Montgomery',
    lat: 32.3792,
    lng: -86.3077,
    civic_health_score: 72,
    infrastructure_score: 78,
    permit_velocity_score: 85,
    safety_score: 58,
    contract_equity_score: 68,
    city_spend_last_3yr: 1250000,
    active_permits_count: 67,
    crime_incidents_last_yr: 124,
    council_member: 'Robert Gambote',
    comparison_district: {
      name: 'Garden District',
      city_spend_last_3yr: 2100000,
    },
    investment_gap: 850000,
  },
}

// AI-generated prospectus templates (mock)
export const mockProspectus = `The survival score of 61 indicates moderate commercial viability at this address. Three businesses have operated here since 2018 — two closed within 14 months. Crime density in the half-mile radius stands at 14 incidents annually, which is below the city average of 21.

The two primary risk factors are competitor saturation (3 active food-service permits within 0.8 miles) and the building's history of short-tenancy cycles, which suggests structural lease issues or foot traffic limitations.

Recommendation: Do not sign a multi-year lease here. If you proceed, negotiate a 6-month trial term. Alternatively, 456 Fairview Ave scores 84/100 with zero direct competitors in this category and a rising investment trend.`

export const mockBidProposal = `1. COVER LETTER
Green Thumb Montgomery is a family-operated local business committed to serving the City of Montgomery with excellence in landscaping and grounds maintenance services.

2. SCOPE OF WORK
• Weekly mowing and edging of all designated city parcels
• Monthly mulching of municipal flower beds
• Seasonal planting (spring/fall cycles)
• Emergency storm debris removal as needed

3. PRICING SCHEDULE
Weekly maintenance (52 visits): $28,000
Monthly mulching (12 cycles): $6,000
Seasonal planting (2 cycles): $5,500
Emergency response reserve: $2,500
TOTAL: $42,000 (within budget allocation)

4. TIMELINE
Week 1: Site survey and crew scheduling
Week 2: Service commencement on all designated parcels
Monthly: Progress reporting to City Facilities Manager
Quarterly: Performance review meetings

5. WHY US
Green Thumb Montgomery has served Montgomery property owners for 7 years, employing 12 local residents. We are certified, insured, and ready to serve our city with the same dedication we bring to every client.`

export const mockAdvocacyLetter = `Dear Councilmember Robert Gambote,

I am writing as a resident of Capitol Heights to formally request that the City of Montgomery address the growing investment disparity affecting our neighborhood.

According to public city records, Capitol Heights received $180,000 in infrastructure investment over the past three years. During the same period, the Garden District received $2,100,000 — a gap of $1,920,000. Our neighborhood's Civic Health Score stands at 48 out of 100, significantly below the city average.

The specific deficits we experience daily include deteriorating road surfaces, insufficient streetlight coverage, and deferred maintenance at Oakwood Park. These conditions affect public safety, property values, and quality of life for our families.

I respectfully request that the City Council allocate additional infrastructure funding to Capitol Heights in the upcoming fiscal year budget. Our community deserves the same investment that wealthier districts receive.

Sincerely,
A Capitol Heights Resident`

// Business categories for entrepreneur mode
export const BUSINESS_CATEGORIES = [
  'restaurant',
  'salon',
  'retail',
  'auto',
  'cafe',
  'gym',
  'barbershop',
  'clinic',
  'pharmacy',
  'bakery',
] as const

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number]

// Helper function to get neighborhood by coordinates
export function getNeighborhoodByCoords(lat: number, lng: number): Neighborhood {
  // Simple distance calculation to find nearest neighborhood
  let nearest = mockNeighborhoods.downtown
  let minDistance = Infinity

  for (const neighborhood of Object.values(mockNeighborhoods)) {
    const distance = Math.sqrt(
      Math.pow(neighborhood.lat - lat, 2) + Math.pow(neighborhood.lng - lng, 2)
    )
    if (distance < minDistance) {
      minDistance = distance
      nearest = neighborhood
    }
  }

  return nearest
}

// Helper function to generate block analysis for an address
export function generateBlockAnalysis(
  address: string,
  category: BusinessCategory
): BlockAnalysis {
  // Generate deterministic but varied scores based on address
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const survivalScore = 30 + (hash % 60)

  return {
    ...mockBlockAnalysis,
    address,
    business_category: category,
    survival_score: survivalScore,
    crime_density_halfmile: 5 + (hash % 25),
    competitor_count: 1 + (hash % 5),
    investment_trend: survivalScore > 60 ? 'rising' : survivalScore > 40 ? 'stable' : 'declining',
  }
}
