"use client";

import {
  Check,
  Copy,
  Eye,
  ExternalLink,
  HeartHandshake,
  LoaderCircle,
  LockKeyhole,
  Plus,
  RefreshCcw,
  UserRound,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { activities, foods } from "@/lib/invitationOptions";

type InvitationStatus = "Pending" | "Completed";

type InvitationResponse = {
  selectedActivity: string;
  selectedDate: string;
  selectedFood: string;
  selectedTime: string;
  submittedAt: string;
};

type InvitationRow = {
  answeredAt: string | null;
  code: string;
  completedAt: string | null;
  createdAt: string;
  id: number;
  inviteUrl: string;
  recipientName: string;
  response: InvitationResponse | null;
  status: InvitationStatus;
};

const activityLabels = Object.fromEntries(
  activities.map((item) => [item.value, item.label]),
) as Record<string, string>;

const foodLabels = Object.fromEntries(
  foods.map((item) => [item.value, item.label]),
) as Record<string, string>;

const legacyFoodLabels: Record<string, string> = {
  Ramen: "Perros calientes",
  Tacos: "Mexicano",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [latestInvitation, setLatestInvitation] =
    useState<InvitationRow | null>(null);
  const [selectedResponseInvitation, setSelectedResponseInvitation] =
    useState<InvitationRow | null>(null);
  const [copiedCode, setCopiedCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const completedCount = useMemo(
    () => invitations.filter((item) => item.status === "Completed").length,
    [invitations],
  );

  async function loadInvitations(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/invitations", {
        headers: {
          "x-admin-password": password,
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo entrar al panel.");
      }

      setInvitations(payload.invitations ?? []);
      setIsAuthenticated(true);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar las invitaciones.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function createInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ recipientName }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo crear la invitacion.");
      }

      setRecipientName("");
      setLatestInvitation(payload.invitation);
      setInvitations((current) => [payload.invitation, ...current]);
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "No se pudo crear la invitacion.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function copyInviteLink(invitation: InvitationRow) {
    try {
      await navigator.clipboard.writeText(invitation.inviteUrl);
      setCopiedCode(invitation.code);
      window.setTimeout(() => setCopiedCode(""), 1600);
    } catch {
      setError("No se pudo copiar el enlace.");
    }
  }

  return (
    <main className="min-h-dvh bg-[linear-gradient(135deg,#ffe4ec_0%,#fff7ed_45%,#e8f1e5_100%)] px-4 py-8 text-[#512336] sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-rose-400">
              panel privado
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-rose-700 sm:text-4xl">
              Invitaciones personalizadas
            </h1>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-rose-600 shadow-inner">
            <HeartHandshake className="h-7 w-7" />
          </div>
        </header>

        {!isAuthenticated ? (
          <section className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_28px_80px_rgba(190,24,93,0.18)] backdrop-blur sm:p-8">
            <form className="grid gap-4" onSubmit={loadInvitations}>
              <label className="grid gap-2">
                <span className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.15em] text-rose-500">
                  <LockKeyhole className="h-4 w-4" />
                  Clave de administrador
                </span>
                <input
                  className="h-12 rounded-2xl border border-rose-100 bg-white px-4 text-base font-semibold shadow-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Escribe la clave"
                  type="password"
                  value={password}
                />
              </label>

              <button
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-rose-600 px-6 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_28px_rgba(225,29,72,0.28)] transition hover:-translate-y-0.5 hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200 disabled:cursor-not-allowed disabled:bg-rose-200 disabled:text-rose-500 disabled:shadow-none sm:w-fit"
                disabled={!password || isLoading}
                type="submit"
              >
                {isLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <LockKeyhole className="h-4 w-4" />
                )}
                entrar
              </button>
            </form>
          </section>
        ) : (
          <>
            <section className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_28px_80px_rgba(190,24,93,0.16)] backdrop-blur sm:p-8">
              <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-end">
                <form className="grid gap-4" onSubmit={createInvitation}>
                  <label className="grid gap-2">
                    <span className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.15em] text-rose-500">
                      <UserRound className="h-4 w-4" />
                      Nombre de la invitada
                    </span>
                    <input
                      className="h-12 rounded-2xl border border-rose-100 bg-white px-4 text-base font-semibold shadow-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                      maxLength={80}
                      onChange={(event) => setRecipientName(event.target.value)}
                      placeholder="Sofia"
                      type="text"
                      value={recipientName}
                    />
                  </label>

                  <button
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-rose-600 px-6 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_28px_rgba(225,29,72,0.28)] transition hover:-translate-y-0.5 hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200 disabled:cursor-not-allowed disabled:bg-rose-200 disabled:text-rose-500 disabled:shadow-none sm:w-fit"
                    disabled={!recipientName.trim() || isCreating}
                    type="submit"
                  >
                    {isCreating ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    crear invitacion
                  </button>
                </form>

                {latestInvitation && (
                  <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 p-4 shadow-inner">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                      enlace creado
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-extrabold text-[#31503a]">
                        {latestInvitation.inviteUrl}
                      </p>
                      <IconButton
                        label="Copiar enlace"
                        onClick={() => void copyInviteLink(latestInvitation)}
                      >
                        {copiedCode === latestInvitation.code ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </IconButton>
                      <a
                        aria-label="Abrir enlace"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        href={latestInvitation.inviteUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_28px_80px_rgba(190,24,93,0.16)] backdrop-blur sm:p-8">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-[#7a5160]">
                  {invitations.length} invitaciones · {completedCount} completas
                </p>
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100"
                  disabled={isLoading}
                  onClick={() => void loadInvitations()}
                  type="button"
                >
                  {isLoading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                  actualizar
                </button>
              </div>

              <div className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead className="bg-rose-50 text-xs uppercase tracking-[0.16em] text-rose-500">
                      <tr>
                        <th className="px-5 py-4 font-black">Nombre</th>
                        <th className="px-5 py-4 font-black">Codigo</th>
                        <th className="px-5 py-4 font-black">Estado</th>
                        <th className="px-5 py-4 font-black">Enlace</th>
                        <th className="px-5 py-4 font-black">Respuesta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitations.map((item) => (
                        <tr
                          className="border-t border-rose-100 text-sm font-semibold text-[#512336]"
                          key={item.id}
                        >
                          <td className="px-5 py-4">{item.recipientName}</td>
                          <td className="px-5 py-4 font-mono text-xs font-black">
                            {item.code}
                          </td>
                          <td className="px-5 py-4">
                            <StatusPill status={item.status} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <IconButton
                                label="Copiar enlace"
                                onClick={() => void copyInviteLink(item)}
                              >
                                {copiedCode === item.code ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </IconButton>
                              <a
                                aria-label="Abrir enlace"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-100 bg-white text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100"
                                href={item.inviteUrl}
                                rel="noreferrer"
                                target="_blank"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {item.response ? (
                              <button
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-rose-100 bg-white px-4 text-xs font-black uppercase tracking-[0.12em] text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100"
                                onClick={() =>
                                  setSelectedResponseInvitation(item)
                                }
                                type="button"
                              >
                                <Eye className="h-4 w-4" />
                                ver respuesta
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {invitations.length === 0 && (
                  <div className="px-5 py-10 text-center text-sm font-semibold text-[#7a5160]">
                    Todavia no hay invitaciones creadas.
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {error && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm">
            {error}
          </p>
        )}
      </div>

      {selectedResponseInvitation?.response && (
        <ResponseDialog
          invitation={selectedResponseInvitation}
          onClose={() => setSelectedResponseInvitation(null)}
        />
      )}
    </main>
  );
}

function ResponseDialog({
  invitation,
  onClose,
}: {
  invitation: InvitationRow;
  onClose: () => void;
}) {
  const response = invitation.response;

  if (!response) {
    return null;
  }

  return (
    <div
      aria-labelledby="response-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#512336]/35 px-4 py-6 backdrop-blur-sm"
      role="dialog"
    >
      <section className="w-full max-w-lg rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_28px_80px_rgba(81,35,54,0.28)] sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-400">
              respuesta guardada
            </p>
            <h2
              className="mt-2 font-serif text-3xl font-bold text-rose-700"
              id="response-dialog-title"
            >
              {invitation.recipientName}
            </h2>
          </div>
          <button
            aria-label="Cerrar respuesta"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-100 bg-white text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-3xl border border-rose-100 bg-rose-50/70 p-4 shadow-inner">
          <DetailRow
            label="Respondio"
            value={formatSubmittedAt(response.submittedAt)}
          />
          <DetailRow label="Fecha" value={formatDate(response.selectedDate)} />
          <DetailRow label="Hora" value={formatTime(response.selectedTime)} />
          <DetailRow
            label="Actividad"
            value={
              activityLabels[response.selectedActivity] ??
              response.selectedActivity
            }
          />
          <DetailRow
            label="Comida"
            value={
              foodLabels[response.selectedFood] ??
              legacyFoodLabels[response.selectedFood] ??
              response.selectedFood
            }
          />
        </div>
      </section>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rose-100 py-3 last:border-b-0">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-rose-500">
        {label}
      </span>
      <span className="text-right text-sm font-extrabold text-[#512336]">
        {value}
      </span>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-100 bg-white text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100"
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: InvitationStatus }) {
  const isCompleted = status === "Completed";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${
        isCompleted
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date(Date.UTC(2026, 0, 1, hours, minutes));

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
