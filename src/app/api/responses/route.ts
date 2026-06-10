import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Usa el enlace personalizado de la invitacion para guardar la respuesta.",
    },
    { status: 410 },
  );
}
