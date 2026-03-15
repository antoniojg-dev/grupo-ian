import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsBar from '@/components/landing/StatsBar';
import WhyIANSection from '@/components/landing/WhyIANSection';
import KinderSection from '@/components/landing/KinderSection';
import ServicesSection from '@/components/landing/ServicesSection';
import PaquetesSection from '@/components/landing/PaquetesSection';
import TestimoniosSection from '@/components/landing/TestimoniosSection';
import FAQSection from '@/components/landing/FAQSection';
import CTAFinalSection from '@/components/landing/CTAFinalSection';
import Footer from '@/components/landing/Footer';
import FloatingWhatsApp from '@/components/landing/FloatingWhatsApp';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <WhyIANSection />
        <KinderSection />
        <ServicesSection />
        <PaquetesSection />
        <TestimoniosSection />
        <FAQSection />
        <CTAFinalSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
