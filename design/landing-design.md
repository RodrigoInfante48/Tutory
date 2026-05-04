# Tutory — Landing Page Design Specification

## Product Overview

**Tutory** is a SaaS platform that connects English language students with their personal teachers.
Teachers manage their students' full learning journey: scheduling classes, assigning tasks,
creating quizzes, sharing resources, and tracking real-time progress — all from one dashboard.
Students get a focused, guided experience tailored to their level.

**Target audience:** Spanish-speaking adults (18–45) who want to learn English but have failed
with generic apps or forgotten courses. They value human connection and personalized guidance.

**Business model:** Freemium. Basic access is free. Premium unlocks advanced features (coming soon).

---

## Brand Identity

### Logo
- Wordmark: "Tutory" in bold, rounded sans-serif
- Color: Brand Green `#22c55e`
- Optional: small graduation cap or open book icon to the left

### Color Palette

| Token        | Hex       | Usage                                      |
|--------------|-----------|--------------------------------------------|
| Green 500    | `#22c55e` | Primary CTA, highlights, badges, accents   |
| Green 50     | `#f0fdf4` | Section backgrounds, card fills            |
| Green 900    | `#14532d` | Dark text on green backgrounds             |
| Neutral 950  | `#0a0a0a` | Hero dark backgrounds, scrollytelling scenes |
| Neutral 900  | `#111827` | Pain section background, footer            |
| Neutral 50   | `#f9fafb` | Alternate light section backgrounds        |
| White        | `#ffffff` | Main background, card surfaces             |
| Gray 400     | `#9ca3af` | Subtext, captions, disabled states         |

### Typography

| Role         | Size      | Weight  | Notes                          |
|--------------|-----------|---------|--------------------------------|
| Display H1   | 64–72px   | 800     | Hero headline, scrollytelling anchors |
| H2           | 40–48px   | 700     | Section titles                 |
| H3           | 24–28px   | 600     | Card titles, step headings     |
| Body Large   | 18–20px   | 400     | Subheadlines, descriptions     |
| Body         | 16px      | 400     | Paragraphs, list items         |
| Caption      | 13–14px   | 400     | Labels, badges, footer links   |

Font family: **Inter** (primary) / **Geist** (alternative). Both are clean, modern, and convey trust.

### Border Radius & Shadows

- Cards: `border-radius: 16px`
- Buttons: `border-radius: 10px`
- Badges/chips: `border-radius: 999px` (fully rounded)
- Card shadow: `0 4px 24px rgba(0,0,0,0.07)`
- Elevated shadow: `0 8px 40px rgba(0,0,0,0.12)`

---

## Scrollytelling Narrative

The page tells a **single cinematic story** as the user scrolls.
The protagonist is a real student — someone who has tried to learn English before and failed.
The narrative arc follows the classic **Hero's Journey** compressed into a landing page.

### Story Arc: "De querer hablar inglés, a hablarlo de verdad"

```
ACT I — The Struggle       → Pain recognition, empathy hook
ACT II — The Discovery     → Tutory as the turning point
ACT III — The Method       → How it works (trust building)
ACT IV — The Proof         → Social proof, results
ACT V — The Invitation     → CTA, freemium offer
```

### Scrollytelling Technique

Use **pinned scroll sections**: as the user scrolls, the background/scene stays fixed
while text panels animate in from the side or fade up. Each "beat" of the story
replaces the previous one without a full page jump. Think cinematic chapters.

Visual metaphor: **A classroom window at different times of day** — starts dark/stormy
(struggle), transitions to golden hour (discovery), then bright daylight (success).
Or alternatively: an illustrated desk scene that evolves — empty coffee cups and
frustration → organized notes and a laptop open to Tutory → a confident person on video call.

---

## Page Sections — Detailed Specification

---

### 0. Sticky Navigation Bar

- Background: white, `box-shadow: 0 1px 8px rgba(0,0,0,0.06)` on scroll
- Left: Tutory logo (green wordmark)
- Right: ghost link "Iniciar sesión" + solid green pill button "Comenzar gratis"
- On mobile: hamburger menu
- Behavior: hides on scroll down, reappears on scroll up (smart hide)

---

### 1. HERO — "El inicio de todo"

