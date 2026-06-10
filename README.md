# Invitación a cita

App web interactiva hecha con Next.js, Tailwind CSS, Framer Motion y Supabase.
Incluye invitaciones personalizadas por enlace unico, flujo romantico por
pantallas, guardado de respuestas y panel privado en `/admin`.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Variables de entorno

Crea `.env.local` usando `.env.example` como guía:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=choose-a-private-password
NEXT_PUBLIC_SITE_URL=https://mi-cita.vercel.app
```

`SUPABASE_SERVICE_ROLE_KEY` y `ADMIN_PASSWORD` solo se usan en rutas server.
`NEXT_PUBLIC_SITE_URL` es opcional, pero ayuda a generar enlaces finales de
produccion desde el panel.

## Supabase

1. Crea un proyecto en Supabase.
2. Abre SQL Editor.
3. Ejecuta el contenido de `supabase/schema.sql`.
4. Copia `Project URL`, `anon key` y `service_role key` a las variables de
   entorno.

El schema crea:

- `public.invitations`: nombre, codigo unico, estado y fecha de completado.
- `public.responses`: respuesta asociada a una invitacion.
- `public.complete_invitation`: funcion transaccional que guarda la respuesta y
  marca la invitacion como `Completed`.

## Netlify

Conecta el repositorio en Netlify y configura:

- Build command: `npm run build`
- Publish directory: `.next`
- Variables de entorno: las mismas de `.env.example`

Netlify soporta Next.js App Router y route handlers con su adapter automático,
así que no se fija manualmente `@netlify/plugin-nextjs`.

## Rutas

- `/`: entrada neutral hacia el panel y enlaces personalizados.
- `/invite/[code]`: invitacion personalizada.
- `/admin`: panel privado con clave simple.
- `/api/admin/invitations`: crea y lista invitaciones.
- `/api/invitations/[code]/response`: guarda una respuesta unica.
