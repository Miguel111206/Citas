import { InvitationExperience } from "@/components/InvitationExperience";
import {
  createSupabaseAdminClient,
  type InvitationRow,
} from "@/lib/supabaseAdmin";

type InviteLoadResult =
  | { invitation: InvitationRow; status: "ready" }
  | { invitation: InvitationRow; status: "completed" }
  | { status: "not-found" }
  | { status: "load-error" }
  | { status: "config-error" };

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const result = await loadInvitation(code.trim().toLowerCase());

  if (result.status === "load-error") {
    return (
      <InviteStatusScreen
        eyebrow="algo fallo"
        title="No se pudo cargar esta invitacion"
        message="Intenta abrir el enlace otra vez en un momento."
      />
    );
  }

  if (result.status === "not-found") {
    return (
      <InviteStatusScreen
        eyebrow="enlace no encontrado"
        title="Esta invitacion no existe"
        message="Revisa que el enlace personalizado este completo."
      />
    );
  }

  if (result.status === "completed") {
    return (
      <InviteStatusScreen
        eyebrow="todo listo"
        title="This invitation has already been answered 💕"
        message={`${result.invitation.recipient_name}, tu respuesta ya quedo guardada.`}
      />
    );
  }

  if (result.status === "config-error") {
    return (
      <InviteStatusScreen
        eyebrow="configuracion pendiente"
        title="No se pudo conectar con Supabase"
        message="Revisa las variables de entorno y el schema de la base de datos."
      />
    );
  }

  return (
    <InvitationExperience
      inviteCode={result.invitation.code}
      recipientName={result.invitation.recipient_name}
    />
  );
}

async function loadInvitation(code: string): Promise<InviteLoadResult> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: invitation, error } = await supabase
      .from("invitations")
      .select("id,code,recipient_name,owner_id,status,created_at,completed_at")
      .eq("code", code)
      .maybeSingle();

    if (error) {
      return { status: "load-error" };
    }

    if (!invitation) {
      return { status: "not-found" };
    }

    if (invitation.status === "Completed") {
      return { invitation, status: "completed" };
    }

    return { invitation, status: "ready" };
  } catch {
    return { status: "config-error" };
  }
}

function InviteStatusScreen({
  eyebrow,
  message,
  title,
}: {
  eyebrow: string;
  message: string;
  title: string;
}) {
  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#ffe4ec_0%,#fff7ed_42%,#e8f1e5_100%)] px-4 py-8 text-[#512336]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-300 via-amber-200 to-emerald-200" />
      <section className="relative z-10 w-full max-w-lg rounded-[2rem] border border-white/80 bg-white/90 p-7 text-center shadow-[0_28px_80px_rgba(190,24,93,0.18)] backdrop-blur sm:p-9">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-3xl shadow-inner">
          💌
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-rose-400">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-rose-700 sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-[#7a5160]">
          {message}
        </p>
      </section>
    </main>
  );
}