**Layout:** Full viewport height (100vh). Dark background `#0a0a0a` with
a subtle animated gradient texture (green particles or aurora effect, very subtle).

**Left column (60%):**

Eyebrow badge (green pill): `✦ Plataforma de inglés personalizado`

Headline (white, 68px, 800 weight):
```
Tu profe.
Tu ritmo.
Tu inglés.
```
Each line animates in staggered (fade up, 100ms delay between lines).

Subheadline (gray 400, 20px):
```
Tutory conecta estudiantes con profes reales que hacen seguimiento
de cada clase, tarea y quiz. No más apps genéricas. No más abandonar.
```

CTA row:
- Primary: green solid button "Comenzar gratis →" (large, 52px height)
- Secondary: ghost white button "Ver cómo funciona"

Trust strip (small, below CTAs, gray text + green check icons):
`✓ Sin tarjeta de crédito  ·  ✓ Listo en 2 minutos  ·  ✓ Cancela cuando quieras`

**Right column (40%):**
Floating app dashboard mockup screenshot with subtle levitation animation
(CSS: infinite float up-down, 3s ease-in-out). Green glow behind it.

**Scroll indicator:** Animated down-arrow at the bottom center, fades out after first scroll.

---

### 2. SCROLLYTELLING — ACT I: "The Struggle"
*Pinned section — dark, cinematic*

**Background:** `#111827` (dark), full viewport pin.

As user scrolls through this section, 3 beats appear sequentially (left-panel text changes,
illustration on right evolves):

**Beat 1 — Recognition:**
Large text (white, 52px):
```
Pagaste el curso.
Duraste 3 semanas.
```
Subtext (gray): *"No fue tu culpa. Era genérico. No estaba hecho para ti."*
Visual: illustration of a phone with Duolingo-style streaks broken, or an
abandoned textbook with dust.

**Beat 2 — The real pain:**
Large text (white, 52px):
```
Entiendes cuando lees.
Pero en una conversación...
te bloqueas.
```
Subtext (gray): *"La diferencia entre saber inglés y poder usarlo es un profe que te guíe."*
Visual: illustration of a person frozen mid-conversation, speech bubble empty.

**Beat 3 — The turning point:**
Large text (green, 52px):
```
¿Y si tuvieras un profe
que realmente te conoce?
```
Subtext (white): *"Que sepa en qué te trabas, qué temas te cuesta y cómo motivarte."*
Visual: illustration transitions — warm light, a teacher appearing, connection forming.

---

### 3. SCROLLYTELLING — ACT II: "The Discovery"
*Pinned section — transition from dark to light*

**Background:** Gradual transition from `#111827` to `#f0fdf4` across this section.

**Beat 1:**
Headline (40px, dark): *"Eso es exactamente lo que hace Tutory."*
Subtext: *"No somos una app de ejercicios. Somos la plataforma donde tu profe
organiza todo tu aprendizaje."*
Visual: Tutory logo animates in, app interface appears.

**Beat 2 — Three roles, one ecosystem:**
Three floating cards animate in (staggered):

| Card | Icon | Title | Description |
|------|------|-------|-------------|
| 1 | 👨‍🏫 | Tu profe | Diseña tu plan, asigna clases y hace seguimiento real |
| 2 | 📱 | Tu plataforma | Todo en un solo lugar, sin saltar entre apps |
| 3 | 📈 | Tu progreso | Ves exactamente cómo avanzas, semana a semana |

---

### 4. HOW IT WORKS — "El método en 3 pasos"
*Normal scroll section — white background*

Section label (green, uppercase, small): `CÓMO FUNCIONA`
Headline (dark, 44px): *"De cero a conversación en pasos claros"*

Three steps in a horizontal timeline with connecting line:

**Step 1 — Crea tu cuenta**
Icon: user-plus (green circle background)
Title: *"Entra gratis en 2 minutos"*
Body: *"Sin tarjeta, sin compromisos. Solo tu email y una contraseña."*

**Step 2 — Tu profe configura tu camino**
Icon: map (green circle background)
Title: *"Plan personalizado desde el día 1"*
Body: *"Tu profe conoce tu nivel, tus metas y crea un plan hecho solo para ti."*

