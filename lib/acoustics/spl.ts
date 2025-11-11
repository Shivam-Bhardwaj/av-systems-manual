/**
 * SPL (Sound Pressure Level) Calculations
 * Calculate speaker requirements, coverage, and power needs
 */

import { Speaker } from '../types/equipment';

export interface SPLPoint {
  x: number;
  y: number;
  z: number;
  spl: number;
  distance: number;
}

export interface SPLCalculationResult {
  averageSPL: number;
  minSPL: number;
  maxSPL: number;
  variance: number;
  coverage: SPLPoint[];
  powerRequired: number;
  speakersRequired: number;
  meetsRequirement: boolean;
}

export interface SpeakerPlacement {
  speaker: Speaker;
  position: { x: number; y: number; z: number };
  aimPoint: { x: number; y: number; z: number };
  tiltAngle: number;
  panAngle: number;
}

/**
 * Calculate SPL at a point from a speaker
 * SPL = Sensitivity + 10*log10(Power) - 20*log10(Distance) + DI
 */
export function calculateSPLAtPoint(
  speaker: Speaker,
  power: number,
  listenerPoint: { x: number; y: number; z: number },
  speakerPosition: { x: number; y: number; z: number },
  aimPoint?: { x: number; y: number; z: number }
): number {
  // Calculate distance
  const distance = Math.sqrt(
    Math.pow(listenerPoint.x - speakerPosition.x, 2) +
    Math.pow(listenerPoint.y - speakerPosition.y, 2) +
    Math.pow(listenerPoint.z - speakerPosition.z, 2)
  );
  
  // Minimum distance to avoid division issues
  const minDistance = 0.1;
  const effectiveDistance = Math.max(distance, minDistance);
  
  // Calculate off-axis angle if aim point is provided
  let directivityIndex = 0;
  if (aimPoint) {
    // Calculate speaker aim vector
    const aimVector = {
      x: aimPoint.x - speakerPosition.x,
      y: aimPoint.y - speakerPosition.y,
      z: aimPoint.z - speakerPosition.z
    };
    
    // Calculate listener vector
    const listenerVector = {
      x: listenerPoint.x - speakerPosition.x,
      y: listenerPoint.y - speakerPosition.y,
      z: listenerPoint.z - speakerPosition.z
    };
    
    // Calculate angle between vectors
    const dotProduct = aimVector.x * listenerVector.x + 
                      aimVector.y * listenerVector.y + 
                      aimVector.z * listenerVector.z;
    const aimMagnitude = Math.sqrt(aimVector.x ** 2 + aimVector.y ** 2 + aimVector.z ** 2);
    const listenerMagnitude = Math.sqrt(listenerVector.x ** 2 + listenerVector.y ** 2 + listenerVector.z ** 2);
    
    const angle = Math.acos(dotProduct / (aimMagnitude * listenerMagnitude)) * 180 / Math.PI;
    
    // Apply coverage pattern attenuation
    const horizontalAngle = Math.min(angle, speaker.coverage.horizontal / 2);
    const coverage = speaker.coverage.horizontal / 2;
    
    // Simplified directivity loss calculation
    if (angle > coverage) {
      directivityIndex = -12; // -12 dB outside coverage pattern
    } else {
      // Gradual rolloff within coverage pattern
      directivityIndex = -6 * Math.pow(horizontalAngle / coverage, 2);
    }
  }
  
  // Calculate SPL
  const spl = speaker.sensitivity + 
              10 * Math.log10(power) - 
              20 * Math.log10(effectiveDistance) + 
              directivityIndex;
  
  return spl;
}

/**
 * Calculate coverage grid for a room
 */
export function calculateCoverageGrid(
  roomDimensions: { length: number; width: number; height: number },
  speakers: SpeakerPlacement[],
  gridResolution: number = 1.0, // meters
  listenerHeight: number = 1.2 // seated ear height
): SPLPoint[] {
  const points: SPLPoint[] = [];
  
  // Generate grid points
  for (let x = 0; x <= roomDimensions.width; x += gridResolution) {
    for (let y = 0; y <= roomDimensions.length; y += gridResolution) {
      const point = { x, y, z: listenerHeight };
      let totalPressure = 0;
      
      // Calculate contribution from each speaker (power summation)
      speakers.forEach(({ speaker, position, aimPoint }) => {
        const power = speaker.powerHandling.continuous / 2; // Assume 3dB headroom
        const spl = calculateSPLAtPoint(speaker, power, point, position, aimPoint);
        
        // Convert to pressure and sum
        const pressure = Math.pow(10, spl / 20);
        totalPressure += pressure;
      });
      
      // Convert back to dB
      const totalSPL = 20 * Math.log10(totalPressure);
      const distance = Math.min(
        ...speakers.map(s => 
          Math.sqrt(
            Math.pow(point.x - s.position.x, 2) +
            Math.pow(point.y - s.position.y, 2) +
            Math.pow(point.z - s.position.z, 2)
          )
        )
      );
      
      points.push({
        ...point,
        spl: totalSPL,
        distance
      });
    }
  }
  
  return points;
}

