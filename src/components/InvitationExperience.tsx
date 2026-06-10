"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarHeart,
  Check,
  Clock3,
  Heart,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  activities,
  foods,
  timeOptions,
  type Choice,
} from "@/lib/invitationOptions";

type Step = "intro" | "surprise" | "datetime" | "activity" | "food" | "final";

const heartPositions = [
  { left: "10%", delay: 0, duration: 7.5 },
  { left: "22%", delay: 1.2, duration: 8.4 },
  { left: "48%", delay: 0.4, duration: 7.9 },
  { left: "70%", delay: 1.8, duration: 8.8 },
  { left: "86%", delay: 0.7, duration: 7.2 },
];

const cardVariants = {
  initial: { opacity: 0, y: 26, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -18, scale: 0.98 },
};

export function InvitationExperience({
  inviteCode,
  recipientName,
}: {
  inviteCode: string;
  recipientName: string;
}) {
  const [step, setStep] = useState<Step>("intro");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedFood, setSelectedFood] = useState("");
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const activity = useMemo(
    () => activities.find((item) => item.value === selectedActivity),
    [selectedActivity],
  );
  const food = useMemo(
    () => foods.find((item) => item.value === selectedFood),
    [selectedFood],
  );
  const timeLabel =
    timeOptions.find((item) => item.value === selectedTime)?.label ??
    selectedTime;

  const formattedDate = selectedDate
    ? new Intl.DateTimeFormat("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${selectedDate}T00:00:00Z`))
    : "";

  function moveNoButton() {
    setNoOffset({
      x: Math.round(Math.random() * 92 - 46),
      y: Math.round(Math.random() * 44 - 22),
    });
  }

  async function submitDate() {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(
        `/api/invitations/${encodeURIComponent(inviteCode)}/response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activity: selectedActivity,
            date: selectedDate,
            food: selectedFood,
            time: selectedTime,
          }),
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo guardar la cita.");
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Paso algo raro guardando la cita.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#ffe4ec_0%,#fff7ed_42%,#ffe0ea_100%)] px-4 py-5 text-[#512336] sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.82),transparent_34%),linear-gradient(120deg,rgba(255,183,197,0.24),rgba(255,247,237,0.18),rgba(152,178,146,0.13))]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-300 via-amber-200 to-emerald-200" />

      {step === "final" && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {heartPositions.map((heart) => (
            <span
              className="floating-heart absolute bottom-[-3rem] text-2xl opacity-70"
              key={heart.left}
              style={{
                animationDelay: `${heart.delay}s`,
                animationDuration: `${heart.duration}s`,
                left: heart.left,
              }}
            >
              ♥
            </span>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === "intro" && (
          <ScreenCard key="intro" compact={false}>
            <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-rose-100 shadow-[0_18px_35px_rgba(219,39,119,0.18)] sm:h-32 sm:w-32">
              <Image
                src="/puppy-date.png"
                alt="Perrito tierno con un corazon"
                width={256}
                height={256}
                priority
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-3 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-rose-400">
                invitacion oficial
              </p>
              <h1 className="font-serif text-3xl font-bold leading-tight text-rose-700 sm:text-5xl">
                {recipientName}, ¿quieres tener una cita conmigo?
              </h1>
              <p className="mx-auto max-w-sm text-base leading-7 text-[#7a5160]">
                Prometo portarme lindo, escoger buena comida y mirarte como si
                fueras mi plan favorito.
              </p>
            </div>

            <div className="flex min-h-20 w-full items-center justify-center gap-4">
              <button
                className="group inline-flex h-12 min-w-32 items-center justify-center gap-2 rounded-full bg-rose-600 px-6 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_14px_28px_rgba(225,29,72,0.28)] transition hover:-translate-y-0.5 hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200"
                onClick={() => setStep("surprise")}
                type="button"
              >
                <Heart className="h-4 w-4 fill-current" />
                Si
              </button>
              <button
                className="inline-flex h-11 min-w-24 items-center justify-center rounded-full border border-rose-200 bg-white/90 px-5 text-sm font-bold lowercase tracking-[0.12em] text-rose-500 shadow-sm transition duration-200 hover:border-rose-300 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100"
                onClick={moveNoButton}
                onFocus={moveNoButton}
                onMouseEnter={moveNoButton}
                style={{
                  transform: `translate(${noOffset.x}px, ${noOffset.y}px)`,
                }}
                type="button"
              >
                no ❀
              </button>
            </div>
          </ScreenCard>
        )}

        {step === "surprise" && (
          <ScreenCard key="surprise" compact={false}>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-4xl shadow-inner sm:h-24 sm:w-24 sm:text-5xl">
              😭
            </div>
            <div className="space-y-4 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-rose-400">
                momento
              </p>
              <h2 className="font-serif text-3xl font-bold leading-tight text-rose-700 sm:text-5xl">
                ¿ESPERA, DE VERDAD DIJISTE QUE SI?
              </h2>
              <p className="mx-auto max-w-sm text-base leading-7 text-[#7a5160]">
                Yo ya estaba mentalmente preparado para que dijeras que no,
                pero mira nada mas esta felicidad.
              </p>
            </div>
            <PrimaryButton onClick={() => setStep("datetime")}>
              okay okay!
              <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
          </ScreenCard>
        )}

        {step === "datetime" && (
          <ScreenCard key="datetime" compact={false}>
            <HeaderBlock
              eyebrow="primer detalle"
              icon={<CalendarHeart className="h-7 w-7" />}
              title={`${recipientName}, ¿cuando estas libre?`}
              subtitle="Escoge el dia y la hora. Yo me encargo de sonreir demasiado."
            />

            <div className="grid w-full gap-4 text-left">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.15em] text-rose-500">
                  <CalendarHeart className="h-4 w-4" />
                  Escoge un dia
                </span>
                <input
                  className="h-12 w-full rounded-2xl border border-rose-100 bg-white px-4 text-base font-semibold text-[#512336] shadow-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                  onChange={(event) => setSelectedDate(event.target.value)}
                  type="date"
                  value={selectedDate}
                />
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.15em] text-rose-500">
                  <Clock3 className="h-4 w-4" />
                  ¿A que hora?
                </span>
                <select
                  className="h-12 w-full rounded-2xl border border-rose-100 bg-white px-4 text-base font-semibold text-[#512336] shadow-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                  onChange={(event) => setSelectedTime(event.target.value)}
                  value={selectedTime}
                >
                  <option value="">Elige una hora linda</option>
                  {timeOptions.map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <PrimaryButton
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep("activity")}
            >
              fijar la cita
              <Heart className="h-4 w-4 fill-current" />
            </PrimaryButton>
          </ScreenCard>
        )}

        {step === "activity" && (
          <ScreenCard key="activity" compact>
            <HeaderBlock
              eyebrow="plan principal"
              icon={<Sparkles className="h-7 w-7" />}
              title={`¿Que deberiamos hacer, ${recipientName}?`}
              subtitle="Escoge la actividad que mas se sienta como tu y yo."
            />

            <ChoiceGrid
              choices={activities}
              selected={selectedActivity}
              onSelect={setSelectedActivity}
            />

            <PrimaryButton
              disabled={!selectedActivity}
              onClick={() => setStep("food")}
            >
              elegir esta actividad
              <Heart className="h-4 w-4 fill-current" />
            </PrimaryButton>
          </ScreenCard>
        )}

        {step === "food" && (
          <ScreenCard key="food" compact>
            <HeaderBlock
              eyebrow="parte deliciosa"
              icon={<span className="text-3xl">🍽️</span>}
              title={`¿Que se nos antoja, ${recipientName}?`}
              subtitle="Escoge el mood de comida. Aqui no juzgamos antojos."
            />

            <ChoiceGrid
              choices={foods}
              selected={selectedFood}
              onSelect={setSelectedFood}
            />

            <PrimaryButton
              disabled={!selectedFood}
              onClick={() => setStep("final")}
            >
              elegir esta comida
              <Heart className="h-4 w-4 fill-current" />
            </PrimaryButton>
          </ScreenCard>
        )}

        {step === "final" && (
          <ScreenCard key="final" compact={false}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-3xl shadow-inner sm:h-20 sm:w-20 sm:text-4xl">
              💖
            </div>

            <div className="space-y-3 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-rose-400">
                todo listo
              </p>
              <h2 className="font-serif text-3xl font-bold leading-tight text-rose-700 sm:text-5xl">
                Gracias, {recipientName}. Nuestra cita quedo armada
              </h2>
              <p className="mx-auto max-w-md text-base leading-7 text-[#7a5160]">
                Me alegra muchisimo que no dijeras que no. Estate lista a la
                hora que escogiste, que yo llego con sonrisa de estreno.
              </p>
            </div>

            <div className="w-full rounded-[1.5rem] border border-rose-100 bg-rose-50/70 p-4 text-left shadow-inner">
              <SummaryRow label="Fecha" value={formattedDate} icon="📅" />
              <SummaryRow label="Hora" value={timeLabel} icon="🕒" />
              <SummaryRow
                label="Actividad"
                value={`${activity?.label ?? selectedActivity} ${
                  activity?.emoji ?? ""
                }`}
                icon="✨"
              />
              <SummaryRow
                label="Comida"
                value={`${food?.label ?? selectedFood} ${food?.emoji ?? ""}`}
                icon="🍽️"
              />
            </div>

            <p className="mx-auto max-w-sm text-center text-sm leading-6 text-[#8d6571]">
              P.D. La gente normal escribe un mensaje. Yo hice una pagina web
              para ti. Casi nada.
            </p>

            <div className="flex w-full flex-col items-center gap-3">
              <PrimaryButton
                disabled={isSubmitting || submitted}
                onClick={submitDate}
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : submitted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Heart className="h-4 w-4 fill-current" />
                )}
                {submitted ? "cita confirmada" : "confirmar cita"}
              </PrimaryButton>

              {submitError && (
                <p className="rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-red-600 shadow-sm">
                  {submitError}
                </p>
              )}
              {submitted && (
                <p className="rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-emerald-700 shadow-sm">
                  Guardado con mucho cariño.
                </p>
              )}
            </div>
          </ScreenCard>
        )}
      </AnimatePresence>
    </main>
  );
}

function ScreenCard({
  children,
  compact,
}: {
  children: React.ReactNode;
  compact: boolean;
}) {
  return (
    <motion.section
      animate="animate"
      className={`relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-[34rem] flex-col items-center overflow-y-auto rounded-[2rem] border border-white/80 bg-white/90 text-center shadow-[0_28px_80px_rgba(190,24,93,0.20)] backdrop-blur ${
        compact ? "gap-3 p-4 sm:gap-4 sm:p-7" : "gap-4 p-5 sm:gap-6 sm:p-9"
      }`}
      exit="exit"
      initial="initial"
      transition={{ duration: 0.34, ease: "easeOut" }}
      variants={cardVariants}
    >
      {children}
    </motion.section>
  );
}

function HeaderBlock({
  eyebrow,
  icon,
  subtitle,
  title,
}: {
  eyebrow: string;
  icon: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="space-y-3 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-inner sm:h-14 sm:w-14">
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-rose-400">
        {eyebrow}
      </p>
      <h2 className="font-serif text-2xl font-bold leading-tight text-rose-700 sm:text-4xl">
        {title}
      </h2>
      <p className="mx-auto max-w-sm text-xs leading-5 text-[#7a5160] sm:text-base sm:leading-6">
        {subtitle}
      </p>
    </div>
  );
}

function ChoiceGrid({
  choices,
  onSelect,
  selected,
}: {
  choices: Choice[];
  onSelect: (value: string) => void;
  selected: string;
}) {
  return (
    <div className="grid w-full grid-cols-2 gap-2.5 sm:gap-3">
      {choices.map((choice) => {
        const isSelected = selected === choice.value;

        return (
          <button
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border bg-white px-3 py-2 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-rose-100 sm:min-h-20 sm:py-3 ${
              isSelected
                ? "border-rose-400 bg-rose-50 shadow-[0_12px_26px_rgba(244,63,94,0.16)]"
                : "border-rose-100"
            }`}
            key={choice.value}
            onClick={() => onSelect(choice.value)}
            type="button"
          >
            <span className="text-xl leading-none sm:text-2xl">
              {choice.emoji}
            </span>
            <span className="text-xs font-extrabold text-[#512336] sm:text-sm">
              {choice.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="inline-flex h-11 min-w-48 items-center justify-center gap-2 rounded-full bg-rose-600 px-5 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_28px_rgba(225,29,72,0.28)] transition hover:-translate-y-0.5 hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200 disabled:cursor-not-allowed disabled:bg-rose-200 disabled:text-rose-500 disabled:shadow-none disabled:hover:translate-y-0 sm:h-12 sm:min-w-52 sm:px-6 sm:text-sm"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rose-100 py-1.5 last:border-b-0 sm:py-2">
      <span className="flex min-w-24 items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-rose-500">
        <span>{icon}</span>
        {label}
      </span>
      <span className="text-right text-sm font-extrabold text-[#512336] sm:text-base">
        {value}
      </span>
    </div>
  );
}
