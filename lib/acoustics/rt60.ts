/**
 * RT60 Reverberation Time Calculations
 * Implements Sabine and Eyring equations for predicting reverberation time
 */

export interface RoomSurface {
  area: number; // m²
  material: string;
  absorptionCoefficients: {
    125: number;
    250: number;
    500: number;
    1000: number;
    2000: number;
    4000: number;
  };
}

export interface RT60Result {
  sabine: {
    125: number;
    250: number;
    500: number;
    1000: number;
    2000: number;
    4000: number;
    average: number; // Average of 500Hz, 1kHz, 2kHz
  };
  eyring: {
    125: number;
    250: number;
    500: number;
    1000: number;
    2000: number;
    4000: number;
    average: number;
  };
  recommended: number;
  withinTarget: boolean;
}

// Common absorption coefficients for typical materials
export const ABSORPTION_COEFFICIENTS = {
  'concrete-painted': { 125: 0.10, 250: 0.05, 500: 0.06, 1000: 0.07, 2000: 0.09, 4000: 0.08 },
  'brick-painted': { 125: 0.01, 250: 0.01, 500: 0.02, 1000: 0.02, 2000: 0.02, 4000: 0.03 },
  'gypsum-board': { 125: 0.29, 250: 0.10, 500: 0.05, 1000: 0.04, 2000: 0.07, 4000: 0.09 },
  'wood-floor': { 125: 0.15, 250: 0.11, 500: 0.10, 1000: 0.07, 2000: 0.06, 4000: 0.07 },
  'carpet-heavy': { 125: 0.02, 250: 0.06, 500: 0.14, 1000: 0.37, 2000: 0.60, 4000: 0.65 },
  'acoustic-ceiling': { 125: 0.65, 250: 0.75, 500: 0.80, 1000: 0.85, 2000: 0.80, 4000: 0.75 },
  'curtains-heavy': { 125: 0.14, 250: 0.35, 500: 0.55, 1000: 0.72, 2000: 0.70, 4000: 0.65 },
  'glass-window': { 125: 0.35, 250: 0.25, 500: 0.18, 1000: 0.12, 2000: 0.07, 4000: 0.04 },
  'audience-seated': { 125: 0.60, 250: 0.74, 500: 0.88, 1000: 0.96, 2000: 0.93, 4000: 0.85 }
};

/**
 * Calculate RT60 using Sabine equation
 * RT60 = 0.161 * V / A
 * where V = room volume (m³), A = total absorption (sabins)
 */
function calculateSabine(volume: number, totalAbsorption: number): number {
  if (totalAbsorption === 0) return Infinity;
  return (0.161 * volume) / totalAbsorption;
}

/**
 * Calculate RT60 using Eyring equation
 * RT60 = 0.161 * V / (-S * ln(1 - α))
 * where V = room volume (m³), S = total surface area (m²), α = average absorption coefficient
 */
function calculateEyring(volume: number, surfaceArea: number, avgAbsorption: number): number {
  if (avgAbsorption === 0 || avgAbsorption === 1) return Infinity;
  return (0.161 * volume) / (-surfaceArea * Math.log(1 - avgAbsorption));
}

/**
 * Calculate RT60 for a room with given dimensions and surfaces
 */
