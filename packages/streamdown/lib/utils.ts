import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const save = (
  filename: string,
  content: string | Blob,
  mimeType: string
) => {
  const blob =
    typeof content === "string"
      ? new Blob([content], { type: mimeType })
      : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Converts an SVG element to a lossless PNG image blob with high quality
 * @param svgElement - The SVG element to convert
 * @param scale - Scale factor for higher resolution output (default: 2 for retina)
 * @returns A Promise that resolves to a PNG Blob
 */
export const svgToPNG = async (
  svgElement: SVGElement,
  scale = 2
): Promise<Blob> => {
  // Clone the SVG to avoid modifying the original
  const svgClone = svgElement.cloneNode(true) as SVGElement;

  // Get dimensions from SVG
  const bbox = svgElement.getBoundingClientRect();
  const viewBox = svgElement.getAttribute("viewBox");

  let width = bbox.width || svgElement.clientWidth;
  let height = bbox.height || svgElement.clientHeight;

  // If dimensions are still 0, try to get from viewBox
  if ((!width || !height) && viewBox) {
    const viewBoxValues = viewBox.split(/\s+|,/).map(Number);
    if (viewBoxValues.length === 4) {
      width = viewBoxValues[2];
      height = viewBoxValues[3];
    }
  }

  // Fallback to reasonable defaults if still no dimensions
  if (!width) width = 800;
  if (!height) height = 600;

  svgClone.setAttribute("width", `${width}`);
  svgClone.setAttribute("height", `${height}`);

  if (!svgClone.getAttribute("viewBox")) {
    svgClone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  // Ensure the SVG has the proper xmlns attribute
  if (!svgClone.hasAttribute("xmlns")) {
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  // Serialize the SVG to string
  const svgData = new XMLSerializer().serializeToString(svgClone);

  // Create a data URL instead of blob URL for better compatibility
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    svgData
  )}`;

  // Load SVG into an image element
  const img = new Image();
  img.src = svgDataUrl;

  // Wait for the image to load
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = (error) => {
      reject(new Error(`Failed to load SVG image: ${error}`));
    };
  });

  // Create a canvas with scaled dimensions
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Draw with scaling
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0, width, height);

  // Convert canvas to PNG blob (lossless)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to create blob"));
      }
    }, "image/png");
  });
};
