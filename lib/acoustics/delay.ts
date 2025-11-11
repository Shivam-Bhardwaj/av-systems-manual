/**
 * Audio Delay Calculations for Distributed Systems
 * Calculate delay times for multiple speaker zones to ensure coherent sound
 */

export interface DelayZone {
  name: string;
  position: { x: number; y: number; z: number };
  distanceFromMain: number;
  delayTime: number; // milliseconds
  delayDistance: number; // meters
}

export interface DelayCalculationResult {
  zones: DelayZone[];
  speedOfSound: number;
  temperature: number;
  maxDelay: number;
}

/**
 * Calculate speed of sound based on temperature
 * c = 331.3 + 0.606 * T (where T is in Celsius)
 */
export function calculateSpeedOfSound(temperature: number = 20): number {
  return 331.3 + 0.606 * temperature;
}

/**
 * Calculate delay time needed for a speaker based on distance
 * delay (ms) = distance (m) / speed of sound (m/s) * 1000
 */
export function calculateDelayTime(
  distance: number,
  temperature: number = 20
): number {
  const speedOfSound = calculateSpeedOfSound(temperature);
  return (distance / speedOfSound) * 1000;
}

/**
 * Calculate delay settings for a distributed speaker system
 */
export function calculateSystemDelays(
  mainSpeakerPosition: { x: number; y: number; z: number },
  delaySpeakers: { name: string; position: { x: number; y: number; z: number } }[],
  temperature: number = 20,
  additionalDelay: number = 0 // ms - for precedence effect
): DelayCalculationResult {
  const speedOfSound = calculateSpeedOfSound(temperature);
  const zones: DelayZone[] = [];
  
  // Calculate delay for each zone
  delaySpeakers.forEach(speaker => {
    // Calculate distance from main speakers
    const distance = Math.sqrt(
      Math.pow(speaker.position.x - mainSpeakerPosition.x, 2) +
      Math.pow(speaker.position.y - mainSpeakerPosition.y, 2) +
      Math.pow(speaker.position.z - mainSpeakerPosition.z, 2)
    );
    
    // Calculate basic delay time
    const baseDelay = calculateDelayTime(distance, temperature);
    
    // Add additional delay for Haas effect (precedence)
    // Typically 10-20ms to ensure main speakers are perceived as source
    const totalDelay = baseDelay + additionalDelay;
    
    zones.push({
      name: speaker.name,
      position: speaker.position,
      distanceFromMain: distance,
      delayTime: Math.round(totalDelay * 10) / 10, // Round to 0.1ms
      delayDistance: distance
    });
  });
  
  // Sort by distance
  zones.sort((a, b) => a.distanceFromMain - b.distanceFromMain);
  
  const maxDelay = Math.max(...zones.map(z => z.delayTime));
  
  return {
    zones,
    speedOfSound,
    temperature,
    maxDelay
  };
}

/**
 * Calculate optimal delay speaker positions for a rectangular room
 */
export function calculateOptimalDelayPositions(
  roomDimensions: { length: number; width: number; height: number },
  mainSpeakerPosition: { x: number; y: number; z: number },
  targetCoverage: number = 0.75 // Percentage of room to cover
): { name: string; position: { x: number; y: number; z: number } }[] {
  const positions: { name: string; position: { x: number; y: number; z: number } }[] = [];
  
  // Calculate critical distance (where direct and reverberant sound are equal)
  // Simplified calculation - in practice this depends on RT60
  const criticalDistance = Math.sqrt(roomDimensions.length * roomDimensions.width * roomDimensions.height) * 0.1;
  
  // Determine if delay speakers are needed
  const maxDistanceFromMain = Math.sqrt(
    Math.pow(roomDimensions.length, 2) + 
    Math.pow(roomDimensions.width, 2)
  );
  
  if (maxDistanceFromMain <= criticalDistance * 2) {
    return positions; // No delays needed
  }
  
  // Place delay speakers starting from 2x critical distance
  const startDistance = criticalDistance * 2;
  const speakerSpacing = criticalDistance * 1.5;
  
  // Calculate positions along the room length
  let currentDistance = startDistance;
  let zoneNumber = 1;
  
  while (currentDistance < roomDimensions.length * targetCoverage) {
    // Place speakers across the width
    const numSpeakersWide = Math.max(1, Math.ceil(roomDimensions.width / (speakerSpacing * 2)));
    
    for (let i = 0; i < numSpeakersWide; i++) {
      const x = (i + 0.5) * (roomDimensions.width / numSpeakersWide);
      const y = currentDistance;
      
      positions.push({
        name: `Delay Zone ${zoneNumber}-${i + 1}`,
        position: { x, y, z: roomDimensions.height - 0.5 } // Mount near ceiling
      });
    }
    
    currentDistance += speakerSpacing;
    zoneNumber++;
  }
  
  return positions;
}

