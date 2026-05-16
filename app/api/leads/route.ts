import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  company: z.string().min(1, "Empresa obrigatória"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().default(""),
  position: z.string().default(""),
  source: z.enum(["Indicação", "Inbound", "Outbound", "Evento", "LinkedIn", "Site"]).default("Inbound"),
  status: z.enum(["novo", "contato", "qualificacao", "proposta", "negociacao", "fechado", "perdido"]).default("novo"),
  pipeline_stage: z.string().default("Novo"),
  value: z.number().default(0),
  notes: z.string().default(""),
  tags: z.array(z.string()).default([])
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: "Organização não encontrada. Complete seu perfil primeiro." }, { status: 400 });
    }

    const body = await request.json();
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Dados inválidos" }, { status: 422 });
    }

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        ...parsed.data,
        organization_id: profile.organization_id,
        owner_id: user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 });
  }
}
