import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[API Route] POST /api/auth/sign-in - Request:", {
      email: body.email,
    });

    const response = await fetch(`${API_BASE_URL}/v1/auth/sign_in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("[API Route] POST /api/auth/sign-in - Response:", {
      status: response.status,
      hasToken: !!data.access_token,
    });

    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      }
    });
  } catch (error) {
    console.error("[API Route] POST /api/auth/sign-in - Error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: String(error) },
      { status: 500 }
    );
  }
}
