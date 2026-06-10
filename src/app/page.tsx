import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake, LockKeyhole } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#ffe4ec_0%,#fff7ed_45%,#e8f1e5_100%)] px-4 py-8 text-[#512336] sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.82),transparent_34%),linear-gradient(120deg,rgba(255,183,197,0.2),rgba(255,247,237,0.18),rgba(152,178,146,0.12))]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-300 via-amber-200 to-emerald-200" />

      <section className="relative z-10 grid w-full max-w-4xl gap-8 rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_28px_80px_rgba(190,24,93,0.18)] backdrop-blur sm:grid-cols-[0.9fr_1.1fr] sm:items-center sm:p-8">
        <div className="mx-auto h-44 w-44 overflow-hidden rounded-full border-4 border-white bg-rose-100 shadow-[0_18px_35px_rgba(219,39,119,0.18)] sm:h-64 sm:w-64">
          <Image
            src="/puppy-date.png"
            alt="Perrito tierno con un corazon"
            width={320}
            height={320}
            priority
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-5 text-center sm:text-left">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-rose-400">
              invitaciones privadas
            </p>
            <h1 className="font-serif text-3xl font-bold leading-tight text-rose-700 sm:text-5xl">
              Cada cita empieza con su enlace personalizado
            </h1>
            <p className="text-base leading-7 text-[#7a5160]">
              Crea una invitacion individual, comparte solo ese link y revisa
              desde el panel quien respondio.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-rose-600 px-6 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_28px_rgba(225,29,72,0.28)] transition hover:-translate-y-0.5 hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200"
              href="/admin"
            >
              <LockKeyhole className="h-4 w-4" />
              panel admin
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-rose-100 bg-white px-5 text-sm font-extrabold text-rose-600 shadow-sm">
              <HeartHandshake className="h-4 w-4" />
              /invite/codigo
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
