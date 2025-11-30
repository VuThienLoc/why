import Button from '../../components/common/button';
import { 
  Phone,
  Mail,
  MapPin,
  
} from 'lucide-react';
import { SiFacebook, SiX, SiInstagram, SiLinkedin, SiYoutube } from 'react-icons/si';
import { useTranslation } from 'react-i18next';
export function ContactSection() {
  const { t } = useTranslation();
  return (
    <section className="relative px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl text-gray-900 mb-3 sm:mb-4">
                {t("contact.title")}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600">
                {t("contact.description")}
              </p>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm sm:text-base text-gray-900">Hotline</div>
                  <div className="text-sm sm:text-base text-gray-600">1900 1234 ({t("contact.free")})</div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm sm:text-base text-gray-900">Email</div>
                  <div className="text-sm sm:text-base text-gray-600">support@limspro.vn</div>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm sm:text-base text-gray-900">{t("contact.address")}</div>
                  <div className="text-sm sm:text-base text-gray-600">{t("contact.address1")}</div>
                </div>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-base sm:text-lg text-gray-900">{t("contact.followUs")}</h4>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {[
                  { 
                    Icon: SiFacebook, 
                    color: "text-blue-600",
                    title: "Facebook"
                  },
                  { 
                    Icon: SiX, 
                    color: "text-sky-500",
                    title: "X (Twitter)"
                  },
                  { 
                    Icon: SiInstagram, 
                    color: "text-pink-600",
                    title: "Instagram"
                  },
                  { 
                    Icon: SiLinkedin, 
                    color: "text-blue-700",
                    title: "LinkedIn"
                  },
                  { 
                    Icon: SiYoutube, 
                    color: "text-red-600",
                    title: "YouTube"
                  }
                ].map((social, index) => (
                  <Button key={index} variant="outline" size="sm" className="p-1.5 sm:p-2" title={social.title}>
                    <social.Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${social.color}`} />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}