import sharp from "sharp";

export async function getBWPercentage(file) {
  const pixels = await getRGBMapping(file);

  let grayCount = 0;
  for (const pixel of pixels) {
    if (isBlackWhiteOrGray(...pixel)) grayCount++;
  }

  return Math.round((grayCount / pixels.length) * 100) / 100;
}

function isBlackWhiteOrGray(r, g, b, tolerance = 10) {
  // Check if the color is close to black (within tolerance)
  if (r <= tolerance && g <= tolerance && b <= tolerance) {
    return true;
  }

  // Check if the color is close to white (within tolerance)
  if (r >= 255 - tolerance && g >= 255 - tolerance && b >= 255 - tolerance) {
    return true;
  }

  // Check if the color is gray within a given tolerance (R = G = B)
  if (
    Math.abs(r - g) < tolerance &&
    Math.abs(g - b) < tolerance &&
    Math.abs(r - b) < tolerance
  ) {
    return true;
  }

  // If it's none of the above, it's not black, white, or gray
  return false;
}

function getRGBMapping(filePath) {
  return new Promise((resolve, reject) => {
    sharp(filePath)
      .raw() // Get the raw pixel data (no color conversion)
      .toBuffer((err, data, info) => {
        if (err) {
          return reject(err); // Reject if an error occurs
        }

        const { width, height } = info; // Get the image dimensions
        const rgbData = [];

        // Iterate through the raw pixel data and map to RGB
        for (let i = 0; i < data.length; i += 3) {
          const r = data[i]; // Red channel
          const g = data[i + 1]; // Green channel
          const b = data[i + 2]; // Blue channel

          rgbData.push([r, g, b]); // Push the RGB values into the array
        }

        resolve(rgbData); // Return the full RGB data
      });
  });
}
