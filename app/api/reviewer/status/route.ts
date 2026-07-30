import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isValidReviewerToken,
  REVIEWER_COOKIE_NAME,
} from "@/lib/reviewer-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const reviewerCookie = cookieStore.get(REVIEWER_COOKIE_NAME);

  const reviewerAccess = isValidReviewerToken(reviewerCookie?.value);

  return NextResponse.json(
    { reviewerAccess },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
