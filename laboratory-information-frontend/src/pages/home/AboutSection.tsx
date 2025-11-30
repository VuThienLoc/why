import Button from '../../components/common/button';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { 
  Building2,
  ArrowRight,
  Zap,
  Shield,
  Target,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import type { LoginType } from '../../types/Login.type';
import { useTranslation } from 'react-i18next';
export function AboutSection({ onShowLogin }: LoginType) {
  const { t } = useTranslation();
  const benefits = [
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: t("about.speed"),
      description: t("about.speedDescription")
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: t("about.absoluteSecurity"),
      description: t("about.absoluteSecurityDescription")
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: t("about.highAccuracy"),
      description: t("about.highAccuracyDescription")
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-orange-600" />,
      title: t("about.smartInterface"),
      description: t("about.smartInterfaceDescription")
    }
  ];

  return (
    <section className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 relative">
      {/* Animated gradient background for About Section */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-blue-300 to-sky-500 animate-gradient-move">
        <div className="absolute inset-0 bg-white/30"></div>
      </div> */}
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 rounded-full">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span className="text-xs sm:text-sm text-green-700">Về chúng tôi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-gray-900">
                {t("about.trustedPartner")} <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{t("about.trustedPartnerDescription")}</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                {t("about.trustedPartnerDescription")}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 sm:gap-4">
                  <div className="p-1.5 sm:p-2 bg-gray-50 rounded-lg flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base text-gray-900 mb-1 sm:mb-2">{benefit.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                onClick={onShowLogin}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white w-full sm:w-auto"
              >
                {t("about.button")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

            </div>
          </div>

          <div className="relative mt-8 lg:mt-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1652352568961-143b1ed17746?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3NwaXRhbCUyMGludGVyaW9yfGVufDF8fHx8MTc1OTQ4MzYxNXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Modern hospital interior"
                className="w-full h-64 sm:h-80 md:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
            </div>
            
            {/* Success metrics */}
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 md:-bottom-8 md:-left-8 p-3 sm:p-4 md:p-6 bg-white rounded-xl shadow-xl border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="p-2 sm:p-2.5 md:p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-600" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl text-gray-900">500+</div>
                  <div className="text-xs sm:text-sm text-gray-600 max-w-[120px] sm:max-w-none">{t("about.trustedPartnerMetricsDescription")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}