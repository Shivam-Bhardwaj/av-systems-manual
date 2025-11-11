/**
 * STI (Speech Transmission Index) Calculations
 * Predict speech intelligibility based on room acoustics and system design
 */

export interface STIResult {
  value: number; // 0-1 scale
  rating: 'bad' | 'poor' | 'fair' | 'good' | 'excellent';
  octaveBands: {
    125: number;
    250: number;
    500: number;
    1000: number;
    2000: number;
    4000: number;
    8000: number;
  };
  modificationFactors: {
    noise: number;
    reverberation: number;
    level: number;
    nonlinearity: number;
  };
}

export interface STIParameters {
  rt60Values: {
    125: number;
    250: number;
    500: number;
    1000: number;
    2000: number;
    4000: number;
    8000?: number;
  };
  backgroundNoise: {
    125: number;
    250: number;
    500: number;
    1000: number;
    2000: number;
    4000: number;
    8000?: number;
  };
  signalLevel: {
    125: number;
    250: number;
    500: number;
    1000: number;
    2000: number;
    4000: number;
    8000?: number;
  };
  distance: number; // meters from source
}

/**
 * Male speech spectrum levels (IEC 60268-16)
 */
const MALE_SPEECH_SPECTRUM = {
  125: 56.0,
  250: 66.0,
  500: 71.0,
  1000: 68.5,
  2000: 64.5,
  4000: 59.5,
  8000: 54.5
};

/**
 * Octave band importance weights for STI
 */
const OCTAVE_WEIGHTS = {
  125: 0.085,
  250: 0.127,
  500: 0.230,
  1000: 0.233,
  2000: 0.192,
  4000: 0.133,
  8000: 0.000 // Not used in standard STI
};

/**
 * Modulation frequencies for STI calculation
 */
const MODULATION_FREQUENCIES = [0.63, 0.80, 1.00, 1.25, 1.60, 2.00, 2.50, 3.15, 4.00, 5.00, 6.30, 8.00, 10.00, 12.50];

/**
 * Calculate modulation transfer function
 */
function calculateMTF(
  rt60: number,
  signalToNoise: number,
  modulationFreq: number
): number {
  // Calculate modulation reduction due to reverberation
  const reverbReduction = 1 / Math.sqrt(1 + Math.pow(2 * Math.PI * modulationFreq * rt60 / 13.8, 2));
  
  // Calculate modulation reduction due to noise
  const snRatio = Math.pow(10, signalToNoise / 10);
  const noiseReduction = snRatio / (1 + snRatio);
  
  // Combined MTF
  return reverbReduction * noiseReduction;
}

/**
 * Calculate apparent SNR from modulation reduction
 */
function modToSNR(modulation: number): number {
  if (modulation <= 0) return -15;
  if (modulation >= 1) return 15;
  
  return 10 * Math.log10(modulation / (1 - modulation));
}

/**
 * Get STI rating from value
 */
function getSTIRating(sti: number): 'bad' | 'poor' | 'fair' | 'good' | 'excellent' {
  if (sti < 0.30) return 'bad';
  if (sti < 0.45) return 'poor';
  if (sti < 0.60) return 'fair';
  if (sti < 0.75) return 'good';
  return 'excellent';
}

/**
 * Calculate STI (Speech Transmission Index)
 */
