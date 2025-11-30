import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "../../components/common/alert";
import Button from "../../components/common/button";
import { TestTube } from 'lucide-react';
import { authenticateUser } from "../../service/authService/loginApi";
import type { LoginFormProps } from "../../types/Login.type";
import { LoginInputField } from "./LoginFormInputField";
import { GoogleLoginButton } from "../../components/common/GoogleLoginButton";
import { useTranslation } from "react-i18next";
export function LoginForm({ onLogin, onShowRegister, onBackToHome }: LoginFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const user = await authenticateUser(identifier, password);
    if (user) onLogin(user);
    else setError("Sai thông tin đăng nhập");
  };

  return (
    <div className="w-full">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <TestTube className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t("login.welcome")}
        </h1>
        <p className="text-gray-600 text-sm">
          {t("login.description")}
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <LoginInputField
          id="identifier"
          label={t("login.email/phone")}
          placeholder={t("login.email/phonePlaceholder")}
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          icon="mail"
        />
        <LoginInputField
          id="password"
          label={t("login.password")}
          placeholder={t("login.passwordPlaceholder")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon="lock"
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg active:scale-95 transform transition-all duration-150 hover:from-blue-700 hover:to-indigo-700 focus:from-blue-700 focus:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
        >
          {t("login.login")}
        </Button>

      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{t("login.or")}</span>
        </div>
      </div>

      {/* Google Login */}
      <GoogleLoginButton />

      {/* Footer Links */}
      <div className="text-center space-y-3 mt-6">
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {t("login.forgotPassword")}
        </button>

        <div className="text-sm text-gray-600">
          {t("login.noAccount")}
          <button
            type="button"
            onClick={onShowRegister}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            {t("login.registerNow")}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onBackToHome?.()}
          className="text-sm text-gray-500 hover:text-gray-700 hover:underline flex items-center justify-center gap-1 mx-auto"
        >
          ← {t("login.backToHome")}
        </button>
      </div>
    </div>
  );
}
