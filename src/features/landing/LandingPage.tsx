import LandingNavbar from './LandingNavbar'
import LandingHero from './LandingHero'

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#0a0a0a] text-white">
      <LandingNavbar />
      <main>
        <LandingHero />
        {/* LP-2: Problema, ComoFunciona, Features, ParaQuien */}
        {/* LP-3: Testimonios, Metricas, Precios, CTAFinal, Footer */}
      </main>
    </div>
  )
}
