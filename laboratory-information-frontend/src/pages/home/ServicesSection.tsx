import { Card, CardContent } from '../../components/common/card'

import { 
  TestTube2,
  Heart,
  Database,
  Eye,
  CheckCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
export function ServicesSection() {
  const { t } = useTranslation();
  const services = [
    {
      icon: <TestTube2 className="h-12 w-12 text-blue-600" />,
      title: t("services.bloodTest"),
      description: t("services.bloodTestDescription"),
      features: [t("services.cbcFull"), t("services.biochemistry12"), t("services.marker"), t("services.hormone")]
    },
    {
      icon: <Heart className="h-12 w-12 text-red-600" />,
      title: t("services.heartTest"),
      description: t("services.heartTestDescription"),
      features: [t("services.troponinIT"), t("services.ckMB"), t("services.bnpNTproBNP"), t("services.lipidProfile")]
    },
    {
      icon: <Database className="h-12 w-12 text-green-600" />,
      title: t("services.virologyTest"),
      description: t("services.virologyTestDescription"),
      features: [t("services.culture"), t("services.antibioticSusceptibility"), t("services.pcrVirus"), t("services.fungalInfection")]
    },
    {
      icon: <Eye className="h-12 w-12 text-purple-600" />,
      title: t("services.histologyTest"),
      description: t("services.histologyTestDescription"),
      features: [t("services.biopsy"), t("services.cellology"), t("services.immunology"), t("services.molecularbiology")]
    }
  ];

  return (
    <section className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl text-gray-900 mb-3 sm:mb-4 px-4">
            {t("services.title")}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            {t("services.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="text-center space-y-4 sm:space-y-6">
                  <div className="flex justify-center">
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      {service.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl text-gray-900 mb-2 sm:mb-3">{service.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{service.description}</p>
                  </div>
                  <div className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start sm:items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span className="text-left">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
