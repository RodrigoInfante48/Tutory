import { useState, useEffect, useRef, RefObject } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView, useMotionValue, animate } from 'framer-motion'

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
              Iniciar sesión
            </Link>
            <Link
              to="/login"
              className="text-sm px-4 py-2 rounded-md bg-[#86ef86] text-[#0a0a0a] font-medium hover:bg-[#9ef89e] transition-all duration-200 hover:scale-[1.02]"
            >
              Empieza gratis
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
                  Iniciar sesión
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center text-sm px-4 py-2.5 rounded-md bg-[#86ef86] text-[#0a0a0a] font-medium hover:bg-[#9ef89e] transition-all duration-200"
                >
                  Empieza gratis
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Dashboard mockup card ──────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-sm mx-auto lg:mx-0"
    >
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-2xl bg-[#86ef86]/10 blur-2xl -z-10 scale-110" />

      {/* Card shell */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm overflow-hidden">
        {/* Header bar */}
        <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#86ef86]" />
            <span className="text-xs font-heading font-semibold text-white/80 tracking-wide">
              Mis estudiantes
            </span>
          </div>
          <span className="text-[10px] text-white/30">hoy · 9:41 AM</span>
        </div>

        {/* Student rows */}
        <div className="divide-y divide-white/[0.05]">
          {[
            { name: 'Camila Torres', plan: 'B2 Upper-Int.', nextClass: 'Hoy 3:00 PM', pending: 1 },
            { name: 'Andrés López', plan: 'A2 Elementary', nextClass: 'Mañana 10:00 AM', pending: 0 },
            { name: 'María Jiménez', plan: 'B1 Intermediate', nextClass: 'Jue 4:30 PM', pending: 2 },
          ].map(student => (
            <div key={student.name} className="px-5 py-3.5 flex items-center gap-3">
              {/* Avatar placeholder */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#86ef86]/30 to-[#166534]/40 flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-[#86ef86]">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{student.name}</p>
                <p className="text-[10px] text-white/40 truncate">{student.plan}</p>
              </div>

              {/* Right side */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[10px] text-white/40">{student.nextClass}</span>
                {student.pending > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#86ef86]/15 text-[#86ef86] font-medium">
                    {student.pending} tarea{student.pending > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#86ef86] animate-pulse" />
            <span className="text-[10px] text-white/40">3 estudiantes activos</span>
          </div>
          <button className="text-[10px] text-[#86ef86]/70 hover:text-[#86ef86] transition-colors duration-150">
            Ver todos →
          </button>
        </div>
      </div>

      {/* Floating task badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -right-4 top-16 bg-[#0f0f0f] border border-white/10 rounded-xl px-3 py-2 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <div>
            <p className="text-[10px] font-medium text-white">Tarea pendiente</p>
            <p className="text-[10px] text-white/40">Essay · Camila</p>
          </div>
        </div>
      </motion.div>

      {/* Floating next-class badge */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -left-4 bottom-16 bg-[#0f0f0f] border border-white/10 rounded-xl px-3 py-2 shadow-xl"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <div>
            <p className="text-[10px] font-medium text-white">Próxima clase</p>
            <p className="text-[10px] text-[#86ef86]">Hoy · 3:00 PM</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Hero ───────────────────────────────────────────────────────────────────

const HEADLINE = 'El espacio de trabajo de los mejores profesores de inglés'

function Hero() {
  const words = HEADLINE.split(' ')

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
              Diseñado para profesores de inglés
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
            Gestiona tus estudiantes, clases, tareas y quizzes en un solo lugar.
            Diseñado para tutores que se toman en serio su oficio.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#86ef86] text-[#0a0a0a] text-sm font-semibold hover:bg-[#9ef89e] transition-all duration-200 hover:scale-[1.02]"
            >
              Crear cuenta gratis
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/25 transition-all duration-200 hover:scale-[1.02]"
            >
              Ver demo →
            </Link>
          </motion.div>
        </div>

        {/* ── Right: mockup ── */}
        <div className="hidden lg:flex items-center justify-end">
          <DashboardMockup />
        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
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
    title: 'Agrega tus estudiantes',
    description: 'Crea el perfil de cada estudiante, asígnales su plan de estudios y ten toda su info en un solo lugar desde el primer día.',
    Mockup: MockupStudentCard,
  },
  {
    number: '02',
    title: 'Gestiona clases y tareas',
    description: 'Programa sesiones, asigna tareas con fecha límite y recibe las entregas directamente en la plataforma. Sin WhatsApp.',
    Mockup: MockupTaskList,
  },
  {
    number: '03',
    title: 'Sigue el progreso en tiempo real',
    description: 'Visualiza el avance de cada estudiante, sus scores en quizzes y el porcentaje del plan completado en un vistazo.',
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
            Tres pasos para tener<br />todo bajo control
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
  'Un solo lugar para todos tus estudiantes',
  'Crea y asigna tareas en segundos',
  'Quizzes automáticos con resultados al instante',
  'Historial completo de cada clase',
  'Materiales organizados por estudiante',
  'Chat directo sin salir de la plataforma',
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
                <p className="text-sm text-white/40">Control total del proceso</p>
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
          className="mt-20 text-center"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#86ef86] text-[#0a0a0a] text-sm font-semibold hover:bg-[#9ef89e] transition-all duration-200 hover:scale-[1.02]"
          >
            Empieza gratis hoy
          </Link>
          <p className="text-xs text-white/30 mt-3">Sin tarjeta de crédito · Sin compromisos</p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Section: Testimonios ────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: 'Carolina Ramírez',
    role: 'Profesora de inglés, Bogotá',
    initials: 'CR',
    text: 'Antes tenía WhatsApp, Sheets y Notion abiertos al mismo tiempo. Ahora entro a Tutory y en 30 segundos sé qué le toca a cada estudiante. Cambió mi día a día.',
  },
  {
    name: 'Sebastián Morales',
    role: 'Tutor independiente, Medellín',
    initials: 'SM',
    text: 'Lo que más me cambió fue el seguimiento de clases. Sé exactamente cuántas tomó cada estudiante y qué le falta en el ciclo. Sin Excel, sin notas en el cuaderno.',
  },
  {
    name: 'Valentina Ospina',
    role: 'Docente particular, Cali',
    initials: 'VO',
    text: 'Mis estudiantes entregan tareas desde el portal y yo les doy feedback ahí mismo. Se acabó el "te mando el audio por WhatsApp" y el caos de los chats.',
  },
  {
    name: 'Andrés Felipe Ruiz',
    role: 'Profesor de inglés, Bucaramanga',
    initials: 'AF',
    text: 'Los quizzes automáticos me ahorran horas cada semana. Los creo una vez y el sistema se los muestra a cada estudiante. Los resultados llegan al instante.',
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
          Profesores que ya dejaron<br />el caos atrás
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
  { target: 200,  suffix: '+', label: 'profesores activos' },
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

// ─── Section: Precios ────────────────────────────────────────────────────────

const FREE_FEATURES = [
  'Hasta 5 estudiantes activos',
  'Plan de estudios básico',
  'Tareas y entregas',
  'Historial de clases',
  'Chat interno con estudiantes',
  'Acceso desde cualquier dispositivo',
]

const PRO_FEATURES = [
  'Estudiantes ilimitados',
  'Quizzes automáticos ilimitados',
  'Recursos por estudiante',
  'Reportes de progreso avanzados',
  'Grupos y clases grupales',
  'Soporte prioritario',
]

function CheckIcon() {
  return (
    <span className="w-4 h-4 rounded-full bg-[#86ef86]/15 border border-[#86ef86]/30 flex items-center justify-center flex-shrink-0">
      <span className="text-[8px] text-[#86ef86] font-bold">✓</span>
    </span>
  )
}

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
            Precios
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-4xl md:text-5xl font-bold tracking-tighter text-white leading-tight"
          >
            Empieza gratis.<br />Escala cuando quieras.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 flex flex-col"
          >
            <div className="mb-8">
              <h3 className="font-heading text-xl font-bold text-white mb-3">Gratis</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-heading text-5xl font-black text-white">$0</span>
                <span className="text-white/40 text-sm">/ siempre</span>
              </div>
              <p className="text-sm text-white/50">Todo lo esencial para empezar a organizar tu enseñanza.</p>
            </div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-white/65">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/login"
              className="block text-center px-6 py-3 rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
            >
              Crear cuenta gratis
            </Link>
          </motion.div>

          {/* Pro card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="group relative rounded-2xl border border-[#86ef86]/30 bg-[#86ef86]/[0.03] p-8 flex flex-col transition-all duration-300 hover:border-[#86ef86]/50 hover:shadow-[0_0_40px_rgba(134,239,134,0.12)]"
          >
            <div className="absolute top-4 right-4">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#86ef86]/15 border border-[#86ef86]/30 text-[#86ef86] font-medium">
                Próximamente
              </span>
            </div>
            <div className="mb-8">
              <h3 className="font-heading text-xl font-bold text-white mb-3">Pro</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-heading text-2xl font-black text-[#86ef86]">Precio especial</span>
              </div>
              <p className="text-sm text-white/50">Para early adopters. Regístrate y te avisamos primero.</p>
            </div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-sm text-white/65">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/login"
              className="block text-center px-6 py-3 rounded-lg bg-[#86ef86] text-[#0a0a0a] text-sm font-semibold hover:bg-[#9ef89e] transition-all duration-200 hover:scale-[1.02]"
            >
              Unirme a la lista de espera
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Section: CTA Final ──────────────────────────────────────────────────────

function SectionCTAFinal() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref as RefObject<Element>, { once: true, margin: '-80px' })
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [showToast, setShowToast] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Por favor ingresa un email válido')
      return
    }
    setEmailError('')
    setShowToast(true)
    setEmail('')
    const t = setTimeout(() => setShowToast(false), 4000)
    return () => clearTimeout(t)
  }

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
          Tu próxima clase merece<br />una mejor herramienta
        </h2>
        <p className="text-base md:text-lg text-white/50 leading-relaxed mb-12 max-w-xl mx-auto">
          Únete a los profesores que ya organizaron su enseñanza con Tutory.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError('') }}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/[0.12] text-white placeholder:text-white/30 text-sm outline-none focus:border-[#86ef86]/50 focus:bg-white/[0.08] transition-all duration-200"
            />
            {emailError && (
              <p className="text-xs text-red-400 mt-1.5 text-left">{emailError}</p>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-[#86ef86] text-[#0a0a0a] text-sm font-semibold hover:bg-[#9ef89e] transition-all duration-200 hover:scale-[1.02] whitespace-nowrap"
          >
            Comenzar ahora
          </button>
        </form>

        <p className="text-xs text-white/25 mt-4">Sin tarjeta de crédito · Sin compromisos</p>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#0f1a0f] border border-[#86ef86]/30 shadow-2xl"
          >
            <span className="w-5 h-5 rounded-full bg-[#86ef86]/20 border border-[#86ef86]/40 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] text-[#86ef86] font-bold">✓</span>
            </span>
            <p className="text-sm text-white font-medium">¡Te avisaremos pronto!</p>
          </motion.div>
        )}
      </AnimatePresence>
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
      <SectionProblema />
      <SectionComoFunciona />
      <SectionFuncionalidades />
      <SectionParaQuien />
      <SectionTestimonios />
      <SectionMetricas />
      <SectionPrecios />
      <SectionCTAFinal />
      <Footer />
    </div>
  )
}
