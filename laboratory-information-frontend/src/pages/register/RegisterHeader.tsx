import { CardTitle, CardDescription } from '../../components/common/card';
import { TestTube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
export function RegisterHeader() {
	const { t } = useTranslation();
	return (
		<>
			<div className="flex justify-center mb-4">
				<div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
					<TestTube className="w-8 h-8 text-white" />
				</div>
			</div>

			<CardTitle className="text-2xl text-gray-900 mb-1 leading-tight">
				{t('register.registerAccount')} <br />
				<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
					{t('register.subtitle')}
				</span>
			</CardTitle>
			<CardDescription className="text-sm text-gray-600 max-w-sm mx-auto">
				{t('register.createAccount')}
			</CardDescription>
		</>
	);
}


