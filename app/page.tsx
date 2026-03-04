import { MessageCircle } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsBar from '@/components/landing/StatsBar';
import WhyIANSection from '@/components/landing/WhyIANSection';
import ServicesSection from '@/components/landing/ServicesSection';
import PaquetesSection from '@/components/landing/PaquetesSection';
import TestimoniosSection from '@/components/landing/TestimoniosSection';
import FAQSection from '@/components/landing/FAQSection';
import CTAFinalSection from '@/components/landing/CTAFinalSection';
import Footer from '@/components/landing/Footer';

const WA_URL =
  'https://wa.me/5255780724264?text=Hola%2C%20me%20interesa%20inscribir%20a%20mi%20hijo%20en%20Grupo%20IAN';

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
        <TestimoniosSection />
        <FAQSection />
        <CTAFinalSection />
      </main>
      <Footer />

      {/* Floating WhatsApp button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group">
        {/* Tooltip */}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-ian-dark text-white text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap pointer-events-none">
          ¡Escríbenos!
        </span>
        <a
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="bg-[#25D366] text-white rounded-full w-14 h-14 flex items-center justify-center hover:scale-110 transition-transform duration-300 animate-pulse-whatsapp"
          style={{ boxShadow: '0 8px 32px rgba(37, 211, 102, 0.4)' }}
        >
          <MessageCircle className="w-7 h-7" aria-hidden="true" />
        </a>
      </div>
    </>
  );
}
