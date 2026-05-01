/**
 * Helper utilities for colors
 */

/**
 * Calculates the appropriate text color class (dark or light) 
 * based on the background hex color's luminance.
 * 
 * @param {string} hexcolor - The background color in hex format (e.g., #FFFFFF or #000)
 * @returns {string} Tailwind CSS text color class ('text-neutral-900' or 'text-white')
 */
export const getContrastTextColorClass = (hexcolor) => {
  if (!hexcolor || typeof hexcolor !== 'string') return 'text-white';
  
  if (hexcolor.slice(0, 1) === '#') {
    hexcolor = hexcolor.slice(1);
  }

  if (hexcolor.length === 3) {
    hexcolor = hexcolor.split('').map(function (hex) {
      return hex + hex;
    }).join('');
  }

  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return 'text-white';
  }

  // YIQ ratio calculation
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  // Threshold is usually 128
  return (yiq >= 128) ? 'text-neutral-900' : 'text-white';
};
