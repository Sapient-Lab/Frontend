import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ToastProvider } from '@/components/ui/toast';
import HeroSection from './components/HeroSection';
import CapabilitiesSection from './components/CapabilitiesSection';
import MetricsSection from './components/MetricsSection';
import ImpactSection from './components/ImpactSection';
import AIDemo from './components/AIDemo';
import SapientFooter from './components/SapientFooter';
import SapientHeader from './components/SapientHeader';
import InteractiveUseCases from './components/InteractiveUseCases';
import TrustSignals from './components/TrustSignals';
function App() {
  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
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
      </ToastProvider>
    </TooltipProvider>
  );
}

export default App;