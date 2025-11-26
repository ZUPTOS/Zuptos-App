import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API Route] POST /api/auth/sign-up - Request:", {
      username: body.username,
      email: body.email,
      accessType: body.accessType,
    });

    const res = await fetch("http://86.48.22.80:3000/v1/auth/sign_up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("[API Route] POST /api/auth/sign-up - Response:", {
      status: res.status,
      hasToken: !!data.access_token,
    });
    
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("[API Route] POST /api/auth/sign-up - Error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

