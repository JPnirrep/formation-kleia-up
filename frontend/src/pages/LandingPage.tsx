import { useEffect } from 'react';
import NavHeader from '@/components/landing/NavHeader';
import HeroSection from '@/components/landing/HeroSection';
import PainMirrorSection from '@/components/landing/PainMirrorSection';
import ManifestSection from '@/components/landing/ManifestSection';
import TransformationSection from '@/components/landing/TransformationSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import UseCasesSection from '@/components/landing/UseCasesSection';
import SocialProofSection from '@/components/landing/SocialProofSection';
import FaqSection from '@/components/landing/FaqSection';
import FinalCTASection from '@/components/landing/FinalCTASection';
import LandingFooter from '@/components/landing/LandingFooter';

export default function LandingPage() {
  useEffect(() => { document.title = 'Kleia-up — Leadership organique'; }, []);
  return (
    <div className="antialiased">
      <NavHeader />
      <main id="main-content">
        <HeroSection />
        <PainMirrorSection />
        <ManifestSection />
        <TransformationSection />
        <FeaturesSection />
        <UseCasesSection />
        <SocialProofSection />
        <FaqSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
