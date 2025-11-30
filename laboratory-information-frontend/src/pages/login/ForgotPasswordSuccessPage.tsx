import { useNavigate, useLocation } from "react-router-dom";
import { TestTube, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import Button from "../../components/common/button";
import { BubbleBackground } from "@/components/common/bubble-background";
import { useTranslation } from "react-i18next";

export const ForgotPasswordSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const email = location.state?.email || "";

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Bubble Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <BubbleBackground className="absolute inset-0" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center space-y-8">
            <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <TestTube className="w-12 h-12 text-white" />
            </div>
            
            <div>
              <h1 className="text-4xl font-bold mb-4">{t("forgotPasswordSuccess.title")}</h1>
              <h2 className="text-2xl font-semibold text-blue-100">{t("forgotPasswordSuccess.subtitle")}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Success Message */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md mx-auto px-8 py-12">
          <div className="w-full">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t("forgotPasswordSuccess.heading")}
              </h1>
              <p className="text-gray-600 text-sm mb-6">
                {t("forgotPasswordSuccess.description")}
              </p>

              {/* Email Display */}
              {email && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-blue-700">
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">{email}</span>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="text-left bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-3 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {t("forgotPasswordSuccess.nextSteps")}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">1.</span>
                    <span>{t("forgotPasswordSuccess.step1")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">2.</span>
                    <span>{t("forgotPasswordSuccess.step2")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">3.</span>
                    <span>{t("forgotPasswordSuccess.step3")}</span>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="text-sm text-gray-500 mb-6">
                <p>{t("forgotPasswordSuccess.note")}</p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg active:scale-95 transform transition-all duration-150 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
                >
                  {t("forgotPasswordSuccess.backToLogin")}
                </Button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 hover:underline flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("forgotPasswordSuccess.backToHome")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