export function calculateSTI(parameters: STIParameters): STIResult {
  const octaveBands = [125, 250, 500, 1000, 2000, 4000] as const;
  const octaveSTI: Record<number, number> = {};
  const modFactors = {
    noise: 0,
    reverberation: 0,
    level: 0,
    nonlinearity: 0
  };
  
  // Calculate STI for each octave band
  octaveBands.forEach(freq => {
    let bandSNRSum = 0;
    let mtfSum = 0;
    
    // Calculate for each modulation frequency
    MODULATION_FREQUENCIES.forEach(modFreq => {
      // Calculate signal-to-noise ratio
      const snr = parameters.signalLevel[freq] - parameters.backgroundNoise[freq];
      
      // Calculate MTF
      const mtf = calculateMTF(parameters.rt60Values[freq], snr, modFreq);
      mtfSum += mtf;
      
      // Convert to apparent SNR
      const apparentSNR = modToSNR(mtf);
      
      // Limit to ±15 dB range
      const limitedSNR = Math.max(-15, Math.min(15, apparentSNR));
      
      bandSNRSum += limitedSNR;
    });
    
    // Average SNR for this octave band
    const avgSNR = bandSNRSum / MODULATION_FREQUENCIES.length;
    
    // Convert to STI scale (0-1)
    octaveSTI[freq] = (avgSNR + 15) / 30;
    
    // Track modification factors
    modFactors.noise += (1 - mtfSum / MODULATION_FREQUENCIES.length) * OCTAVE_WEIGHTS[freq];
    modFactors.reverberation += (1 - mtfSum / MODULATION_FREQUENCIES.length) * OCTAVE_WEIGHTS[freq];
  });
  
  // Calculate weighted average STI
  let weightedSum = 0;
  let weightSum = 0;
  
  octaveBands.forEach(freq => {
    weightedSum += octaveSTI[freq] * OCTAVE_WEIGHTS[freq];
    weightSum += OCTAVE_WEIGHTS[freq];
  });
  
  const stiValue = weightedSum / weightSum;
  
  // Add 8kHz band (0 contribution to STI)
  octaveSTI[8000] = 0;
  
  return {
    value: Math.round(stiValue * 100) / 100,
    rating: getSTIRating(stiValue),
    octaveBands: octaveSTI as any,
    modificationFactors: {
      noise: Math.round(modFactors.noise * 100) / 100,
      reverberation: Math.round(modFactors.reverberation * 100) / 100,
      level: Math.round(modFactors.level * 100) / 100,
      nonlinearity: 0 // Not calculated in this simplified model
    }
  };
}

/**
 * Calculate required acoustic conditions for target STI
 */
export function calculateRequiredConditions(
  targetSTI: number,
  currentRT60: number,
  currentNoise: number
): {
  maxRT60: number;
  minSNR: number;
  recommendations: string[];
} {
  // Simplified calculation for required conditions
  let maxRT60 = 0;
  let minSNR = 0;
  const recommendations: string[] = [];
  
  // Estimate maximum RT60 for target STI
  if (targetSTI >= 0.75) {
    maxRT60 = 0.5;
    minSNR = 25;
    recommendations.push('Excellent intelligibility requires very controlled acoustics');
  } else if (targetSTI >= 0.60) {
    maxRT60 = 0.8;
    minSNR = 20;
    recommendations.push('Good intelligibility is achievable with moderate acoustic treatment');
  } else if (targetSTI >= 0.45) {
    maxRT60 = 1.2;
    minSNR = 15;
    recommendations.push('Fair intelligibility - suitable for most applications');
  } else {
    maxRT60 = 2.0;
    minSNR = 10;
    recommendations.push('Poor intelligibility - significant improvements needed');
  }
  
  // Specific recommendations based on current conditions
  if (currentRT60 > maxRT60) {
    const reduction = ((currentRT60 - maxRT60) / currentRT60 * 100).toFixed(0);
    recommendations.push(`Reduce reverberation time by ${reduction}% (add acoustic treatment)`);
  }
  
  if (currentNoise > 50) {
    recommendations.push('Reduce background noise levels (improve HVAC, add isolation)');
  }
  
  if (minSNR > 20) {
    recommendations.push('Increase direct sound levels (add speakers, reduce distance)');
  }
  
  return {
    maxRT60,
    minSNR,
    recommendations
  };
}

/**
 * Quick STI estimation from RT60 and SNR
 */
export function estimateSTI(rt60: number, snr: number): number {
  // Simplified estimation formula
  // Based on empirical relationship between RT60, SNR and STI
  
  // RT60 contribution (0-0.5 scale)
  const rt60Factor = Math.max(0, 0.5 - (rt60 - 0.5) * 0.3);
  
  // SNR contribution (0-0.5 scale)
  const snrFactor = Math.max(0, Math.min(0.5, snr / 50));
  
  // Combined STI estimate
  const sti = rt60Factor + snrFactor;
  
  return Math.max(0, Math.min(1, sti));
}
