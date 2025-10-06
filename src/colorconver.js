/**
 * Converts a 6-digit hexadecimal color string into its RGB representation.
 *
 * @param {string} hex - The hexadecimal color string to convert.
 * @returns {{r: number, g: number, b: number}} An object containing the red, green, and blue values (0–255).
 * @throws {Error} If the input is not a valid 6-digit hexadecimal color string.
 */
function hextoRgb(hex) {
    if (!/^#?[0-9A-Fa-f]{6}$/.test(hex)) {
        throw new Error("Invalid hex color");
    }
    const cleanHex = hex.replace("#", "");
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
}

/**
 * Converts RGB values into a 6-digit hexadecimal color string.
 *
 * Accepts either three numeric arguments (r, g, b) or a single object { r, g, b }.
 *
 * @param {number|object} rOrObj - Red component 0–255 or an object with r,g,b.
 * @param {number} [g] - Green component 0–255.
 * @param {number} [b] - Blue component 0–255.
 * @returns {string} The hex color string in the form #RRGGBB.
 * @throws {Error} If any component is missing, not a finite number, or outside 0–255.
 */
function rgbToHex(rOrObj, g, b) {
    let rVal, gVal, bVal;

    if (typeof rOrObj === "object" && rOrObj !== null) {
        ({ r: rVal, g: gVal, b: bVal } = rOrObj);
    } else {
        rVal = rOrObj;
        gVal = g;
        bVal = b;
    }

    const isValidComponent = (v) =>
        Number.isFinite(v) && Number.isInteger(v) && v >= 0 && v <= 255;

    if (!isValidComponent(rVal) || !isValidComponent(gVal) || !isValidComponent(bVal)) {
        throw new Error("Invalid RGB components. Each must be an integer between 0 and 255");
    }

    const toTwoHex = (n) => n.toString(16).padStart(2, "0").toUpperCase();

    return `#${toTwoHex(rVal)}${toTwoHex(gVal)}${toTwoHex(bVal)}`;
}

/**
 * A utility module for working with color conversions.
 * @module colorUtils
 * @property {function(string): {r:number,g:number,b:number}} hextoRgb - Converts a hex string into an RGB object.
 * @property {function(number|object,number,number): string} rgbToHex - Converts RGB to a hex string.
 */

module.exports = { hextoRgb, rgbToHex };
