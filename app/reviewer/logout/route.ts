import { NextRequest, NextResponse } from "next/server";
import { REVIEWER_COOKIE_NAME } from "@/lib/reviewer-access";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set({
    name: REVIEWER_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