**Step 3 — Avanza con estructura**
Icon: trending-up (green circle background)
Title: *"Clases, tareas y quizzes que tienen sentido"*
Body: *"Cada actividad tiene un propósito. Cada sesión te acerca a hablar con confianza."*

Below steps: App screenshot showing the student dashboard timeline/progress view.

---

### 5. FEATURES — "Todo lo que incluye"
*White background, 2-column grid*

Section label: `CARACTERÍSTICAS`
Headline (44px): *"Una plataforma que trabaja tan duro como tú"*

6 feature cards in 2x3 grid:

| Icon | Feature | Description |
|------|---------|-------------|
| 📅 | Clases programadas | Tu profe agenda las sesiones y tú recibes recordatorios automáticos |
| 📋 | Tareas con feedback | Entrega tus tareas y recibe comentarios personalizados de tu profe |
| 🧠 | Quizzes adaptativos | Evalúa tu comprensión con quizzes diseñados según tu nivel real |
| 📊 | Dashboard de progreso | Visualiza tu evolución semana a semana con métricas claras |
| 💬 | Chat directo | Comunícate con tu profe sin salir de la plataforma |
| 📚 | Planes de estudio | Currículo estructurado que escala contigo conforme avanzas |

Card style: white, 16px radius, subtle shadow, green icon accent, hover lifts slightly.

---

### 6. SCROLLYTELLING — ACT IV: "The Proof"
*Pinned section — green tinted background `#f0fdf4`*

This section uses a **testimonial reel** that advances as you scroll.
Left: fixed quote display (large, italic). Right: student avatar + name + result stat.

**Testimonial 1:**
> *"Llevaba 2 años con Duolingo y seguía sin poder mantener una conversación.
> Con Tutory y mi profe, en 3 meses ya tuve mi primera reunión en inglés en el trabajo."*
— **María G.**, Bogotá · Nivel: B1 alcanzado en 90 días

**Testimonial 2:**
> *"Lo que más me sorprendió fue que mi profe sabía exactamente en qué partes me
> bloqueaba. Cada clase atacaba mis puntos débiles reales."*
— **Carlos M.**, Medellín · Nivel: mejoró de A2 a B2

**Testimonial 3:**
> *"Intenté con academias, con YouTube, con apps. Nada funcionó hasta que tuve
> un profe que hacía seguimiento real de lo que yo hacía."*
— **Valentina R.**, Cali · Resultado: consiguió trabajo en empresa internacional

Below testimonials: 3 stat counters animate when section enters viewport:
- **+500** estudiantes activos
- **98%** tasa de continuidad
- **3 meses** promedio para nivel conversacional

---

### 7. PRICING — "Elige cómo empezar"
*White background*

Section label: `PLANES`
Headline (44px): *"Empieza gratis. Escala cuando estés listo."*
Subheadline (gray): *"Sin sorpresas. Sin letra pequeña."*

Two pricing cards side by side, centered:

**Free Card** (gray border, `#f9fafb` background):
Badge: `GRATIS PARA SIEMPRE`
Price: **$0** /mes
Features list (check icons):
- ✓ Acceso a tu dashboard de estudiante
- ✓ Ver tus clases programadas
- ✓ Recibir y entregar tareas
- ✓ Hacer quizzes asignados por tu profe
- ✓ Chat con tu profe
CTA: Green solid button "Crear mi cuenta gratis"

**Pro Card** (green border, elevated shadow, scale 1.02):
Badge (green pill): `MÁS POPULAR · PRÓXIMAMENTE`
Price: **Pronto** — precio especial para early adopters
Features list:
- ✓ Todo lo del plan Free
- ✓ Historial completo de progreso
- ✓ Recursos descargables
- ✓ Reportes avanzados de desempeño
- ✓ Acceso prioritario a funciones nuevas
- ✓ Soporte dedicado
CTA: Gray disabled button "Disponible muy pronto"
Below button: *"Regístrate gratis hoy y accede al precio de lanzamiento"* (green text link)

---

### 8. FINAL CTA — ACT V: "The Invitation"
*Full-width section, green gradient background*

Background: gradient `#16a34a → #22c55e` (diagonal).

Headline (white, 56px, 800 weight):
```
¿Listo para hablar inglés
con confianza?
```

Subtext (white, 90% opacity, 20px):
*"Únete hoy. Es gratis. Tu profe te está esperando."*

