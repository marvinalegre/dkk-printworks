import { exec } from "node:child_process";

export function pdfToImage(file, baseName) {
  return new Promise((resolve, reject) => {
    exec(
      // 10 DPI
      `pdftoppm -r 10 -jpeg ${file} files/${baseName}`,
      (err, stdout, stderr) => {
        if (err) {
          reject(err);
          return;
        }
        if (stderr) {
          reject(err);
          return;
        } else {
          resolve(stdout);
        }
      }
    );
  });
}

// Function to get the number of pages in a PDF
export async function getPdfPageCount(pdfPath) {
  try {
    // Run the pdfinfo command and wrap it in a Promise
    const pageCount = await new Promise((resolve, reject) => {
      exec(`pdfinfo "${pdfPath}"`, (error, stdout, stderr) => {
        if (error) {
          reject(`Error executing pdfinfo: ${error.message}`);
          return;
        }
        if (stderr) {
          reject(`Error: ${stderr}`);
          return;
        }

        // Extract the number of pages from the output
        const pageCountMatch = stdout.match(/Pages:\s*(\d+)/);
        if (pageCountMatch) {
          resolve(parseInt(pageCountMatch[1], 10)); // Resolve with the page count
        } else {
          reject("Could not extract page count from pdfinfo output");
        }
      });
    });

    return pageCount;
  } catch (error) {
    console.error("Error:", error);
    return null; // Return null if there's an error
  }
}

export function getPdfPageSize(filename) {
  return new Promise((resolve, reject) => {
    // Run the pdfinfo command to get PDF metadata
    exec(`pdfinfo "${filename}"`, (error, stdout, stderr) => {
      if (error || stderr) {
        reject(`Error executing pdfinfo: ${error || stderr}`);
        return;
      }

      // Extract page size from the output
      const pageSizeMatch = stdout.match(
        /Page size:\s*(\d+(\.\d+)?)\s*x\s*(\d+(\.\d+)?)/
      );
      if (pageSizeMatch) {
        const width = parseFloat(pageSizeMatch[1]); // Capture width (supports integer and decimal)
        const height = parseFloat(pageSizeMatch[3]); // Capture height (supports int
        resolve([width, height]);
      } else {
        reject("Could not extract page size from PDF.");
      }
    });
  });
}
