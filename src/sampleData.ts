export interface PresetSample {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  coordinates: { lat: number; lng: number };
  defaultAnalysis: {
    isViolation: boolean;
    violationType: string;
    confidenceScore: number;
    vehicleMakeModel: string;
    licensePlate: string;
    proofSummary: string;
    locationDescription: string;
    suggestedFine: number;
    penaltyCode: string;
  };
}

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'sample-hydrant',
    title: 'Fire Hydrant Blockage',
    description: 'Vehicle parked within 3 feet of active red curb fire hydrant.',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    location: '482 Montgomery St, Financial District',
    coordinates: { lat: 37.7935, lng: -122.4031 },
    defaultAnalysis: {
      isViolation: true,
      violationType: 'Parked in Designated Fire Hydrant Zone',
      confidenceScore: 97,
      vehicleMakeModel: 'Silver Toyota Camry Sedan',
      licensePlate: '7XYZ492',
      proofSummary: 'Tire is resting inside painted red curb marking. Front fender is located 3.1 feet from active municipal fire hydrant.',
      locationDescription: '482 Montgomery St, Financial District',
      suggestedFine: 85,
      penaltyCode: 'CIV-302 (Obstruction of Fire Fixture)',
    },
  },
  {
    id: 'sample-double-parking',
    title: 'Double Parked in Bike Lane',
    description: 'Vehicle stopped parallel to curb obstructing cyclists.',
    imageUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
    location: 'Valencia St & 18th St, Mission Corridor',
    coordinates: { lat: 37.7618, lng: -122.4215 },
    defaultAnalysis: {
      isViolation: true,
      violationType: 'Double Parking in Designated Bicycle Corridor',
      confidenceScore: 95,
      vehicleMakeModel: 'Dark Grey Ford Explorer SUV',
      licensePlate: '8MNP104',
      proofSummary: 'Vehicle halted in second travel lane adjacent to parked row, completely blocking designated green bike lane transit path.',
      locationDescription: 'Valencia St & 18th St, Mission Corridor',
      suggestedFine: 110,
      penaltyCode: 'CIV-118 (Double Parking Infraction)',
    },
  },
  {
    id: 'sample-sidewalk',
    title: 'Pedestrian Ramp Obstruction',
    description: 'Car blocking wheelchair tactile paving ramp.',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    location: 'Geary Blvd & 12th Ave',
    coordinates: { lat: 37.7808, lng: -122.4712 },
    defaultAnalysis: {
      isViolation: true,
      violationType: 'Wheelchair Ramp & ADA Sidewalk Blockage',
      confidenceScore: 98,
      vehicleMakeModel: 'Royal Blue Honda Accord',
      licensePlate: '6KLT883',
      proofSummary: 'Rear bumper and right tire are parked squarely on the yellow ADA tactile curb cut, preventing wheelchair transition to street level.',
      locationDescription: 'Geary Blvd & 12th Ave',
      suggestedFine: 125,
      penaltyCode: 'CIV-405 (ADA Access Point Blockage)',
    },
  },
];
