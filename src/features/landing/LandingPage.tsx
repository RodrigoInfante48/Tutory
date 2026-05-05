import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

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

  function smoothScroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
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
            onClick={() => setMenuOpen(v => !v)}
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

// ─── LandingPage root ───────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white">
      <Navbar />
      <Hero />
    </div>
  )
}
