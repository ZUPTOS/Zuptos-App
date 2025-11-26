import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    console.log("[API Route] GET /api/auth/me - Request:", {
      hasToken: !!token,
      tokenLength: token?.length || 0,
    });

    if (!token) {
      console.warn("[API Route] GET /api/auth/me - No token provided");
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 }
      );
    }

    const response = await fetch("http://86.48.22.80:3000/v1/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("[API Route] GET /api/auth/me - Response:", {
      status: response.status,
      hasUser: !!data.username,
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API Route] GET /api/auth/me - Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
