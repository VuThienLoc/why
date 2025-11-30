
import Button from '../../components/common/button';
import { 
  Microscope,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUp,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  BookOpen,
  GraduationCap,
  Headphones,
  LifeBuoy,
  MessageSquare
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Company Info */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl">
                  <Microscope className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <div className="text-sm sm:text-base text-white">LIMS Pro</div>
                  <div className="text-gray-400 text-xs sm:text-sm">Laboratory Information Management System</div>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                {t("footer.description")}
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {[
                  { icon: Facebook, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Instagram, href: "#" },
                  { icon: Linkedin, href: "#" },
                  { icon: Youtube, href: "#" }
                ].map((social, index) => (
                  <a key={index} href={social.href} className="p-1.5 sm:p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    <social.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Products */}
            <div className="space-y-4 sm:space-y-6">
              <h4 className="text-sm sm:text-base text-white font-medium">{t("footer.products")}</h4>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">LIMS Pro Basic</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LIMS Pro Advanced</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LIMS Pro Enterprise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Add-ons & Modules</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4 sm:space-y-6">
              <h4 className="text-sm sm:text-base text-white font-medium">{t("footer.support")}</h4>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-400">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <a href="#" className="hover:text-white transition-colors">{t("footer.documentation")}</a>
                </li>
                <li className="flex items-center gap-2">
                  <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <a href="#" className="hover:text-white transition-colors">{t("footer.training")}</a>
                </li>
                <li className="flex items-center gap-2">
                  <Headphones className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <a href="#" className="hover:text-white transition-colors">{t("footer.support247")}</a>
                </li>
                <li className="flex items-center gap-2">
                  <LifeBuoy className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <a href="#" className="hover:text-white transition-colors">{t("footer.helpCenter")}</a>
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <a href="#" className="hover:text-white transition-colors">{t("footer.community")}</a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4 sm:space-y-6">
              <h4 className="text-sm sm:text-base text-white font-medium">{t("footer.contact")}</h4>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-400">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>1900 1234 ({t("footer.free")})</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="break-all">support@limspro.vn</span>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mt-1 flex-shrink-0" />
                  <span>{t("footer.address")}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>{t("footer.time")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-gray-400 text-xs sm:text-sm text-center md:text-left">
                © 2024 LIMS Pro. Tất cả quyền được bảo lưu. Phiên bản dành cho phòng thí nghiệm đơn lẻ.
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors whitespace-nowrap">Chính sách bảo mật</a>
                <a href="#" className="hover:text-white transition-colors whitespace-nowrap">Điều khoản sử dụng</a>
                <a href="#" className="hover:text-white transition-colors whitespace-nowrap">Cookie Policy</a>
                <a href="#" className="hover:text-white transition-colors whitespace-nowrap">Sitemap</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <Button 
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 p-2 sm:p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-50"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
    </footer>
  );
}
