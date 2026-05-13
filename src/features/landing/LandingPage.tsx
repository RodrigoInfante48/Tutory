import { useState, useEffect, useRef, RefObject } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView, useMotionValue, animate } from 'framer-motion'

const WHATSAPP_URL = 'https://wa.me/573209974750'
const WHATSAPP_DISPLAY = '+57 320 997 4750'

// ─── Animation variants ────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const wordVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
}

// ─── WhatsApp icon ─────────────────────────────────────────────────────────

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ─── Navbar ────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Clase de prueba', href: '#clase-prueba' },
    { label: 'Precios', href: '#precios' },
  ]

  function smoothScroll(e: { preventDefault(): void }, href: string) {
    e.preventDefault()
    setMenuOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'backdrop-blur-md border-b border-white/[0.06] bg-black/40'
            : 'bg-transparent',
        ].join(' ')}
      >
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 select-none">
            <span className="font-heading text-xl font-bold tracking-tight text-white">
              Tu<span className="text-[#86ef86]">tory</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={e => smoothScroll(e, link.href)}
                  className="text-sm text-white/60 hover:text-white transition-colors duration-150"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm px-4 py-2 rounded-md border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-all duration-200 hover:scale-[1.02]"
            >
              Ingresar →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px]"
            onClick={() => setMenuOpen((v: boolean) => !v)}
            aria-label="Menú"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-5 h-[1.5px] bg-white origin-center"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.15 }}
              className="block w-5 h-[1.5px] bg-white"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block w-5 h-[1.5px] bg-white origin-center"
            />
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#0f0f0f] border-l border-white/[0.08] flex flex-col pt-20 px-6 gap-6 md:hidden"
            >
              <ul className="flex flex-col gap-5">
                {navLinks.map(link => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={e => smoothScroll(e, link.href)}
                      className="text-base text-white/70 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-3 pb-10">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center text-sm px-4 py-2.5 rounded-md border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-all duration-200"
                >
                  Ingresar →
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Video placeholder ──────────────────────────────────────────────────────

function VideoPlaceholder() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-sm mx-auto lg:mx-0"
    >
      <div className="absolute inset-0 rounded-2xl bg-[#86ef86]/10 blur-2xl -z-10 scale-110" />
      <div className="group aspect-video rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#86ef86]/30 transition-all duration-300">
        <div className="w-16 h-16 rounded-full border border-[#86ef86]/40 bg-[#86ef86]/10 flex items-center justify-center group-hover:bg-[#86ef86]/20 group-hover:scale-105 transition-all duration-300">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            className="ml-1 text-[#86ef86]"
          >
            <polygon points="5,3 19,12 5,21" fill="currentColor" />
          </svg>
        </div>
        <p className="text-sm text-white/40 font-medium tracking-wide">Video del método — próximamente</p>
      </div>
    </motion.div>
  )
}

// ─── Hero ───────────────────────────────────────────────────────────────────

const HEADLINE = 'Aprende inglés con tu profe personal — sin buscar, sin improvisar'

