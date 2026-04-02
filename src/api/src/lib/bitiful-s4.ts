import { randomUUID } from "crypto";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "../config/env";

import { AppError } from "./app-error";

const requiredKeys = [
  "BITIFUL_S4_ENDPOINT",
  "BITIFUL_S4_REGION",
  "BITIFUL_S4_BUCKET",
  "BITIFUL_S4_ACCESS_KEY",
  "BITIFUL_S4_SECRET_KEY",
] as const;

function assertStorageConfig() {
  const missing = requiredKeys.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new AppError(
      `Bitiful S4 is not configured: missing ${missing.join(", ")}`,
      500,
    );
  }
}

function sanitizeFileName(fileName: string) {
  return fileName
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "-")
    .replace(/_+/g, "_")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .trim();
}

function getFileExtension(fileName: string) {
  const sanitized = sanitizeFileName(fileName);
  const dotIndex = sanitized.lastIndexOf(".");

  if (dotIndex <= 0 || dotIndex === sanitized.length - 1) {
    return "";
  }

  return sanitized.slice(dotIndex).toLowerCase();
}

export function buildObjectKey(fileName: string, now = new Date()) {
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const uniquePrefix = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const extension = getFileExtension(fileName);

  return `${env.BITIFUL_S4_DEFAULT_PROJECT}/${year}/${month}/${day}/${uniquePrefix}${extension}`;
}

function createClient() {
  assertStorageConfig();

  return new S3Client({
    region: env.BITIFUL_S4_REGION,
    endpoint: env.BITIFUL_S4_ENDPOINT,
    credentials: {
      accessKeyId: env.BITIFUL_S4_ACCESS_KEY!,
      secretAccessKey: env.BITIFUL_S4_SECRET_KEY!,
    },
  });
}

export type UploadedObject = {
  bucket: string;
  objectKey: string;
  url: string | null;
};

export async function uploadImageObject(params: {
  fileName: string;
  contentType: string;
  body: Buffer;
}) {
  const client = createClient();
  const objectKey = buildObjectKey(params.fileName);

  await client.send(
    new PutObjectCommand({
      Bucket: env.BITIFUL_S4_BUCKET,
      Key: objectKey,
      Body: params.body,
      ContentType: params.contentType,
      ContentDisposition: "inline",
    }),
  );

  const url = env.BITIFUL_S4_PUBLIC_BASE_URL
    ? `${env.BITIFUL_S4_PUBLIC_BASE_URL.replace(/\/$/, "")}/${objectKey}`
    : null;

  return {
    bucket: env.BITIFUL_S4_BUCKET!,
    objectKey,
    url,
  } satisfies UploadedObject;
}
