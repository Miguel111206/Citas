import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import {
  normalizeText,
  validateResponsePayload,
  type ResponsePayload,
} from "@/lib/responseValidation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const inviteCode = normalizeText(code).toLowerCase();

  let payload: ResponsePayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es JSON valido." },
      { status: 400 },
    );
  }

  const validation = validateResponsePayload(payload);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .rpc("complete_invitation", {
        p_activity: validation.data.activity,
        p_date: validation.data.date,
        p_food: validation.data.food,
        p_invite_code: inviteCode,
        p_time: validation.data.time,
      })
      .single();

    if (error) {
      return mapSupabaseCompletionError(error.message, error.code);
    }

    return NextResponse.json(
      {
        response: {
          inviteCode: data.invite_code,
          recipientName: data.recipient_name,
          selectedActivity: data.activity,
          selectedDate: data.date,
          selectedFood: data.food,
          selectedTime: data.time.slice(0, 5),
          submittedAt: data.submitted_at,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Faltan variables de entorno de Supabase." },
      { status: 500 },
    );
  }
}

function mapSupabaseCompletionError(message: string, code?: string) {
  if (message.includes("INVITATION_NOT_FOUND") || code === "P0002") {
    return NextResponse.json(
      { error: "Esta invitacion no existe." },
      { status: 404 },
    );
  }

  if (
    message.includes("INVITATION_ALREADY_COMPLETED") ||
    code === "P0001" ||
    code === "23505"
  ) {
    return NextResponse.json(
      { error: "This invitation has already been answered 💕" },
      { status: 409 },
    );
  }

  return NextResponse.json(
    { error: "No se pudo guardar la respuesta." },
    { status: 500 },
  );
}