function Hero() {
  const words = HEADLINE.split(' ')

  function scrollTo(id: string) {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden bg-[#0a0a0a]">
      {/* Radial green glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(134,239,134,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-[60%_40%] gap-16 items-center">
        {/* ── Left: text ── */}
        <div className="flex flex-col gap-6">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/50 bg-white/[0.03]">
              <span className="text-[#86ef86]">✦</span>
              Docentes certificados · Plan personalizado desde el día 1
            </span>
          </motion.div>

          {/* Headline — word by word */}
          <motion.h1
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="font-heading text-5xl md:text-6xl xl:text-7xl font-bold tracking-tighter leading-none text-white"
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariant}
                className="inline-block mr-[0.22em] last:mr-0"
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.55, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-base md:text-lg text-white/50 max-w-lg leading-relaxed"
          >
            Tutory te conecta con un docente certificado que diseña tu plan de estudios,
            hace seguimiento de tu progreso y se asegura de que llegues a tu meta.
            Tú solo aprendes.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <button
              onClick={() => scrollTo('#clase-prueba')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#86ef86] text-[#0a0a0a] text-sm font-semibold hover:bg-[#9ef89e] transition-all duration-200 hover:scale-[1.02]"
            >
              Quiero mi profe ideal
            </button>
            <button
              onClick={() => scrollTo('#aplicar-profe')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-white/80 text-sm font-semibold hover:text-white hover:border-white/40 transition-all duration-200 hover:scale-[1.02]"
            >
              Soy profesor — únete a Tutory
            </button>
          </motion.div>
        </div>

        {/* ── Right: video placeholder ── */}
        <div className="hidden lg:flex items-center justify-end">
          <VideoPlaceholder />
        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </section>
  )
}

// ─── Section: El Método CFI ──────────────────────────────────────────────────

const CFI_SESSIONS = [
  {
    name: 'Precision Sprint',
    tagline: 'Inglés preciso. Sin margen de error.',
    structure: [
      { time: '0–10 min', label: 'Diagnóstico de expresión' },
      { time: '10–30 min', label: 'Ejercicio de precisión gramatical' },
      { time: '30–45 min', label: 'Producción guiada en contexto real' },
      { time: '45–50 min', label: 'Retroalimentación y cierre' },
    ],
  },
  {
    name: 'Culture Club',
    tagline: 'El inglés que vive fuera del aula.',
    structure: [
      { time: '0–10 min', label: 'Tema cultural del día (serie, noticia, tendencia)' },
      { time: '10–30 min', label: 'Debate y discusión en inglés' },
      { time: '30–45 min', label: 'Expresiones idiomáticas en contexto' },
      { time: '45–50 min', label: 'Tarea de inmersión para casa' },
    ],
  },
  {
    name: 'Professional Lab',
    tagline: 'Inglés que abre puertas de verdad.',
    structure: [
      { time: '0–10 min', label: 'Escenario laboral del día (email, reunión, pitch)' },
      { time: '10–30 min', label: 'Rol-play del escenario' },
      { time: '30–45 min', label: 'Corrección y pulido del lenguaje' },
      { time: '45–50 min', label: 'Acción concreta para la semana' },
    ],
  },
]

function SectionMetodoCFI() {
  return (
    <section id="metodo" className="relative py-32 bg-[#0d0d0d]">
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0a0a0a] to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs font-medium text-[#86ef86]/60 tracking-widest uppercase mb-5"
          >
            El método
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-white leading-tight"
          >
            Tres tipos de sesión.<br />Un solo objetivo.
          </motion.h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
          {CFI_SESSIONS.map((session, i) => (
            <motion.div
              key={session.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#0d0d0d] p-8 flex flex-col gap-8 hover:bg-[#0f0f0f] transition-colors duration-300"
            >
              {/* Top */}
              <div>
                <div className="w-6 h-px bg-[#86ef86] mb-6" />
                <h3 className="font-heading text-xl font-bold text-white mb-2">{session.name}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{session.tagline}</p>
              </div>

              {/* Structure */}
              <ul className="flex flex-col gap-4">
                {session.structure.map((item) => (
                  <li key={item.time} className="flex items-start gap-4">
                    <span className="text-[11px] text-[#86ef86]/60 font-mono mt-0.5 flex-shrink-0 w-14">{item.time}</span>
                    <span className="text-sm text-white/60 leading-snug">{item.label}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section: Calculadora de Metas ───────────────────────────────────────────

type Goal = 'Viajes' | 'Trabajo / Negocios' | 'Exámenes' | 'Conversación fluida'
type TimeBracket = 'short' | 'mid' | 'long'

const GOALS: Goal[] = ['Viajes', 'Trabajo / Negocios', 'Exámenes', 'Conversación fluida']

const RECOMMENDATIONS: Record<Goal, Record<TimeBracket, { plan: string; sessions: number; description: string }>> = {
  'Viajes': {
    short: { plan: 'Explorer Básico', sessions: 8, description: 'Domina el inglés de supervivencia, reservas y conversaciones turísticas en tiempo récord.' },
    mid:   { plan: 'Explorer Plus',   sessions: 6, description: 'Amplía tu vocabulario de viajes y gana fluidez para moverte con confianza en cualquier país.' },
    long:  { plan: 'Explorer Pro',    sessions: 4, description: 'Construye una base sólida para comunicarte como local, no solo como turista.' },
  },
  'Trabajo / Negocios': {
    short: { plan: 'Professional Fast Track', sessions: 12, description: 'Inmersión acelerada en emails, reuniones y presentaciones en inglés. Para resultados en semanas.' },
    mid:   { plan: 'Professional Standard',   sessions: 8,  description: 'Desarrolla el inglés ejecutivo que necesitas para negociar, liderar y comunicar en entornos globales.' },
    long:  { plan: 'Professional Growth',     sessions: 6,  description: 'Crecimiento sostenido del inglés profesional con énfasis en vocabulario técnico de tu industria.' },
  },
  'Exámenes': {
    short: { plan: 'Intensive Exam Prep', sessions: 16, description: 'Preparación intensiva para IELTS, TOEFL o Cambridge. Máxima concentración en lo que puntúa.' },
    mid:   { plan: 'Exam Prep Standard',  sessions: 12, description: 'Preparación estructurada con práctica de todas las secciones del examen y simulacros semanales.' },
    long:  { plan: 'Exam Ready',          sessions: 8,  description: 'Construye la base lingüística y practíca con tiempo para no saturarte antes del examen.' },
  },
  'Conversación fluida': {
    short: { plan: 'Fluency Sprint', sessions: 8, description: 'Sesiones conversacionales intensas para romper el bloqueo y empezar a hablar sin miedo.' },
    mid:   { plan: 'Fluency Standard', sessions: 6, description: 'Práctica constante de conversación en temas variados para alcanzar fluidez natural.' },
    long:  { plan: 'Fluency Pro', sessions: 4, description: 'Exposición gradual y consistente para desarrollar una fluidez duradera y sin esfuerzo.' },
  },
}

function getTimeBracket(months: number): TimeBracket {
  if (months <= 3) return 'short'
  if (months <= 6) return 'mid'
  return 'long'
}

function SectionCalculadoraMetas() {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [months, setMonths] = useState(6)

  const bracket = getTimeBracket(months)
  const rec = selectedGoal ? RECOMMENDATIONS[selectedGoal][bracket] : null

  return (
    <section id="calculadora" className="relative py-32 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs font-medium text-[#86ef86]/60 tracking-widest uppercase mb-5"
          >
            Calculadora de metas
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-white leading-tight"
          >
            ¿Cuál es tu meta<br />y cuánto tiempo tienes?
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start"
        >
          {/* Left: controls */}
          <div className="flex flex-col gap-10">
            {/* Goal selector */}
            <div>
              <p className="text-sm font-medium text-white/70 mb-4">¿Cuál es tu meta?</p>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setSelectedGoal(goal)}
                    className={[
                      'px-4 py-3 rounded-lg border text-sm font-medium text-left transition-all duration-200',
                      selectedGoal === goal
                        ? 'border-[#86ef86]/60 bg-[#86ef86]/10 text-[#86ef86]'
                        : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white/80',
                    ].join(' ')}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Time slider */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-white/70">¿Cuánto tiempo tienes?</p>
                <span className="text-sm font-bold text-[#86ef86]">
                  {months} {months === 1 ? 'mes' : 'meses'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #86ef86 0%, #86ef86 ${((months - 1) / 11) * 100}%, rgba(255,255,255,0.12) ${((months - 1) / 11) * 100}%, rgba(255,255,255,0.12) 100%)`,
                  }}
                />
                <style>{`
                  input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #86ef86;
                    border: 2px solid #0a0a0a;
                    box-shadow: 0 0 0 2px rgba(134,239,134,0.3);
                    cursor: pointer;
                  }
                  input[type=range]::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #86ef86;
                    border: 2px solid #0a0a0a;
                    cursor: pointer;
                  }
                `}</style>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-white/25">1 mes</span>
                  <span className="text-[10px] text-white/25">12 meses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: recommendation */}
          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              {rec ? (
                <motion.div
                  key={`${selectedGoal}-${bracket}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-2xl border border-[#86ef86]/25 bg-[#86ef86]/[0.04] p-8 flex flex-col justify-between gap-6"
                  style={{ boxShadow: '0 0 40px rgba(134,239,134,0.08)' }}
                >
                  <div>
                    <p className="text-xs text-[#86ef86]/60 tracking-widest uppercase mb-3">Te recomendamos</p>
                    <h3 className="font-heading text-2xl font-bold text-white mb-1">{rec.plan}</h3>
                    <p className="text-3xl font-black text-[#86ef86] font-heading mb-4">
                      {rec.sessions} <span className="text-base font-normal text-white/40">sesiones/mes</span>
                    </p>
                    <p className="text-sm text-white/55 leading-relaxed">{rec.description}</p>
                  </div>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#86ef86] text-[#0a0a0a] text-sm font-semibold hover:bg-[#9ef89e] transition-all duration-200 hover:scale-[1.02]"
                  >
                    <WhatsAppIcon />
                    Consultar por WhatsApp
                  </a>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 flex flex-col items-center justify-center gap-3 text-center"
                >
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                    <span className="text-[#86ef86]/40 text-lg">→</span>
                  </div>
                  <p className="text-sm text-white/30">Selecciona tu meta para ver<br />la recomendación de plan</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Shared hook ────────────────────────────────────────────────────────────

function useSectionRef() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  return { ref, inView }
}

// ─── Section: El Problema ───────────────────────────────────────────────────

const PAIN_ITEMS = [
  { emoji: '📱', text: 'WhatsApp para tareas y mensajes' },
  { emoji: '📊', text: 'Google Sheets para el seguimiento' },
  { emoji: '📝', text: 'Notion para el plan de estudios' },
  { emoji: '📅', text: 'Google Calendar para clases' },
  { emoji: '📧', text: 'Email para materiales' },
]

function SectionProblema() {
  const { ref, inView } = useSectionRef()

  const listContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
  }

  const listItem = {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  }

  const conclusionVariant = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  }

  const underlineVariant = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  }

  return (
    <section
      id="problema"
      ref={ref as RefObject<HTMLElement>}
      className="relative py-32 bg-[#0d0d0d]"
    >
      {/* Subtle top fade from hero */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0a0a0a] to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs font-medium text-[#86ef86]/60 tracking-widest uppercase mb-5"
          >
            El problema
          </motion.p>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-white leading-tight mb-12"
          >
            ¿Cuántas apps usas<br />para enseñar?
          </motion.h2>

          {/* Animated list */}
          <motion.ul
            variants={listContainer}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="flex flex-col gap-4 mb-14"
          >
            {PAIN_ITEMS.map((item) => (
              <motion.li
                key={item.text}
                variants={listItem}
                className="flex items-center gap-4 group"
              >
                <span className="text-2xl select-none">{item.emoji}</span>
                <span className="text-lg md:text-xl text-white/70 group-hover:text-white/90 transition-colors duration-200">
                  {item.text}
                </span>
              </motion.li>
            ))}
          </motion.ul>

          {/* Conclusion line */}
          <motion.div
            variants={conclusionVariant}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            transition={{ delay: PAIN_ITEMS.length * 0.15 + 0.2 }}
            className="flex items-baseline gap-3 flex-wrap"
          >
            <span className="text-white/40 text-xl md:text-2xl font-medium">Todo eso</span>
            <span className="text-white/40 text-xl md:text-2xl">→</span>
            <span className="relative text-xl md:text-2xl font-bold text-white">
              un solo lugar.
              <motion.span
                variants={underlineVariant}
                initial="hidden"
                animate={inView ? 'visible' : 'hidden'}
                className="absolute left-0 bottom-[-3px] h-[2px] w-full bg-[#86ef86] origin-left rounded-full"
                style={{ display: 'block' }}
              />
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Section: Cómo funciona — mini mockups ──────────────────────────────────

function MockupStudentCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden w-full max-w-xs">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#86ef86]/30 to-[#166534]/40 flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-semibold text-[#86ef86]">CT</span>
        </div>
        <div>
          <p className="text-xs font-medium text-white">Camila Torres</p>
          <p className="text-[10px] text-white/40">B2 Upper-Intermediate</p>
        </div>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#86ef86]/15 text-[#86ef86] font-medium">Activa</span>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/40 mb-0.5">Próxima clase</p>
          <p className="text-xs text-white font-medium">Hoy · 3:00 PM</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/40 mb-0.5">Progreso</p>
          <p className="text-xs text-[#86ef86] font-semibold">68%</p>
        </div>
      </div>
    </div>
  )
}

function MockupTaskList() {
  const tasks = [
    { title: 'Essay: Daily Routine', due: 'Hoy', done: true },
    { title: 'Listening Practice', due: 'Mañana', done: false },
    { title: 'Grammar Quiz', due: 'Jue', done: false },
  ]
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden w-full max-w-xs">
      <div className="px-4 py-2.5 border-b border-white/[0.06]">
        <p className="text-[11px] font-semibold text-white/70 tracking-wide">Tareas pendientes</p>
      </div>
      <ul className="divide-y divide-white/[0.05]">
        {tasks.map((t) => (
          <li key={t.title} className="px-4 py-2.5 flex items-center gap-3">
            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${t.done ? 'bg-[#86ef86]/20 border-[#86ef86]/40' : 'border-white/20'}`}>
              {t.done && <span className="text-[8px] text-[#86ef86] font-bold">✓</span>}
            </div>
            <span className={`flex-1 text-xs ${t.done ? 'line-through text-white/30' : 'text-white/80'}`}>{t.title}</span>
            <span className="text-[10px] text-white/30">{t.due}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MockupProgress() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden w-full max-w-xs">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-white/70">Progreso del plan</p>
          <span className="text-xs font-bold text-[#86ef86]">68%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '68%' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-[#86ef86]"
          />
        </div>
      </div>
      <div className="px-4 pb-4 border-t border-white/[0.05] pt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/[0.04] px-3 py-2">
          <p className="text-[10px] text-white/40 mb-0.5">Último quiz</p>
          <p className="text-sm font-bold text-white">9<span className="text-white/40 text-xs font-normal">/10</span></p>
        </div>
        <div className="rounded-lg bg-white/[0.04] px-3 py-2">
          <p className="text-[10px] text-white/40 mb-0.5">Clases tomadas</p>
          <p className="text-sm font-bold text-white">12<span className="text-white/40 text-xs font-normal"> este mes</span></p>
        </div>
      </div>
    </div>
  )
}

const HOW_STEPS = [
  {
    number: '01',
    title: 'Cuéntanos tu meta',
    description: 'Llena el formulario de 2 minutos. Nos dices tu nivel, tu objetivo y cuánto tiempo tienes disponible.',
    Mockup: MockupStudentCard,
  },
  {
    number: '02',
    title: 'Te asignamos el profe ideal',
    description: 'Revisamos tu perfil y te conectamos con el docente más alineado a tu objetivo. Sin búsqueda, sin prueba y error.',
    Mockup: MockupTaskList,
  },
  {
    number: '03',
    title: 'Empieza tu primera clase de prueba',
    description: 'Tu profe diseña tu plan personalizado y arrancas en 48 horas. Desde el día 1 tienes todo estructurado.',
    Mockup: MockupProgress,
  },
]

function SectionComoFunciona() {
  const { ref, inView: _inView } = useSectionRef()

  return (
    <section
      id="como-funciona"
      ref={ref as RefObject<HTMLElement>}
      className="relative py-32 bg-[#0a0a0a]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-xl mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs font-medium text-[#86ef86]/60 tracking-widest uppercase mb-5"
          >
            Cómo funciona
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-white leading-tight"
          >
            Tres pasos para tener<br />tu profe listo
          </motion.h2>
        </div>

        {/* Zig-zag steps */}
        <div className="flex flex-col gap-24">
          {HOW_STEPS.map((step, i) => {
            const isEven = i % 2 === 0
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${!isEven ? 'lg:[&>*:first-child]:order-2' : ''}`}
              >
                {/* Text side */}
                <div className="flex flex-col gap-5">
                  <span
                    className="font-heading font-black text-[6rem] leading-none select-none text-[#86ef86]"
                    style={{ opacity: 0.08 }}
                  >
                    {step.number}
                  </span>
                  <div className="-mt-8">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-base text-white/50 leading-relaxed max-w-md">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Mockup side */}
                <div className={`flex ${isEven ? 'lg:justify-end' : 'lg:justify-start'}`}>
                  <step.Mockup />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Section: Funcionalidades ────────────────────────────────────────────────

const FEATURE_CARDS_SECONDARY = [
  {
    icon: '🧠',
    title: 'Quizzes automáticos',
    description: 'Crea y asigna quizzes de opción múltiple. Los estudiantes responden desde su portal, tú ves los scores al instante.',
  },
  {
    icon: '💬',
    title: 'Chat integrado',
    description: 'Mensajes directos con cada estudiante. Sin salir de Tutory. Sin WhatsApp.',
  },
]

const FEATURE_CARDS_SMALL = [
  {
    icon: '📅',
    title: 'Gestión de clases',
    description: 'Calendario de sesiones, estados (tomada, no-show, reagendada) y control de ciclos.',
  },
  {
    icon: '📚',
    title: 'Plan de estudios estructurado',
    description: 'Unidades, topics con contenido HTML y preguntas de comprensión por estudiante.',
  },
  {
    icon: '🗂️',
    title: 'Recursos y materiales',
    description: 'Sube links, PDFs y videos globales o asignados a un estudiante específico.',
  },
]

function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: string
  title: string
  description: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 hover:border-[#86ef86]/30 transition-all duration-300 hover:bg-[#86ef86]/[0.02]"
    >
      <span className="text-2xl mb-4 block">{icon}</span>
      <h4 className="font-heading text-base font-semibold text-white mb-2">{title}</h4>
      <p className="text-sm text-white/50 leading-relaxed">{description}</p>
    </motion.div>
  )
}

function SectionFuncionalidades() {
  return (
    <section
      id="funcionalidades"
      className="relative py-32 bg-[#0d0d0d]"
    >
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0a0a0a] to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs font-medium text-[#86ef86]/60 tracking-widest uppercase mb-5"
          >
            Funcionalidades
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-white leading-tight"
          >
            Todo lo que necesitas,<br />nada que no necesitas
          </motion.h2>
        </div>

        {/* First row: asymmetric 60/40 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
          {/* Big feature card (3/5) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-3 group relative rounded-xl border border-white/[0.08] bg-white/[0.03] p-8 hover:border-[#86ef86]/30 transition-all duration-300 hover:bg-[#86ef86]/[0.02]"
          >
            <span className="text-3xl mb-5 block">👤</span>
            <h4 className="font-heading text-xl font-bold text-white mb-3">
              Seguimiento completo por estudiante
            </h4>
            <p className="text-sm text-white/50 leading-relaxed max-w-md">
              Plan de estudios, tareas, quizzes, historial de clases y materiales — todo en un solo perfil.
              Sabes exactamente dónde está cada estudiante en su proceso de aprendizaje.
            </p>
            {/* Mini preview */}
            <div className="mt-6 flex flex-wrap gap-2">
              {['Plan de estudios', 'Historial de clases', 'Quizzes', 'Tareas', 'Mensajes', 'Materiales'].map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 text-white/40 bg-white/[0.03]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Two stacked small cards (2/5) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {FEATURE_CARDS_SECONDARY.map((card, i) => (
              <FeatureCard key={card.title} {...card} delay={i * 0.1} />
            ))}
          </div>
        </div>

        {/* Second row: 3 equal small cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURE_CARDS_SMALL.map((card, i) => (
            <FeatureCard key={card.title} {...card} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section: Para quién es ──────────────────────────────────────────────────

const TEACHER_BENEFITS = [
  'Recibes estudiantes calificados directamente en tu panel',
  'Los pagos llegan automáticos — tú solo das clase',
  'Sin hacer marketing, sin perseguir pagos',
  'Un solo lugar para gestionar todo tu proceso',
  'Quizzes, tareas y seguimiento integrados',
  'Chat directo con tus estudiantes sin salir de Tutory',
]

const STUDENT_BENEFITS = [
  'Tu plan de estudios siempre visible',
  'Recibe tareas con fechas claras',
  'Haz quizzes cuando tu profe los asigne',
  'Accede a todos los materiales en un clic',
  'Ve tu progreso en tiempo real',
  'Comunícate con tu profe sin WhatsApp',
]

function BenefitItem({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-3"
    >
      <span className="mt-1 w-4 h-4 rounded-full bg-[#86ef86]/15 border border-[#86ef86]/30 flex items-center justify-center flex-shrink-0">
        <span className="text-[8px] text-[#86ef86] font-bold">✓</span>
      </span>
      <span className="text-sm text-white/65 leading-relaxed">{text}</span>
    </motion.li>
  )
}

function SectionParaQuien() {
  return (
    <section
      id="para-quien"
      className="relative py-32 bg-[#0a0a0a]"
    >
      <div id="aplicar-profe" className="absolute" style={{ top: '-80px' }} />
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs font-medium text-[#86ef86]/60 tracking-widest uppercase mb-5"
          >
            Para quién es
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-white leading-tight"
          >
            Construido para los<br />dos lados de la clase
          </motion.h2>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-0 items-start">
          {/* Profesores */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="pr-0 lg:pr-16 pb-12 lg:pb-0"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-[#86ef86]/10 border border-[#86ef86]/20 flex items-center justify-center">
                <span className="text-lg">🎓</span>
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-white">Para profesores</h3>
                <p className="text-sm text-white/40">Estudiantes listos — sin marketing, sin cobros</p>
              </div>
            </div>
            <ul className="flex flex-col gap-4">
              {TEACHER_BENEFITS.map((text, i) => (
                <BenefitItem key={text} text={text} delay={i * 0.07} />
              ))}
            </ul>
          </motion.div>

          {/* Vertical divider — visible only on lg+ */}
          <div className="hidden lg:block">
            <div
              className="h-full w-px"
              style={{
                background: 'linear-gradient(to bottom, transparent, rgba(134,239,134,0.25) 20%, rgba(134,239,134,0.25) 80%, transparent)',
                minHeight: '320px',
              }}
            />
          </div>

          {/* Estudiantes */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="pl-0 lg:pl-16 pt-12 lg:pt-0 border-t border-white/[0.06] lg:border-0"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-[#86ef86]/10 border border-[#86ef86]/20 flex items-center justify-center">
                <span className="text-lg">📖</span>
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-white">Para estudiantes</h3>
                <p className="text-sm text-white/40">Todo claro, todo en un lugar</p>
              </div>
            </div>
            <ul className="flex flex-col gap-4">
              {STUDENT_BENEFITS.map((text, i) => (
                <BenefitItem key={text} text={text} delay={i * 0.07} />
              ))}
            </ul>
          </motion.div>
        </div>

        {/* CTA at the bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 max-w-md mx-auto rounded-2xl border border-[#86ef86]/20 bg-[#86ef86]/[0.03] p-8 text-center flex flex-col items-center gap-4"
          style={{ boxShadow: '0 0 40px rgba(134,239,134,0.06)' }}
        >
          <div className="w-12 h-12 rounded-xl bg-[#86ef86]/10 border border-[#86ef86]/20 flex items-center justify-center text-[#86ef86]">
            <WhatsAppIcon size={22} />
          </div>
          <p className="text-sm font-semibold text-white">¿Quieres empezar?</p>
          <p className="text-xs text-white/40 leading-relaxed max-w-xs">
            Escríbenos y te explicamos cómo funciona.<br />
            Solo aceptamos estudiantes que se lo toman en serio.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#86ef86] text-[#0a0a0a] text-sm font-semibold hover:bg-[#9ef89e] transition-all duration-200 hover:scale-[1.02]"
          >
            <WhatsAppIcon />
            Escribir al WhatsApp
          </a>
          <p className="text-[11px] text-white/25">{WHATSAPP_DISPLAY}</p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Section: Testimonios ────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: 'Juliana Herrera',
    role: 'Estudiante · Meta: trabajo en multinacional',
    initials: 'JH',
    text: 'En tres meses pasé de entender poco en reuniones a liderar una presentación en inglés ante clientes internacionales. El método CFI es diferente a todo lo que había probado.',
  },
  {
    name: 'Camilo Restrepo',
    role: 'Estudiante · Meta: viaje a Europa',
    initials: 'CR',
    text: 'Llevaba años con apps de inglés y nunca lograba hablar con fluidez. Con Tutory, en dos meses ya podía mantener conversaciones reales. Me fui al viaje y no tuve miedo.',
  },
  {
    name: 'María Paula Soto',
    role: 'Estudiante · Meta: examen IELTS',
    initials: 'MS',
    text: 'Saqué 7.5 en el IELTS en mi primer intento. Mi profesor sabía exactamente en qué fallaba y lo trabajamos sesión a sesión. No memoricé — aprendí a pensar en inglés.',
  },
]

function SectionTestimonios() {
  return (
    <section id="testimonios" className="relative py-32 bg-[#0d0d0d] overflow-hidden">
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: marquee-scroll 40s linear infinite;
        }
        .marquee-root:hover .marquee-track {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 mb-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs font-medium text-[#86ef86]/60 tracking-widest uppercase mb-5"
        >
          Testimonios
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-white leading-tight"
        >
          Lo que dicen<br />nuestros estudiantes
        </motion.h2>
      </div>

      {/* Marquee */}
      <div
        className="marquee-root overflow-hidden cursor-grab"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="marquee-track">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-80 rounded-xl border border-white/[0.08] bg-white/[0.03] p-6"
              style={{ boxShadow: '0 4px 24px rgba(134,239,134,0.08)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#86ef86]/30 to-[#166534]/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#86ef86]">{t.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>
              <p className="text-sm text-white/65 leading-relaxed">"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section: Métricas ───────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref as RefObject<Element>, { once: true, margin: '-80px' })
  const motionVal = useMotionValue(0)
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView) return
    const controls = animate(motionVal, target, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v).toLocaleString('es-CO')),
    })
    return controls.stop
  }, [inView, target, motionVal])

  return <span ref={ref}>{display}{suffix}</span>
}

const METRICS = [
  { target: 50,   suffix: '+', label: 'docentes certificados' },
  { target: 1400, suffix: '+', label: 'estudiantes gestionados' },
  { target: 98,   suffix: '%', label: 'satisfacción docente' },
]

function SectionMetricas() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(22,101,52,0.45) 0%, #0a0a0a 70%)' }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          {METRICS.map((m) => (
            <div key={m.label} className="flex flex-col items-center text-center py-10 md:py-4 px-8">
              <span className="font-heading text-6xl md:text-7xl xl:text-8xl font-black text-white tracking-tighter mb-2">
                <AnimatedCounter target={m.target} suffix={m.suffix} />
              </span>
              <span className="text-sm text-white/45">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section: ¿Listo para empezar? ──────────────────────────────────────────

function SectionClaseDePrueba() {
  return (
    <section id="clase-prueba" className="relative py-32 bg-[#0d0d0d]">
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0a0a0a] to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs font-medium text-[#86ef86]/60 tracking-widest uppercase mb-5"
          >
            Acceso directo
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-white leading-tight mb-4"
          >
            ¿Listo para empezar?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="text-base text-white/50 leading-relaxed"
          >
            No hay formularios ni listas de espera interminables. Escríbenos
            directamente — cuéntanos tu meta y encontramos el plan ideal para ti.
          </motion.p>
        </div>

        {/* WhatsApp card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-sm mx-auto rounded-2xl border border-[#86ef86]/25 bg-[#0a0a0a] p-10 flex flex-col items-center gap-6 text-center"
          style={{ boxShadow: '0 0 60px rgba(134,239,134,0.08)' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#86ef86]/10 border border-[#86ef86]/25 flex items-center justify-center text-[#86ef86]">
            <WhatsAppIcon size={30} />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="font-heading text-xl font-bold text-white">Escríbenos por WhatsApp</p>
            <p className="text-sm text-white/45 leading-relaxed">
              Solo aceptamos estudiantes que se lo toman en serio.<br />
              Respondemos en menos de 24 horas.
            </p>
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#86ef86] text-[#0a0a0a] text-sm font-semibold hover:bg-[#9ef89e] transition-all duration-200 hover:scale-[1.02]"
          >
            <WhatsAppIcon />
            Escribir al WhatsApp
          </a>

          <div className="flex flex-col gap-1 items-center">
            <p className="text-sm font-medium text-[#86ef86]">{WHATSAPP_DISPLAY}</p>
            <p className="text-[11px] text-white/25">Colombia · Lunes a sábado</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Section: Precios ────────────────────────────────────────────────────────

function SectionPrecios() {
  return (
    <section id="precios" className="relative py-32 bg-[#0d0d0d]">
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0a0a0a] to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs font-medium text-[#86ef86]/60 tracking-widest uppercase mb-5"
          >
            Planes
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-white leading-tight"
          >
            Hecho a tu medida.
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto rounded-2xl border border-white/[0.08] bg-white/[0.03] p-10 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="flex-1 flex flex-col gap-4">
            <p className="font-heading text-xl font-bold text-white leading-snug">
              Los planes se coordinan<br />directamente contigo.
            </p>
            <p className="text-sm text-white/50 leading-relaxed">
              No hay tarifas públicas fijas porque cada estudiante es diferente.
              Hablamos de tus metas, tu disponibilidad y encontramos el plan
              que tiene sentido para ti — sin sorpresas.
            </p>
            <ul className="flex flex-col gap-2 mt-2">
              {['Clases individuales o grupales', 'Paquetes semanales flexibles', 'Primera clase de diagnóstico sin costo'].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-[#86ef86]/15 border border-[#86ef86]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[8px] text-[#86ef86] font-bold">✓</span>
                  </span>
                  <span className="text-sm text-white/65">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-shrink-0 flex flex-col items-center gap-4 text-center">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#86ef86] text-[#0a0a0a] text-sm font-semibold hover:bg-[#9ef89e] transition-all duration-200 hover:scale-[1.02] whitespace-nowrap"
            >
              <WhatsAppIcon />
              Consultar planes
            </a>
            <p className="text-[11px] text-white/30">{WHATSAPP_DISPLAY}</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Section: CTA Final ──────────────────────────────────────────────────────

function SectionCTAFinal() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref as RefObject<Element>, { once: true, margin: '-80px' })

  return (
    <section ref={ref as RefObject<HTMLElement>} className="relative py-32 overflow-hidden bg-[#0a0a0a]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(134,239,134,0.18) 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-3xl mx-auto px-6 text-center"
      >
        <h2 className="font-heading text-4xl md:text-6xl font-bold tracking-tighter text-white leading-tight mb-6">
          ¿Listo para hablar<br />inglés de verdad?
        </h2>
        <p className="text-base md:text-lg text-white/50 leading-relaxed mb-10 max-w-xl mx-auto">
          Escríbenos por WhatsApp. Sin formularios, sin esperas.
          Solo cuéntanos tu meta y empezamos.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#86ef86] text-[#0a0a0a] text-sm font-semibold hover:bg-[#9ef89e] transition-all duration-200 hover:scale-[1.02]"
        >
          <WhatsAppIcon />
          Escribir al WhatsApp
        </a>
      </motion.div>
    </section>
  )
}

// ─── Footer ─────────────────────────────────────────────────────────────────

function Footer() {
  const platformLinks = [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Precios', href: '#precios' },
    { label: 'Iniciar sesión', href: '/login' },
  ]

  function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-[#0a0a0a]">
      {/* Top separator: transparent → green → transparent */}
      <div
        className="w-full h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(134,239,134,0.3), transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-12 md:gap-16 items-start">
          {/* Brand + social */}
          <div>
            <Link to="/" className="flex items-center gap-1.5 mb-3">
              <span className="font-heading text-xl font-bold tracking-tight text-white">
                Tu<span className="text-[#86ef86]">tory</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 max-w-xs leading-relaxed">
              La plataforma para profesores de inglés que se toman en serio su oficio.
            </p>

            {/* Social icons — SVG inline */}
            <div className="flex items-center gap-3 mt-5">
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all duration-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a href="#" aria-label="X (Twitter)" className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all duration-200">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all duration-200">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <p className="text-xs font-semibold text-white/30 tracking-widest uppercase mb-5">Plataforma</p>
            <ul className="flex flex-col gap-3">
              {platformLinks.map(link => (
                <li key={link.href}>
                  {link.href.startsWith('#') ? (
                    <a
                      href={link.href}
                      onClick={e => handleAnchorClick(e, link.href)}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.href} className="text-sm text-white/50 hover:text-white transition-colors duration-150">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-white/30 tracking-widest uppercase mb-5">Legal</p>
            <ul className="flex flex-col gap-3">
              <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors duration-150">Términos de uso</a></li>
              <li><a href="#" className="text-sm text-white/50 hover:text-white transition-colors duration-150">Privacidad</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">© 2026 Tutory. Todos los derechos reservados.</p>
          <p className="text-xs text-white/20">Hecho con ♥ para profesores de inglés</p>
        </div>
      </div>
    </footer>
  )
}

// ─── LandingPage root ───────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white">
      <Navbar />
      <Hero />
      <SectionMetodoCFI />
      <SectionCalculadoraMetas />
      <SectionProblema />
      <SectionComoFunciona />
      <SectionFuncionalidades />
      <SectionParaQuien />
      <SectionTestimonios />
      <SectionMetricas />
      <SectionClaseDePrueba />
      <SectionPrecios />
      <SectionCTAFinal />
      <Footer />
    </div>
  )
}