export function calculateRT60(
  dimensions: { length: number; width: number; height: number },
  surfaces: RoomSurface[],
  occupancy: { seated: number; standing?: number },
  targetRT60: { min: number; max: number }
): RT60Result {
  const volume = dimensions.length * dimensions.width * dimensions.height;
  
  // Add air absorption for high frequencies
  const airAbsorption = {
    125: 0,
    250: 0,
    500: 0,
    1000: 0.003 * volume,
    2000: 0.007 * volume,
    4000: 0.02 * volume
  };

  // Calculate absorption for each frequency
  const frequencies = [125, 250, 500, 1000, 2000, 4000] as const;
  const sabineRT60: Record<number, number> = {};
  const eyringRT60: Record<number, number> = {};
  
  frequencies.forEach(freq => {
    // Calculate total absorption for this frequency
    let totalAbsorption = airAbsorption[freq];
    let totalSurfaceArea = 0;
    
    surfaces.forEach(surface => {
      const absorption = surface.area * surface.absorptionCoefficients[freq];
      totalAbsorption += absorption;
      totalSurfaceArea += surface.area;
    });
    
    // Add absorption from occupants (if any)
    if (occupancy.seated > 0) {
      const seatedAbsorption = occupancy.seated * ABSORPTION_COEFFICIENTS['audience-seated'][freq] * 0.5; // 0.5 m² per person
      totalAbsorption += seatedAbsorption;
    }
    
    // Calculate average absorption coefficient for Eyring
    const avgAbsorption = totalAbsorption / totalSurfaceArea;
    
    // Calculate RT60 using both methods
    sabineRT60[freq] = calculateSabine(volume, totalAbsorption);
    eyringRT60[freq] = calculateEyring(volume, totalSurfaceArea, avgAbsorption);
  });
  
  // Calculate averages (500Hz, 1kHz, 2kHz)
  const sabineAvg = (sabineRT60[500] + sabineRT60[1000] + sabineRT60[2000]) / 3;
  const eyringAvg = (eyringRT60[500] + eyringRT60[1000] + eyringRT60[2000]) / 3;
  
  // Determine which value to recommend (Eyring is more accurate for dead rooms)
  const recommended = sabineAvg < 1.5 ? eyringAvg : sabineAvg;
  const withinTarget = recommended >= targetRT60.min && recommended <= targetRT60.max;
  
  return {
    sabine: {
      125: sabineRT60[125],
      250: sabineRT60[250],
      500: sabineRT60[500],
      1000: sabineRT60[1000],
      2000: sabineRT60[2000],
      4000: sabineRT60[4000],
      average: sabineAvg
    },
    eyring: {
      125: eyringRT60[125],
      250: eyringRT60[250],
      500: eyringRT60[500],
      1000: eyringRT60[1000],
      2000: eyringRT60[2000],
      4000: eyringRT60[4000],
      average: eyringAvg
    },
    recommended,
    withinTarget
  };
}

/**
 * Suggest acoustic treatment to achieve target RT60
 */
export function suggestTreatment(
  currentRT60: number,
  targetRT60: number,
  roomVolume: number,
  availableSurfaces: { location: string; area: number }[]
): { location: string; material: string; area: number }[] {
  const suggestions: { location: string; material: string; area: number }[] = [];
  
  if (currentRT60 <= targetRT60) {
    return suggestions; // No treatment needed
  }
  
  // Calculate required additional absorption
  const currentAbsorption = (0.161 * roomVolume) / currentRT60;
  const targetAbsorption = (0.161 * roomVolume) / targetRT60;
  const requiredAbsorption = targetAbsorption - currentAbsorption;
  
  // Prioritize treatment locations
  const treatmentPriority = [
    { location: 'ceiling', material: 'acoustic-ceiling', avgCoeff: 0.78 },
    { location: 'rear-wall', material: 'curtains-heavy', avgCoeff: 0.53 },
    { location: 'side-walls', material: 'acoustic-panels', avgCoeff: 0.65 }
  ];
  
  let remainingAbsorption = requiredAbsorption;
  
  for (const treatment of treatmentPriority) {
    const surface = availableSurfaces.find(s => s.location.includes(treatment.location));
    if (surface && remainingAbsorption > 0) {
      const areaNeeded = Math.min(remainingAbsorption / treatment.avgCoeff, surface.area);
      suggestions.push({
        location: surface.location,
        material: treatment.material,
        area: Math.ceil(areaNeeded)
      });
      remainingAbsorption -= areaNeeded * treatment.avgCoeff;
    }
  }
  
  return suggestions;
}
