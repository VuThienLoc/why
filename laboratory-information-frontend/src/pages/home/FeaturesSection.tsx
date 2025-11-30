import { Card, CardContent } from '../../components/common/card'
import { 
  TestTube2,
  Users,
  BarChart3,
  Database,
  Shield,
  Settings
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
export function FeaturesSection() {
  const { t } = useTranslation();
  const features = [
    {
      icon: <TestTube2 className="h-8 w-8 text-blue-600" />,
      title: t("features.sampleManagement"),
      description: t("features.sampleManagementDescription")
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: t("features.patientManagement"),
      description: t("features.patientManagementDescription")
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: t("features.reportAnalysis"),
      description: t("features.reportAnalysisDescription")
    },
    {
      icon: <Database className="h-8 w-8 text-orange-600" />,
      title: t("features.inventoryManagement"),
      description: t("features.inventoryManagementDescription")
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: t("features.securityManagement"),
      description: t("features.securityManagementDescription")
    },
    {
      icon: <Settings className="h-8 w-8 text-indigo-600" />,
      title: t("features.automationManagement"),
      description: t("features.automationManagementDescription")
    }
  ];

  return (
    <section className="px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-white/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl text-gray-900 mb-3 sm:mb-4 px-4">
            {t("features.highlightedFeatures")}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            {t("features.highlightedFeaturesDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
