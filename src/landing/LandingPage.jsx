import './landing.css'
import SapientHeader from './components/SapientHeader'
import HeroSection from './components/HeroSection'
import CapabilitiesSection from './components/CapabilitiesSection'
import SapientFooter from './components/SapientFooter'

function LandingPage() {
  return (
    <div className="landing-shell min-h-screen">
      <SapientHeader />
      <main className="space-y-0">
        <HeroSection />
        <CapabilitiesSection />
      </main>
      <SapientFooter />
    </div>
  )
}

export default LandingPage