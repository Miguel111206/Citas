import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  type InvitationRow,
  type ResponseRow,
} from "@/lib/supabaseAdmin";

const codeAlphabet = "abcdefghijkmnopqrstuvwxyz23456789";
const codeLength = 8;
const maxCodeAttempts = 6;

type CreateInvitationPayload = {
  recipientName?: unknown;
};

export async function GET(request: Request) {
  const authError = getAdminAuthError(request);

  if (authError) {
    return authError;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const [invitationsResult, responsesResult] = await Promise.all([
      supabase
        .from("invitations")
        .select("id,code,recipient_name,status,created_at,completed_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("responses")
        .select(
          "id,invite_id,invite_code,recipient_name,date,time,activity,food,submitted_at",
        )
        .order("submitted_at", { ascending: false }),
    ]);

    if (invitationsResult.error || responsesResult.error) {
      return NextResponse.json(
        { error: "No se pudieron cargar las invitaciones." },
        { status: 500 },
      );
    }

    const responseByCode = new Map<string, ResponseRow>();

    for (const response of responsesResult.data ?? []) {
      if (response.invite_code && !responseByCode.has(response.invite_code)) {
        responseByCode.set(response.invite_code, response);
      }
    }

    return NextResponse.json(
      {
        invitations: (invitationsResult.data ?? []).map((invitation) =>
          serializeInvitation(request, invitation, responseByCode),
        ),
      },
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

export async function POST(request: Request) {
  const authError = getAdminAuthError(request);

  if (authError) {
    return authError;
  }

  let payload: CreateInvitationPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es JSON valido." },
      { status: 400 },
    );
  }

  const recipientName =
    typeof payload.recipientName === "string"
      ? payload.recipientName.trim()
      : "";

  if (recipientName.length < 1 || recipientName.length > 80) {
    return NextResponse.json(
      { error: "Escribe un nombre entre 1 y 80 caracteres." },
      { status: 400 },
    );
  }

  try {
    const supabase = createSupabaseAdminClient();

    for (let attempt = 0; attempt < maxCodeAttempts; attempt += 1) {
      const code = generateInviteCode();
      const { data, error } = await supabase
        .from("invitations")
        .insert({
          code,
          recipient_name: recipientName,
          status: "Pending",
        })
        .select("id,code,recipient_name,status,created_at,completed_at")
        .single();

      if (!error && data) {
        return NextResponse.json(
          {
            invitation: {
              ...serializeInvitation(request, data, new Map()),
              inviteUrl: buildInviteUrl(request, data.code),
            },
          },
          { status: 201 },
        );
      }

      if (error?.code !== "23505") {
        return NextResponse.json(
          { error: "No se pudo crear la invitacion." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { error: "No se pudo generar un codigo unico. Intenta otra vez." },
      { status: 500 },
    );
  } catch {
    return NextResponse.json(
      { error: "Faltan variables de entorno de Supabase." },
      { status: 500 },
    );
  }
}

function getAdminAuthError(request: Request) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = request.headers.get("x-admin-password");

  if (!configuredPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD no esta configurada." },
      { status: 500 },
    );
  }

  if (!providedPassword || providedPassword !== configuredPassword) {
    return NextResponse.json({ error: "Clave incorrecta." }, { status: 401 });
  }

  return null;
}

function serializeInvitation(
  request: Request,
  invitation: InvitationRow,
  responseByCode: Map<string, ResponseRow>,
) {
  const response = responseByCode.get(invitation.code) ?? null;

  return {
    answeredAt: response?.submitted_at ?? invitation.completed_at,
    code: invitation.code,
    completedAt: invitation.completed_at,
    createdAt: invitation.created_at,
    id: invitation.id,
    inviteUrl: buildInviteUrl(request, invitation.code),
    recipientName: invitation.recipient_name,
    response: response
      ? {
          selectedActivity: response.activity,
          selectedDate: response.date,
          selectedFood: response.food,
          selectedTime: response.time,
          submittedAt: response.submitted_at,
        }
      : null,
    status: invitation.status,
  };
}

function buildInviteUrl(request: Request, code: string) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const baseUrl = configuredSiteUrl || request.url;

  return new URL(`/invite/${code}`, baseUrl).toString();
}

function generateInviteCode() {
  const bytes = randomBytes(codeLength);
  let code = "";

  for (const byte of bytes) {
    code += codeAlphabet[byte % codeAlphabet.length];
  }

  return code;
}
