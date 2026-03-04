import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsBar from '@/components/landing/StatsBar';
import WhyIANSection from '@/components/landing/WhyIANSection';
import ServicesSection from '@/components/landing/ServicesSection';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <WhyIANSection />
        <ServicesSection />
      </main>
    </>
  );
}
