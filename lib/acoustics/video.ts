/**
 * Video Display Calculations
 * Calculate display size, viewing angles, and pixel density requirements
 */

export interface ViewingAngleResult {
  horizontalAngle: number; // degrees
  verticalAngle: number; // degrees
  distance: number; // meters
  acceptable: boolean;
}

export interface DisplaySizeResult {
  screenWidth: number; // meters
  screenHeight: number; // meters
  diagonalInches: number; // inches
  aspectRatio: string; // e.g., "16:9"
  viewingRule: '4x' | '6x' | '8x';
}

export interface PixelDensityResult {
  pixelsPerInch: number;
  pixelsPerMeter: number;
  viewingDistance: number; // meters
  minimumPixelPitch: number; // mm (for LED walls)
  readable: boolean;
}

/**
 * Calculate viewing angles from viewer position to display center
 */
export function calculateViewingAngles(
  viewerPosition: { x: number; y: number; z: number },
  displayPosition: { x: number; y: number; z: number },
  displaySize: { width: number; height: number } // meters
): ViewingAngleResult {
  // Calculate distance
  const dx = displayPosition.x - viewerPosition.x;
  const dy = displayPosition.y - viewerPosition.y;
  const dz = displayPosition.z - viewerPosition.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Calculate horizontal angle (from viewer's perspective)
  const horizontalDistance = Math.sqrt(dx * dx + dy * dy);
  const horizontalAngle = Math.atan2(dx, dy) * 180 / Math.PI;

  // Calculate vertical angle
  const verticalAngle = Math.atan2(dz, horizontalDistance) * 180 / Math.PI;

  // Check if angles are acceptable
  // Ideal: ±30° horizontal, 0-15° vertical
  // Maximum: ±45° horizontal, 0-30° vertical
  const acceptable = Math.abs(horizontalAngle) <= 45 && verticalAngle >= 0 && verticalAngle <= 30;

  return {
    horizontalAngle: Math.abs(horizontalAngle),
    verticalAngle,
    distance,
    acceptable
  };
}

/**
 * Calculate required display size based on viewing distance
 */
export function calculateDisplaySize(
  furthestViewerDistance: number, // meters
  viewingRule: '4x' | '6x' | '8x' = '6x',
  aspectRatio: '16:9' | '16:10' | '4:3' = '16:9'
): DisplaySizeResult {
  // Calculate minimum display height based on viewing rule
  const multiplier = viewingRule === '4x' ? 4 : viewingRule === '6x' ? 6 : 8;
  const minHeight = furthestViewerDistance / multiplier;

  // Calculate width based on aspect ratio
  let width: number;
  if (aspectRatio === '16:9') {
    width = minHeight * 16 / 9;
  } else if (aspectRatio === '16:10') {
    width = minHeight * 16 / 10;
  } else {
    width = minHeight * 4 / 3;
  }

  // Calculate diagonal in inches
  const diagonalMeters = Math.sqrt(width * width + minHeight * minHeight);
  const diagonalInches = diagonalMeters * 39.3701; // meters to inches

  return {
    screenWidth: width,
    screenHeight: minHeight,
    diagonalInches: Math.round(diagonalInches),
    aspectRatio,
    viewingRule
  };
}

/**
 * Calculate pixel density requirements
 */
export function calculatePixelDensity(
  displayResolution: { width: number; height: number }, // pixels
  displaySize: { width: number; height: number }, // meters
  viewingDistance: number // meters
): PixelDensityResult {
  // Calculate pixels per inch
  const diagonalPixels = Math.sqrt(displayResolution.width ** 2 + displayResolution.height ** 2);
  const diagonalInches = Math.sqrt(displaySize.width ** 2 + displaySize.height ** 2) * 39.3701;
  const pixelsPerInch = diagonalPixels / diagonalInches;

  // Calculate pixels per meter
  const pixelsPerMeter = pixelsPerInch / 39.3701;

  // Calculate minimum pixel pitch for LED walls (based on viewing distance)
  // Human eye can resolve ~1 arcminute = 0.0003 radians
  // At distance D, minimum resolvable size = D * 0.0003
  // For comfortable viewing, use 2-3x this value
  const arcminuteRadians = 0.0003;
  const minimumPixelPitch = viewingDistance * arcminuteRadians * 2.5 * 1000; // convert to mm

  // Check if text is readable (typically need 50+ PPI for comfortable reading)
  const readable = pixelsPerInch >= 50;

  return {
    pixelsPerInch,
    pixelsPerMeter,
    viewingDistance,
    minimumPixelPitch,
    readable
  };
}

/**
 * Calculate brightness requirements based on ambient light
 */
export function calculateBrightnessRequirements(
  ambientLight: number, // lux
  contrastRatio: number = 10 // desired contrast ratio
): {
  requiredBrightness: number; // nits/cd/m²
  footLamberts: number;
  recommendedDisplayBrightness: number; // nits
} {
  // Convert lux to nits (approximate: 1 lux ≈ 0.0929 foot-candles, 1 foot-lambert ≈ 3.426 nits)
  const ambientNits = ambientLight * 0.0929 * 3.426;

  // Required brightness = ambient * contrast ratio
  const requiredBrightness = ambientNits * contrastRatio;

  // Convert to foot-lamberts
  const footLamberts = requiredBrightness / 3.426;

  // Recommended display brightness (add 20% headroom)
  const recommendedDisplayBrightness = requiredBrightness * 1.2;

  return {
    requiredBrightness,
    footLamberts,
    recommendedDisplayBrightness: Math.round(recommendedDisplayBrightness)
  };
}

/**
 * Calculate viewing distance for a given display size
 */
export function calculateOptimalViewingDistance(
  displaySize: { width: number; height: number }, // meters
  viewingRule: '4x' | '6x' | '8x' = '6x'
): {
  minDistance: number; // meters
  maxDistance: number; // meters
  optimalDistance: number; // meters
} {
  const height = displaySize.height;
  const multiplier = viewingRule === '4x' ? 4 : viewingRule === '6x' ? 6 : 8;
  
  const optimalDistance = height * multiplier;
  const minDistance = height * 4; // 4x rule minimum
  const maxDistance = height * 8; // 8x rule maximum

  return {
    minDistance,
    maxDistance,
    optimalDistance
  };
}

