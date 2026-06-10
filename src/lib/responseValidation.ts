import {
  allowedActivities,
  allowedFoods,
  allowedTimes,
} from "@/lib/invitationOptions";

export type ResponsePayload = {
  activity?: unknown;
  date?: unknown;
  food?: unknown;
  time?: unknown;
};

export type ValidatedResponse = {
  activity: string;
  date: string;
  food: string;
  time: string;
};

export type ResponseValidationResult =
  | { data: ValidatedResponse; ok: true }
  | { error: string; ok: false };

export function validateResponsePayload(
  payload: ResponsePayload,
): ResponseValidationResult {
  const date = normalizeText(payload.date);
  const time = normalizeText(payload.time);
  const activity = normalizeText(payload.activity);
  const food = normalizeText(payload.food);

  if (!isValidDate(date)) {
    return { error: "Selecciona una fecha valida.", ok: false };
  }

  if (!allowedTimes.has(time)) {
    return { error: "Selecciona una hora valida.", ok: false };
  }

  if (!allowedActivities.has(activity)) {
    return { error: "Selecciona una actividad valida.", ok: false };
  }

  if (!allowedFoods.has(food)) {
    return { error: "Selecciona una comida valida.", ok: false };
  }

  return {
    data: {
      activity,
      date,
      food,
      time,
    },
    ok: true,
  };
}

export function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10)
  );
}
