# Renovación Suscripción - WhatsApp Automático

Sistema automatizado que detecta alumnos con suscripción vencida en Teachable, les envía un mensaje de WhatsApp ofreciéndoles renovar, y los remueve automáticamente de la comunidad de WhatsApp (solo para Oposiciones Justicia).

## Cómo funciona

1. **Obtiene los alumnos matriculados** de cada curso desde la API de Teachable
2. **Calcula quién venció** — si la fecha de matrícula + 12 meses ya pasó, el alumno está vencido
3. **Verifica que no se le haya escrito antes** — consulta una tabla en Supabase (anti-spam)
4. **Busca su teléfono en Calendly** — si el alumno agendó alguna cita, extrae el teléfono del formulario o del campo `text_reminder_number`
5. **Envía notificación al grupo admin** — WhatsApp al equipo interno con los datos del alumno
6. **Envía mensaje al alumno** (si tiene teléfono) — WhatsApp personalizado ofreciendo opciones de renovación
7. **Remueve al alumno de la comunidad de WhatsApp** (solo Oposiciones Justicia, si tiene teléfono) — vía microservicio Baileys en VPS
8. **Registra al alumno como contactado** — para no volver a escribirle

## Protecciones

| Control | Descripción |
|---------|-------------|
| **Anti-spam** | Un alumno nunca recibe dos mensajes para el mismo curso (registro en Supabase con `UNIQUE(email, course_id)`) |
| **MAX_MESSAGES_PER_RUN** | Máximo de mensajes por ejecución (default: 5) |
| **DRY_RUN** | Modo simulación que no envía nada real |
| **CRON_SECRET** | Clave requerida para ejecutar el endpoint |
| **Fecha mínima** | Solo procesa alumnos matriculados desde marzo 2025 |

## Arquitectura

```
api/
  health.js                  → Health check
  cron/check-renewals.js     → Endpoint principal (cron diario)
  test/enrollments.js        → Test: ver vencimientos
  test/calendly.js           → Test: buscar teléfono por email
  test/whatsapp.js           → Test: enviar mensaje de prueba
lib/
  supabase.js                → Anti-spam (leer/guardar contactados)
  teachable.js               → Enrollments + filtro vencidos
  calendly.js                → Buscar teléfono por email
  ultramsg.js                → Enviar WhatsApp via UltraMsg
  baileys.js                 → Remover participante de grupo/comunidad WhatsApp via Baileys
  messages.js                → Cursos y plantillas de mensajes
setup/
  migration.sql              → SQL para crear la tabla en Supabase
  test-connections.js        → Test local de las 4 APIs
  test-enrollments.js        → Test local de vencimientos
  test-cron.js               → Simulación local del cron completo
```

## APIs y servicios utilizados

- **Teachable** — Enrollments y datos de usuarios
- **Calendly** — Búsqueda de teléfono por email
- **UltraMsg** — Envío de WhatsApp
- **Supabase** — Base de datos anti-spam
- **Baileys** (microservicio en VPS) — Gestión de participantes en comunidades/grupos de WhatsApp

## Despliegue

- **Vercel** (serverless) — Lógica principal y cron
- **VPS Hostinger** (`46.202.168.50:3050`) — Microservicio Baileys con PM2 para gestión de grupos WhatsApp
- Cron diario configurado en **cron-job.org** (10:00 AM)
- Deploy automático con cada push a `main`

## Variables de entorno

Ver `.env.example` para la lista completa. Se configuran en Vercel > Settings > Environment Variables.
