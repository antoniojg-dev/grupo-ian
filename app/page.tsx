import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsBar from '@/components/landing/StatsBar';
import WhyIANSection from '@/components/landing/WhyIANSection';
import ServicesSection from '@/components/landing/ServicesSection';
import PaquetesSection from '@/components/landing/PaquetesSection';
import FAQSection from '@/components/landing/FAQSection';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <WhyIANSection />
        <ServicesSection />
        <PaquetesSection />
        <FAQSection />
      </main>
    </>
  );
}
