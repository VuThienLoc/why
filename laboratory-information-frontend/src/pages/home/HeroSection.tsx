
import heroImage from "@/assets/lab-hero.jpg";
import { useTranslation } from "react-i18next";
const HeroSection = () => { 
  const { t } = useTranslation();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-300/40 via-teal-200/20 to-blue-700/40"></div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full animate-float"></div>
      <div className="absolute bottom-40 right-20 w-32 h-32 bg-primary-light/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-10 w-16 h-16 bg-accent/20 rounded-full animate-pulse-soft"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 animate-fade-up">
            {t("hero.title")}
            <span className="block gradient-text text-white">
              {t("hero.subtitle")}
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 animate-fade-up px-4" style={{ animationDelay: '0.2s' }}>
            {t("hero.description")}
          </p>
          
          <div className="mt-8 sm:mt-10 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center animate-fade-up px-2" style={{ animationDelay: '0.6s' }}>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-bold text-white">500+</div>
              <div className="text-xs sm:text-sm md:text-base text-white/80">{t("hero.laboratory")}</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-bold text-white">1M+</div>
              <div className="text-xs sm:text-sm md:text-base text-white/80">{t("hero.test")}</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-bold text-white">99.9%</div>
              <div className="text-xs sm:text-sm md:text-base text-white/80">{t("hero.time")}</div>
            </div>
            <div className="p-2">
              <div className="text-2xl sm:text-3xl font-bold text-white">24/7</div>
              <div className="text-xs sm:text-sm md:text-base text-white/80">{t("hero.support")}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;