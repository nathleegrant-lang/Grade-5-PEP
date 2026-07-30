import { createHash, timingSafeEqual } from "node:crypto";

export const REVIEWER_COOKIE_NAME = "pep_reviewer_access";

const COOKIE_DURATION_SECONDS = 60 * 60 * 8; // 8 hours

export const REVIEWER_COOKIE_MAX_AGE = COOKIE_DURATION_SECONDS;

function getPreviewKey(): string {
  const previewKey = process.env.PREVIEW_ACCESS_KEY;

  if (!previewKey) {
    throw new Error(
      "PREVIEW_ACCESS_KEY is missing from the server environment variables."
    );
  }

  return previewKey;
}

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createReviewerToken(): string {
  return hashValue(getPreviewKey());
}

export function isCorrectPreviewKey(submittedKey: string | null): boolean {
  if (!submittedKey) {
    return false;
  }

  const expectedHash = Buffer.from(hashValue(getPreviewKey()), "utf8");
  const submittedHash = Buffer.from(hashValue(submittedKey), "utf8");

  return timingSafeEqual(expectedHash, submittedHash);
}

export function isValidReviewerToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const expectedToken = Buffer.from(createReviewerToken(), "utf8");
  const receivedToken = Buffer.from(token, "utf8");

  if (expectedToken.length !== receivedToken.length) {
    return false;
  }

  return timingSafeEqual(expectedToken, receivedToken);
}
