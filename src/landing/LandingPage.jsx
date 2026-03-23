import './landing.css'
import SapientHeader from './components/SapientHeader'
import HeroSection from './components/HeroSection'
import CapabilitiesSection from './components/CapabilitiesSection'
import MetricsSection from './components/MetricsSection'
import ImpactSection from './components/ImpactSection'
import InteractiveUseCases from './components/InteractiveUseCases'
import SapientFooter from './components/SapientFooter'

function LandingPage() {
  return (
    <div className="landing-shell min-h-screen">
      <SapientHeader />
      <main className="space-y-0">
        <HeroSection />
        <CapabilitiesSection />
        <MetricsSection />
        <ImpactSection />
        <InteractiveUseCases />
      </main>
      <SapientFooter />
    </div>
  )
}

export default LandingPage