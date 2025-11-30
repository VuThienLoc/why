
import type { FooterActionsProps } from './types/register';
import { useTranslation } from 'react-i18next';
export function FooterActions({ onBackToLogin, onBackToHome }: FooterActionsProps) {
	const { t } = useTranslation();
	return (
		<div className="text-center space-y-1">
			<p className="text-sm text-gray-600">
				{t('register.haveAccount')} {' '}
				<button className="text-blue-600 hover:underline" onClick={onBackToLogin}>{t('register.loginNow')}</button>
			</p>
			{onBackToHome && (
				<div>
					<button type="button" className="text-sm text-gray-700 hover:text-gray-900 hover:underline" onClick={onBackToHome}>
						← {t('register.backToHome')}
					</button>
				</div>
			)}
		</div>
	);
}