Large white CTA button with green text (big, pill shape):
`Crear mi cuenta gratis →`

Below button (small white text, 80% opacity):
`Sin tarjeta de crédito · Sin compromisos · Cancela cuando quieras`

Optional: subtle animated background — floating letters or words in English
(Hello, Yes, I can, Let's talk...) drifting slowly upward at 5% opacity.

---

### 9. FOOTER
*Dark background `#111827`*

Layout (3 columns):
- **Left:** Tutory logo (green) + tagline: *"Tu profe. Tu ritmo. Tu inglés."*
- **Center:** Links: Inicio · Cómo funciona · Precios · Contacto
- **Right:** Social icons (placeholder) + `© 2026 Tutory. Todos los derechos reservados.`

Divider line: `1px solid rgba(255,255,255,0.08)`
Link color: gray 400, hover: green

---

## Interaction & Animation Guidelines

### Scrollytelling Pinned Sections
- Use `position: sticky` with `height: 300vh` containers
- Inner content changes based on scroll progress (0–33%–66%–100%)
- Transition: `opacity` + `transform: translateY` for text beats
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (smooth deceleration)

### General Scroll Animations (non-pinned sections)
- Elements enter: `opacity: 0 → 1` + `translateY(24px → 0)`
- Duration: `600ms`
- Trigger: when element is 20% into viewport
- Stagger delay between siblings: `80ms`

### Hover States
- Buttons: `scale(1.02)` + slight shadow increase, `200ms`
- Cards: `translateY(-4px)` + shadow increase, `250ms`
- Nav links: underline slide-in from left, `200ms`

### CTA Buttons
- Primary (green): green bg → darker green `#16a34a` on hover
- Ghost (white outline): white text → green text + green border on hover
- All buttons: `transition: all 200ms ease`

### Stat Counters (Section 6)
- Animate from 0 to final value when entering viewport
- Duration: 2000ms, easing: ease-out
- Format: numbers only, suffix text static (+, %)

---

## Mobile Responsiveness

- Breakpoints: 375px (mobile), 768px (tablet), 1280px (desktop)
- Scrollytelling sections: on mobile, convert pinned scroll to normal vertical
  stack (one beat per section, no pinning — simpler but still narrative-driven)
- Hero: single column on mobile, illustration below text
- Pricing: cards stack vertically, Pro card first
- Feature grid: 1 column on mobile, 2 on tablet, 2-3 on desktop
- Nav: hamburger menu on mobile with slide-down drawer

---

## Neuromarketing Principles Applied

| Principle | Where applied |
|-----------|---------------|
| **Pain-first narrative** | ACT I scrollytelling — lead with the frustration before the solution |
| **Loss aversion** | Hero trust badges + final CTA ("Tu profe te está esperando") |
| **Social proof anchoring** | Testimonials + stat counters before pricing |
| **Anchoring (price)** | Show value and proof before revealing price |
| **Commitment & consistency** | "Gratis para siempre" free tier lowers first-step friction |
| **Scarcity (soft)** | "Early adopters" language on Pro pricing card |
| **Empathy & identification** | ACT I uses exact words real students say ("me bloqueo") |
| **Pattern interruption** | Dark scrollytelling sections break the white-page pattern |
| **Progress principle** | 3-step "how it works" makes the journey feel achievable |
| **Authority** | Teacher framing — human expertise > algorithm |

---

## Assets Needed (Placeholders for Now)

- [ ] App dashboard screenshot (student view)
- [ ] App dashboard screenshot (teacher view)
- [ ] 3 student avatar photos (or illustrated avatars)
- [ ] Teacher-student illustration for hero (or use a clean mockup frame)
- [ ] Tutory logo SVG (wordmark + icon variant)

*All can be placeholder/generated for the Stitch design phase.*

---

## Google OAuth Notes (for dev sessions)

Login options to support on the landing page:
1. Email + password (Supabase Auth)
2. "Continuar con Google" (Google OAuth via Supabase)

New users via Google OAuth → trigger `handle_new_user` → role assigned as `student`
(same secure flow from migration 010).

The login/signup modal should appear inline (slide-up sheet or centered modal)
when any CTA is clicked — do not redirect to a separate `/login` page from the landing.
