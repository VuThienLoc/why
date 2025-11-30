import { RegisterInputField } from './RegisterInputField';
import type { PersonalInfoFieldsProps } from './types/register';
import { useTranslation } from 'react-i18next';

export function PersonalInfoFields({ fullName, setFullName, email, setEmail, password, confirmPassword, setConfirmPassword, passwordError, handlePasswordChange }: PersonalInfoFieldsProps) {
    const { t } = useTranslation();
    return (
        <div className="space-y-3">
            <RegisterInputField
                id="fullName"
                label={t('register.fullName')}
                type="text"
                placeholder={t('register.fullNamePlaceholder')}
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                icon="user"
                required
            />
            <RegisterInputField
                id="email"
                label={t('register.email')}
                type="email"
                placeholder={t('register.emailPlaceholder')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                icon="mail"
                required
            />
            <div className="space-y-1">
                <RegisterInputField
                    id="password"
                    label={t('register.password')}
                    type="password"
                    placeholder={t('register.passwordPlaceholder')}
                    value={password}
                    onChange={handlePasswordChange}
                    icon="lock"
                    required
                />
                {passwordError && (
                    <p className="text-xs text-red-500">{passwordError}</p>
                )}
            </div>
            <RegisterInputField
                id="confirmPassword"
                label={t('register.confirmPassword')}
                type="password"
                placeholder={t('register.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                icon="lock"
                required
            />
        </div>
    );
}
