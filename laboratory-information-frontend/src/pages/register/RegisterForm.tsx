import React, { useState } from 'react';
import Button from '../../components/common/button';
import { RegisterHeader } from './RegisterHeader';
import { PersonalInfoFields } from './PersonalInfoFields';
import { AdditionalInfoFields } from './AdditionalInfoFields';
import { FooterActions } from './FooterActions';
import type { RegisterFormProps } from './types/register';
import { isValidEmail, isValidPhone, validatePassword } from './types/validators';
import { registerUser } from '../../service/authService/registerAPI';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
export function RegisterForm({ onBackToLogin, onBackToHome }: RegisterFormProps) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!fullName || !email || !password || !confirmPassword || !idNumber || !gender || !dob) {
      toast.error(t('register.requiredFields'));
      setIsLoading(false);
      return;
    }
    if (!isValidEmail(email)) {
      toast.error(t('register.invalidEmail'));
      setIsLoading(false);
      return;
    }
    if (passwordError) {
      toast.error(passwordError);
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t('register.passwordMismatch'));
      setIsLoading(false);
      return;
    }
    if (phone && !isValidPhone(phone)) {
      toast.error(t('register.invalidPhone'));
      setIsLoading(false);
      return;
    }

    // Calculate age from date of birth
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const calculatedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 
      : age;

    try {
      const registerData = {
        email,
        fullName,
        identityNumber: idNumber,
        gender: gender as 'Male' | 'Female' | 'Other' || '',
        age: calculatedAge,
        dateOfBirth: dob,
        password,
        phoneNumber: phone || '',
        address: address || '',
      };

      const result = await registerUser(registerData);

      if (result.success) {
        toast.success(result.message);
        // Clear form
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setPhone('');
        setGender('');
        setDob('');
        setIdNumber('');
        setAddress('');
        setPasswordError('');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(t('register.registrationError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 pt-6 pb-3 text-center">
          <RegisterHeader />
        </div>
        <div className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <PersonalInfoFields
              fullName={fullName} setFullName={setFullName}
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              passwordError={passwordError} handlePasswordChange={handlePasswordChange}
            />
            <AdditionalInfoFields
              phone={phone} setPhone={setPhone}
              gender={gender as 'Male' | 'Female' | 'Other'} setGender={setGender}
              dob={dob} setDob={setDob}
              idNumber={idNumber} setIdNumber={setIdNumber}
              address={address} setAddress={setAddress}
            />
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLoading ? t('register.registering') : t('register.register')}
              </Button>
            </div>
            <FooterActions onBackToLogin={onBackToLogin} onBackToHome={onBackToHome} />
          </form>
        </div>
      </div>
    </div>
  );
}
