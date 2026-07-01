import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

/**
 * POST /api/compartilhar
 * Cria um link de compartilhamento com PIN para uma missão.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { projetoId, diasExpiracao = 7, titulo, criadoPor } = await req.json();

    if (!projetoId) {
      return NextResponse.json({ erro: "ID da missão é obrigatório." }, { status: 400 });
    }

    // Verificar se a missão existe
    const { data: projeto, error: erroProjeto } = await supabase
      .from("projetos")
      .select("id, codigo")
      .eq("id", projetoId)
      .single();

    if (erroProjeto || !projeto) {
      return NextResponse.json({ erro: "Missão não encontrada." }, { status: 404 });
    }

    // Gerar token único (16 bytes hex = 32 chars)
    const token = randomBytes(16).toString("hex");

    // Gerar PIN de 6 dígitos
    const pin = String(Math.floor(100000 + Math.random() * 900000));

    // Calcular expiração
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + diasExpiracao);

    // Salvar no banco
    const { data: compartilhamento, error } = await supabase
      .from("compartilhamentos")
      .insert({
        projeto_id: projetoId,
        token,
        pin,
        titulo: titulo || `Missão ${projeto.codigo}`,
        criado_por: criadoPor || "Plataforma Praxis",
        expira_em: expiraEm.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const link = `${baseUrl}/compartilhar/${token}`;

    return NextResponse.json({
      link,
      token,
      pin,
      expiraEm: expiraEm.toISOString(),
      missao: projeto.codigo,
    });
  } catch (error) {
    console.error("[compartilhar] Erro:", error);
    return NextResponse.json(
      { erro: "Erro ao criar compartilhamento." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/compartilhar?token=xxx
 * Desativa um compartilhamento.
 */
export async function DELETE(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ erro: "Token obrigatório." }, { status: 400 });
  }

  const { error } = await supabase
    .from("compartilhamentos")
    .update({ ativo: false })
    .eq("token", token);

  if (error) {
    return NextResponse.json({ erro: "Erro ao revogar acesso." }, { status: 500 });
  }

  return NextResponse.json({ sucesso: true });
}
