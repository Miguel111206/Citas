import { createClient, type User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export type AuthenticatedAdmin = {
  user: User;
};

type AuthResult =
  | { admin: AuthenticatedAdmin; ok: true }
  | { errorResponse: NextResponse; ok: false };

export async function requireAuthenticatedAdmin(
  request: Request,
): Promise<AuthResult> {
  const token = readBearerToken(request);

  if (!token) {
    return {
      errorResponse: NextResponse.json(
        { error: "Inicia sesion para entrar al panel." },
        { status: 401 },
      ),
      ok: false,
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return {
      errorResponse: NextResponse.json(
        { error: "Faltan variables publicas de Supabase." },
        { status: 500 },
      ),
      ok: false,
    };
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Tu sesion expiro. Vuelve a entrar." },
        { status: 401 },
      ),
      ok: false,
    };
  }

  try {
    await ensureAdminProfile(data.user);
  } catch (error) {
    console.error(error);

    return {
      errorResponse: NextResponse.json(
        { error: "No se pudo preparar el perfil. Revisa el schema." },
        { status: 500 },
      ),
      ok: false,
    };
  }

  return { admin: { user: data.user }, ok: true };
}

async function ensureAdminProfile(user: User) {
  const supabase = createSupabaseAdminClient();
  const displayName =
    normalizeMetadataText(user.user_metadata?.display_name) ||
    normalizeMetadataText(user.user_metadata?.name) ||
    user.email?.split("@")[0] ||
    null;

  await supabase.from("profiles").upsert({
    display_name: displayName,
    email: user.email ?? null,
    id: user.id,
  });
}

function readBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization");
  const match = authHeader?.match(/^Bearer\s+(.+)$/i);

  return match?.[1]?.trim() ?? "";
}

function normalizeMetadataText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}
