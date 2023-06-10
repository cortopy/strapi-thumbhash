import { loadImage, createCanvas } from "canvas";
import { Strapi } from "@strapi/strapi";
import sharp from "sharp";

async function fetchImage(file: FileData) {
  /**
   * Node canvas does not support webp
   * we need to convert it first
   */
  if (file.mime === "image/webp") {
    const downloadedFile = await fetch(file.url).then((r) => r.arrayBuffer());
    const data = await sharp(downloadedFile).jpeg().toBuffer();
    return loadImage(data);
  }

  return loadImage(file.url);
}

const hash = ({ strapi }: { strapi: Strapi }) => ({
  async generateThumbHash(file: FileData) {
    try {
      // ThumbHash JS implementation is for the browser, in ES6 module
      // a dynamic import is required
      const ThumbHash = await import("thumbhash");
      let image = await fetchImage(file);
      const scale = 100 / Math.max(image.width, image.height);
      const canvas = createCanvas(
        Math.round(image.width * scale),
        Math.round(image.height * scale)
      );
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const binaryThumbHash = ThumbHash.rgbaToThumbHash(
        pixels.width,
        pixels.height,
        pixels.data
      );

      return Array.from(binaryThumbHash);
    } catch (e) {
      console.error("Unable to create ThumbHash for file: ", file);
      strapi.log.error(e);
      return null;
    }
  },
});

export default hash;
