import { NextResponse } from "next/server";

export async function GET() {
  const odmUrl = process.env.NEXT_PUBLIC_ODM_API_URL || "http://localhost:3001";
  
  try {
    const res = await fetch(`${odmUrl}/api/info`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return NextResponse.json({ status: "online" });
    }
    return NextResponse.json({ status: "offline" }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ status: "offline" }, { status: 502 });
  }
}
