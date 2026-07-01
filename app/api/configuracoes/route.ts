import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "ai-config.json");

export async function GET() {
  let aiProvider = process.env.AI_PROVIDER || "gemini";
  
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      if (config.aiProvider) aiProvider = config.aiProvider;
    } catch (e) {}
  }

  return NextResponse.json({
    aiProvider,
    nodeEnv: process.env.NODE_ENV,
  });
}

export async function POST(req: Request) {
  try {
    const { provider } = await req.json();
    
    // Salva a configuração no JSON local
    fs.writeFileSync(configPath, JSON.stringify({ aiProvider: provider }, null, 2));

    return NextResponse.json({ success: true, aiProvider: provider });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao salvar configuração" }, { status: 500 });
  }
}