/**
 * Calculate required speaker quantity and power
 */
export function calculateSpeakerRequirements(
  roomDimensions: { length: number; width: number; height: number },
  targetSPL: { average: number; peak: number },
  ambientNoise: number,
  speaker: Speaker,
  mountingHeight: number = 3.0
): SPLCalculationResult {
  // Calculate room area
  const roomArea = roomDimensions.length * roomDimensions.width;
  
  // Estimate speaker spacing for even coverage
  const coverageRadius = mountingHeight * Math.tan((speaker.coverage.horizontal / 2) * Math.PI / 180);
  const coverageArea = Math.PI * coverageRadius * coverageRadius * 0.7; // 70% overlap
  
  // Calculate number of speakers needed
  const speakersRequired = Math.max(1, Math.ceil(roomArea / coverageArea));
  
  // Create optimal speaker layout
  const speakers: SpeakerPlacement[] = [];
  const rows = Math.ceil(Math.sqrt(speakersRequired * roomDimensions.length / roomDimensions.width));
  const cols = Math.ceil(speakersRequired / rows);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (speakers.length < speakersRequired) {
        const x = (col + 0.5) * (roomDimensions.width / cols);
        const y = (row + 0.5) * (roomDimensions.length / rows);
        
        speakers.push({
          speaker,
          position: { x, y, z: mountingHeight },
          aimPoint: { x, y, z: 1.2 }, // Aim at seated ear height
          tiltAngle: 0,
          panAngle: 0
        });
      }
    }
  }
  
  // Calculate coverage
  const coverage = calculateCoverageGrid(roomDimensions, speakers, 1.0);
  
  // Calculate statistics
  const splValues = coverage.map(p => p.spl);
  const averageSPL = splValues.reduce((a, b) => a + b) / splValues.length;
  const minSPL = Math.min(...splValues);
  const maxSPL = Math.max(...splValues);
  const variance = maxSPL - minSPL;
  
  // Calculate required power per speaker
  const signalToNoise = targetSPL.average - ambientNoise;
  const requiredSPL = targetSPL.average + 10; // 10 dB headroom
  const powerRequired = Math.pow(10, (requiredSPL - speaker.sensitivity) / 10);
  
  // Check if requirements are met
  const meetsRequirement = minSPL >= targetSPL.average && 
                          variance <= 6 && // 6 dB max variance
                          signalToNoise >= 15; // 15 dB minimum S/N
  
  return {
    averageSPL,
    minSPL,
    maxSPL,
    variance,
    coverage,
    powerRequired,
    speakersRequired,
    meetsRequirement
  };
}

/**
 * Calculate amplifier requirements based on speakers
 */
export function calculateAmplifierPower(
  speakers: { speaker: Speaker; quantity: number }[],
  headroom: number = 3, // dB
  safetyFactor: number = 1.25
): { totalPower: number; channelsRequired: number; recommendedAmplifierPower: number } {
  let totalPower = 0;
  let channelsRequired = 0;
  
  speakers.forEach(({ speaker, quantity }) => {
    const powerPerSpeaker = speaker.powerHandling.continuous * Math.pow(10, headroom / 10);
    totalPower += powerPerSpeaker * quantity;
    
    // Assume 2 speakers per channel for 70V systems, 1 per channel for low-Z
    if (speaker.transformer === '70V' || speaker.transformer === '100V') {
      channelsRequired += Math.ceil(quantity / 4); // 4 speakers per channel typical
    } else {
      channelsRequired += quantity; // 1 speaker per channel
    }
  });
  
  const recommendedAmplifierPower = totalPower * safetyFactor;
  
  return {
    totalPower,
    channelsRequired,
    recommendedAmplifierPower
  };
}
