// Device capability detection — disable heavy animations on old/low-end phones
import { Platform, PixelRatio, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const screenPixels = width * height * PixelRatio.get();

// Heuristic: low-end if screen pixel count is small or pixel ratio is low
// Pixel ratio 1-1.5 = old/budget phone, 2+ = mid-range, 3+ = flagship
const pixelRatio = PixelRatio.get();
const isLowEnd = pixelRatio < 2 || screenPixels < 500000;

/**
 * Whether to enable animations (flag wave, sparkles, pulsing dots, etc.)
 * Disabled on old/low-end phones for performance.
 * Always enabled on web (runs on desktop/laptop).
 */
export const ANIMATIONS_ENABLED = Platform.OS === 'web' ? true : !isLowEnd;

/**
 * Whether device supports native driver animations well
 */
export const NATIVE_DRIVER_OK = Platform.OS !== 'web';
