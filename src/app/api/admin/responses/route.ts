import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { requireAuthenticatedAdmin } from "@/lib/supabaseAuth";

export async function GET(request: Request) {
  const authResult = await requireAuthenticatedAdmin(request);

  if (!authResult.ok) {
    return authResult.errorResponse;
  }

  try {
    const ownerId = authResult.admin.user.id;
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("responses")
      .select("id,date,time,activity,food,submitted_at")
      .eq("owner_id", ownerId)
      .order("submitted_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "No se pudieron cargar las respuestas." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { responses: data ?? [] },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo conectar con Supabase. Revisa variables y schema." },
      { status: 500 },
    );
  }
}
