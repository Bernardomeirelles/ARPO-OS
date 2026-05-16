import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(2, "Título obrigatório"),
  description: z.string().default(""),
  due_date: z.string().min(1, "Data obrigatória"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["todo", "doing", "done"]).default("todo"),
  lead_id: z.string().uuid().nullable().default(null)
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
      return NextResponse.json({ error: "Organização não encontrada." }, { status: 400 });
    }

    const body = await request.json();
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Dados inválidos" }, { status: 422 });
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        ...parsed.data,
        organization_id: profile.organization_id,
        assigned_to: user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 });
  }
}
