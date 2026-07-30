import { NextRequest, NextResponse } from "next/server";
import {
  createReviewerToken,
  isCorrectPreviewKey,
  REVIEWER_COOKIE_MAX_AGE,
  REVIEWER_COOKIE_NAME,
} from "@/lib/reviewer-access";

export async function GET(request: NextRequest) {
  const previewKey = request.nextUrl.searchParams.get("preview");

  if (!isCorrectPreviewKey(previewKey)) {
    return NextResponse.redirect(
      new URL("/?reviewerError=invalid", request.url)
    );
  }

  const response = NextResponse.redirect(
    new URL("/mock-tests/literacy/mixed-9", request.url)
  );

  response.cookies.set({
    name: REVIEWER_COOKIE_NAME,
    value: createReviewerToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REVIEWER_COOKIE_MAX_AGE,
  });

  return response;
}
