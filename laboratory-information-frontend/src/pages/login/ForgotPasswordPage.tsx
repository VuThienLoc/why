import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TestTube, Mail, ArrowLeft } from "lucide-react";
import Button from "../../components/common/button";
import { Input } from "../../components/common/input";
import { Label } from "../../components/common/label";
import { Alert, AlertDescription } from "../../components/common/alert";
import { BubbleBackground } from "@/components/common/bubble-background";
import { requestPasswordReset } from "../../service/authService/forgotPasswordApi";
import { useTranslation } from "react-i18next";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError(t("forgotPassword.emailRequired"));
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("forgotPassword.invalidEmail"));
      return;
    }

    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      // Navigate to success page
      navigate("/forgot-password/success", { state: { email } });
    } catch (err) {
      let message = err instanceof Error ? err.message : t("forgotPassword.error");
      
      // Map backend error messages to frontend translations
      if (message.includes("doesn't exist") || message.includes("does not exist")) {
        message = t("forgotPassword.emailNotRegistered");
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

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
              <h1 className="text-4xl font-bold mb-4">{t("forgotPassword.title")}</h1>
              <h2 className="text-2xl font-semibold text-blue-100">{t("forgotPassword.subtitle")}</h2>
            </div>
            
            <div className="space-y-4 text-left max-w-md">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-blue-100">{t("forgotPassword.step1")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-blue-100">{t("forgotPassword.step2")}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-blue-100">{t("forgotPassword.step3")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md mx-auto px-8 py-12">
          <div className="w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t("forgotPassword.heading")}
              </h1>
              <p className="text-gray-600 text-sm">
                {t("forgotPassword.description")}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("forgotPassword.emailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("forgotPassword.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg active:scale-95 transform transition-all duration-150 hover:from-blue-700 hover:to-indigo-700 focus:from-blue-700 focus:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
                disabled={isLoading}
              >
                {isLoading ? t("forgotPassword.sending") : t("forgotPassword.sendResetLink")}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("forgotPassword.backToLogin")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
