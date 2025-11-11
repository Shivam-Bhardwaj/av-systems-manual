/**
 * Cable Loss Calculations for Speaker Systems
 * Calculate voltage drop, power loss, and cable requirements
 */

export interface CableSpec {
  gauge: number; // AWG
  resistancePerMeter: number; // ohms per meter
  maxCurrent: number; // amps
}

// Common cable specifications (AWG to resistance)
export const CABLE_SPECS: Record<number, CableSpec> = {
  12: { gauge: 12, resistancePerMeter: 0.0053, maxCurrent: 20 },
  14: { gauge: 14, resistancePerMeter: 0.0085, maxCurrent: 15 },
  16: { gauge: 16, resistancePerMeter: 0.0135, maxCurrent: 10 },
  18: { gauge: 18, resistancePerMeter: 0.0214, maxCurrent: 7 },
  20: { gauge: 20, resistancePerMeter: 0.0339, maxCurrent: 5 },
  22: { gauge: 22, resistancePerMeter: 0.0538, maxCurrent: 3 },
};

export interface CableLossResult {
  totalResistance: number; // ohms
  voltageDrop: number; // volts
  voltageDropPercent: number; // percentage
  powerLoss: number; // watts
  powerLossPercent: number; // percentage
  voltageAtSpeaker: number; // volts
  powerAtSpeaker: number; // watts
  recommendedGauge: number; // AWG
  acceptable: boolean;
}

/**
 * Calculate cable loss for low-impedance speaker system
 */
export function calculateLowImpedanceLoss(
  cableLength: number, // meters (one-way)
  speakerImpedance: number, // ohms (typically 4, 8, or 16)
  amplifierPower: number, // watts
  amplifierVoltage: number = Math.sqrt(amplifierPower * speakerImpedance), // volts RMS
  cableGauge: number = 14 // AWG
): CableLossResult {
  const cableSpec = CABLE_SPECS[cableGauge];
  if (!cableSpec) {
    throw new Error(`Unsupported cable gauge: ${cableGauge} AWG`);
  }

  // Total resistance (out and back = 2x length)
  const totalResistance = cableSpec.resistancePerMeter * cableLength * 2;

  // Calculate current
  const current = amplifierVoltage / (speakerImpedance + totalResistance);

  // Voltage drop
  const voltageDrop = current * totalResistance;
  const voltageDropPercent = (voltageDrop / amplifierVoltage) * 100;

  // Voltage at speaker
  const voltageAtSpeaker = amplifierVoltage - voltageDrop;

  // Power calculations
  const powerAtSpeaker = (voltageAtSpeaker ** 2) / speakerImpedance;
  const powerLoss = amplifierPower - powerAtSpeaker;
  const powerLossPercent = (powerLoss / amplifierPower) * 100;

  // Check if acceptable (typically < 5% loss)
  const acceptable = powerLossPercent < 5;

  // Recommend larger gauge if loss is too high
  let recommendedGauge = cableGauge;
  if (powerLossPercent > 5) {
    const gauges = Object.keys(CABLE_SPECS).map(Number).sort((a, b) => a - b);
    for (const gauge of gauges) {
      if (gauge < cableGauge) {
        const testSpec = CABLE_SPECS[gauge];
        const testResistance = testSpec.resistancePerMeter * cableLength * 2;
        const testCurrent = amplifierVoltage / (speakerImpedance + testResistance);
        const testVoltageDrop = testCurrent * testResistance;
        const testVoltageAtSpeaker = amplifierVoltage - testVoltageDrop;
        const testPowerAtSpeaker = (testVoltageAtSpeaker ** 2) / speakerImpedance;
        const testPowerLoss = amplifierPower - testPowerAtSpeaker;
        const testPowerLossPercent = (testPowerLoss / amplifierPower) * 100;
        
        if (testPowerLossPercent < 5) {
          recommendedGauge = gauge;
          break;
        }
      }
    }
  }

  return {
    totalResistance,
    voltageDrop,
    voltageDropPercent,
    powerLoss,
    powerLossPercent,
    voltageAtSpeaker,
    powerAtSpeaker,
    recommendedGauge,
    acceptable
  };
}

/**
 * Calculate cable loss for 70V/100V distributed system
 */
export function calculateDistributedSystemLoss(
  cableLength: number, // meters (one-way)
  systemVoltage: 70 | 100, // volts
  totalPower: number, // watts (sum of all tap settings)
  cableGauge: number = 14 // AWG
): CableLossResult {
  const cableSpec = CABLE_SPECS[cableGauge];
  if (!cableSpec) {
    throw new Error(`Unsupported cable gauge: ${cableGauge} AWG`);
  }

  // Total resistance (out and back = 2x length)
  const totalResistance = cableSpec.resistancePerMeter * cableLength * 2;

  // Current in distributed system
  const current = totalPower / systemVoltage;

  // Voltage drop
  const voltageDrop = current * totalResistance;
  const voltageDropPercent = (voltageDrop / systemVoltage) * 100;

  // Voltage at end of run
  const voltageAtSpeaker = systemVoltage - voltageDrop;

  // Power calculations
  const powerAtSpeaker = (voltageAtSpeaker ** 2) / (systemVoltage ** 2 / totalPower);
  const powerLoss = totalPower - powerAtSpeaker;
  const powerLossPercent = (powerLoss / totalPower) * 100;

  // Check if acceptable (typically < 3% for distributed systems)
  const acceptable = voltageDropPercent < 3;

  // Recommend larger gauge if loss is too high
  let recommendedGauge = cableGauge;
  if (voltageDropPercent > 3) {
    const gauges = Object.keys(CABLE_SPECS).map(Number).sort((a, b) => a - b);
    for (const gauge of gauges) {
      if (gauge < cableGauge) {
        const testSpec = CABLE_SPECS[gauge];
        const testResistance = testSpec.resistancePerMeter * cableLength * 2;
        const testCurrent = totalPower / systemVoltage;
        const testVoltageDrop = testCurrent * testResistance;
        const testVoltageDropPercent = (testVoltageDrop / systemVoltage) * 100;
        
        if (testVoltageDropPercent < 3) {
          recommendedGauge = gauge;
          break;
        }
      }
    }
  }

  return {
    totalResistance,
    voltageDrop,
    voltageDropPercent,
    powerLoss,
    powerLossPercent,
    voltageAtSpeaker,
    powerAtSpeaker,
    recommendedGauge,
    acceptable
  };
}

/**
 * Calculate maximum cable length for acceptable loss
 */
export function calculateMaxCableLength(
  speakerImpedance: number, // ohms
  amplifierPower: number, // watts
  maxLossPercent: number = 5, // percentage
  cableGauge: number = 14 // AWG
): number {
  const cableSpec = CABLE_SPECS[cableGauge];
  if (!cableSpec) {
    throw new Error(`Unsupported cable gauge: ${cableGauge} AWG`);
  }

  const amplifierVoltage = Math.sqrt(amplifierPower * speakerImpedance);
  
  // Iteratively find max length
  let maxLength = 0;
  for (let length = 0.1; length <= 500; length += 0.1) {
    const result = calculateLowImpedanceLoss(length, speakerImpedance, amplifierPower, amplifierVoltage, cableGauge);
    if (result.powerLossPercent <= maxLossPercent) {
      maxLength = length;
    } else {
      break;
    }
  }

  return maxLength;
}

