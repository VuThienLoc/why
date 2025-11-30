import type { LoginAndRegisterType } from '../types/Login.type'; 
import { useEffect } from 'react';
import {
  HeroSection,
  FeaturesSection,
  AboutSection,
  ServicesSection,
  FAQSection,
  ContactSection,
  Footer,
  HomeHeader,
} from '../pages/home';



export function HomeLayout({ onShowLogin, onShowRegister }: LoginAndRegisterType) {

  useEffect(() => {
    const elements = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.add('opacity-100', 'translate-y-0');
            el.classList.remove('opacity-0', 'translate-y-8');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.05 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-200 via-teal-300 to-blue-600 animate-gradient-move">
        <div className="absolute inset-0 bg-white/30"></div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-300/10 to-sky-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-400/5 to-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">

        <div className="fixed top-0 w-full z-50 bg-transparent transition-all duration-300">
          <HomeHeader onShowLogin={onShowLogin} onShowRegister={onShowRegister} />
        </div>

        <div className="pt-0 xs:pt-0" data-aos="fade-down">
          <HeroSection />
        </div>
        <div  data-aos="fade-down" >
          <FeaturesSection />
        </div>
        <div  data-aos="fade-down" >
          <AboutSection onShowLogin={onShowLogin} />
        </div>
        <div  data-aos="fade-down">
          <ServicesSection />
        </div>
        <div  data-aos="fade-down">
          <FAQSection />
        </div>
        <div  data-aos="fade-down">
          <ContactSection />
        </div>
        <div data-aos="fade-down">
          <Footer />
        </div>
      </div>

    </div>
  );
}


