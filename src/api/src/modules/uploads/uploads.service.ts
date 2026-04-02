import { AppError } from "../../lib/app-error";
import { uploadImageObject } from "../../lib/bitiful-s4";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function normalizeOriginalName(fileName: string) {
  return Buffer.from(fileName, "latin1").toString("utf8");
}

export async function uploadPublishScreenshot(file: Express.Multer.File) {
  if (!file) {
    throw new AppError("Please select an image to upload", 400);
  }

  if (!file.mimetype.startsWith("image/")) {
    throw new AppError("Only image uploads are supported", 400);
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new AppError("Image size must be 10MB or smaller", 400);
  }

  const originalName = normalizeOriginalName(file.originalname);

  const uploaded = await uploadImageObject({
    fileName: originalName,
    contentType: file.mimetype,
    body: file.buffer,
  });

  return {
    ...uploaded,
    originalName,
    contentType: file.mimetype,
    size: file.size,
  };
}
