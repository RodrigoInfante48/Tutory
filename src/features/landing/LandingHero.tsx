import { motion, type Variants } from 'framer-motion'
import { Link } from 'react-router-dom'

// Stagger container — children animate in sequence
const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
}

// Mock dashboard card shown in the hero right column
function DashboardMockup() {
  return (
    <motion.div
      variants={fadeUp}
      className="relative w-full max-w-[420px] mx-auto"
    >
      {/* Glow behind card */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl blur-3xl opacity-20"
        style={{ background: 'radial-gradient(circle, #86ef86 0%, transparent 70%)' }}
      />

      {/* Main card */}
      <div className="relative rounded-2xl border border-white/10 bg-[#111312] overflow-hidden shadow-2xl">
        {/* Card header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/5">
          <p className="text-[11px] text-white/40 uppercase tracking-widest mb-1">Mis estudiantes</p>
          <div className="flex items-center justify-between">
            <p className="text-white font-heading font-semibold text-sm">Hoy — miércoles 7 may</p>
            <span className="text-[11px] text-[#86ef86] bg-[#86ef86]/10 px-2 py-0.5 rounded-full">3 clases</span>
          </div>
        </div>

        {/* Student rows */}
        <div className="divide-y divide-white/5">
          {[
            { name: 'Valentina Ríos', level: 'B1 Intermediate', time: '9:00 AM', done: true },
            { name: 'Carlos Méndez', level: 'A2 Elementary', time: '11:30 AM', done: false },
            { name: 'Sara Gómez', level: 'B2 Upper-Int.', time: '3:00 PM', done: false },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-3 px-5 py-3">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-[#86ef86]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#86ef86] text-xs font-semibold">{s.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{s.name}</p>
                <p className="text-white/40 text-xs">{s.level}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-xs font-medium ${s.done ? 'text-white/30 line-through' : 'text-white/70'}`}>
                  {s.time}
                </p>
                {!s.done && (
                  <span className="text-[10px] text-[#86ef86]">● Zoom</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stats strip */}
        <div className="grid grid-cols-3 divide-x divide-white/5 border-t border-white/5">
          {[
            { label: 'Tareas', value: '4', sub: 'pendientes' },
            { label: 'Quizzes', value: '2', sub: 'esta semana' },
            { label: 'Progreso', value: '78%', sub: 'promedio' },
          ].map((stat) => (
            <div key={stat.label} className="px-4 py-3 text-center">
              <p className="text-white font-heading font-bold text-base">{stat.value}</p>
              <p className="text-white/35 text-[10px]">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating alert badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.4, ease: 'backOut' }}
        className="absolute -bottom-4 -left-4 bg-[#111312] border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl"
      >
        <span className="w-2 h-2 rounded-full bg-[#86ef86] animate-pulse" />
        <span className="text-white text-xs font-medium">Tarea entregada</span>
      </motion.div>

      {/* Floating score badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.4, ease: 'backOut' }}
        className="absolute -top-4 -right-4 bg-[#111312] border border-white/10 rounded-xl px-3 py-2 shadow-xl"
      >
        <p className="text-[10px] text-white/40">Quiz score</p>
        <p className="text-[#86ef86] font-heading font-bold text-sm">9 / 10</p>
      </motion.div>
    </motion.div>
  )
}

export default function LandingHero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      {/* Background radial gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(134,239,134,0.08) 0%, transparent 70%)',
        }}
      />
      {/* Subtle grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-[1280px] mx-auto px-6 md:px-10 pt-28 pb-20 w-full">
        <div className="grid md:grid-cols-[1fr_auto] gap-16 items-center">
          {/* Left: text content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-[600px]"
          >
            {/* Badge */}
            <motion.div variants={fadeIn} className="mb-6">
              <span className="inline-flex items-center gap-2 text-xs text-white/50 border border-white/10 rounded-full px-3 py-1.5">
                <span className="text-[#86ef86]">✦</span>
                Diseñado para profesores de inglés
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-[0.95] text-white mb-6"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              El espacio de trabajo de los mejores{' '}
              <span className="text-[#86ef86]">profesores de inglés</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-white/55 text-lg leading-relaxed max-w-[520px] mb-10"
            >
              Gestiona tus estudiantes, clases, tareas y quizzes en un solo lugar.
              Diseñado para tutores que se toman en serio su oficio.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0a0a0a] bg-[#86ef86] hover:bg-[#9ff89f] px-6 py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Crear cuenta gratis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <button
                onClick={() => document.querySelector('#como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/25 px-6 py-3 rounded-lg transition-all duration-200"
              >
                Ver cómo funciona
              </button>
            </motion.div>

            {/* Social proof micro */}
            <motion.p variants={fadeUp} className="mt-8 text-xs text-white/30">
              Más de{' '}
              <span className="text-white/60 font-medium">200 profesores</span>{' '}
              ya organizaron su enseñanza con Tutory
            </motion.p>
          </motion.div>

          {/* Right: mockup */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="hidden md:block w-[400px] lg:w-[420px]"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 inset-x-0 h-32"
        style={{ background: 'linear-gradient(to bottom, transparent, #0a0a0a)' }}
      />
    </section>
  )
}