/**
 * Calculate delay compensation for video sync
 */
export function calculateAudioVideoSync(
  videoProcessingDelay: number, // ms
  audioProcessingDelay: number, // ms
  distanceToScreen: number, // meters
  temperature: number = 20
): { 
  totalVideoDelay: number;
  totalAudioDelay: number;
  requiredAudioDelay: number;
  inSync: boolean;
} {
  // Calculate acoustic delay from speakers to listener
  const acousticDelay = calculateDelayTime(distanceToScreen, temperature);
  
  // Total delays
  const totalVideoDelay = videoProcessingDelay;
  const totalAudioDelay = audioProcessingDelay + acousticDelay;
  
  // Calculate required additional audio delay for sync
  const requiredAudioDelay = Math.max(0, totalVideoDelay - totalAudioDelay);
  
  // Check if within acceptable sync (±40ms typically)
  const syncDifference = Math.abs(totalVideoDelay - (totalAudioDelay + requiredAudioDelay));
  const inSync = syncDifference <= 40;
  
  return {
    totalVideoDelay,
    totalAudioDelay,
    requiredAudioDelay: Math.round(requiredAudioDelay * 10) / 10,
    inSync
  };
}

/**
 * Calculate delay settings for fill speakers (under-balcony, side-fill, etc.)
 */
export function calculateFillSpeakerDelays(
  mainSpeakers: { position: { x: number; y: number; z: number } }[],
  fillSpeaker: { name: string; position: { x: number; y: number; z: number } },
  listenerPosition: { x: number; y: number; z: number },
  temperature: number = 20
): {
  delayFromMain: number;
  delayFromListener: number;
  recommendedDelay: number;
  notes: string;
} {
  // Find closest main speaker
  let minDistance = Infinity;
  let closestMain = mainSpeakers[0].position;
  
  mainSpeakers.forEach(main => {
    const distance = Math.sqrt(
      Math.pow(fillSpeaker.position.x - main.position.x, 2) +
      Math.pow(fillSpeaker.position.y - main.position.y, 2) +
      Math.pow(fillSpeaker.position.z - main.position.z, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestMain = main.position;
    }
  });
  
  // Calculate delays
  const delayFromMain = calculateDelayTime(minDistance, temperature);
  
  // Calculate distance from fill speaker to listener
  const listenerDistance = Math.sqrt(
    Math.pow(fillSpeaker.position.x - listenerPosition.x, 2) +
    Math.pow(fillSpeaker.position.y - listenerPosition.y, 2) +
    Math.pow(fillSpeaker.position.z - listenerPosition.z, 2)
  );
  
  const delayFromListener = calculateDelayTime(listenerDistance, temperature);
  
  // Recommended delay includes Haas effect consideration
  const recommendedDelay = delayFromMain + 10; // 10ms for precedence
  
  let notes = '';
  if (recommendedDelay > 100) {
    notes = 'Warning: Large delay may cause echo effects';
  } else if (listenerDistance < 3) {
    notes = 'Fill speaker is very close to listener - consider reducing level';
  }
  
  return {
    delayFromMain: Math.round(delayFromMain * 10) / 10,
    delayFromListener: Math.round(delayFromListener * 10) / 10,
    recommendedDelay: Math.round(recommendedDelay * 10) / 10,
    notes
  };
}
