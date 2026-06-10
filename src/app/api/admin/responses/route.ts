import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = request.headers.get("x-admin-password");

  if (!configuredPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD no está configurada." },
      { status: 500 },
    );
  }

  if (!providedPassword || providedPassword !== configuredPassword) {
    return NextResponse.json(
      { error: "Clave incorrecta." },
      { status: 401 },
    );
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("responses")
      .select("id,date,time,activity,food,submitted_at")
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
  } catch {
    return NextResponse.json(
      { error: "Faltan variables de entorno de Supabase." },
      { status: 500 },
    );
  }
}
