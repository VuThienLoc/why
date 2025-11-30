import { RegisterInputField } from './RegisterInputField';
import type { AdditionalInfoFieldsProps } from './types/register';
import { useTranslation } from 'react-i18next';
export function AdditionalInfoFields({ phone, setPhone, gender, setGender, dob, setDob, idNumber, setIdNumber, address, setAddress }: AdditionalInfoFieldsProps) {
    const { t } = useTranslation();
	return (
		<div className="space-y-3">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<RegisterInputField 
					id="phone" 
					label={t('register.phone')} 
					type="tel"
					placeholder="0xxxxxxxxx" 
					value={phone} 
					onChange={e => setPhone(e.target.value)} 
					icon="phone" 
					required={false} 
				/>

				<div className="space-y-2">
					<label className="text-sm font-medium text-gray-700">
						{t('register.gender')}
					</label>
					<select
						className={`h-11 w-full border border-gray-200 rounded-lg px-3 pl-10 focus:outline-none focus:border-blue-400 bg-white transition-colors ${gender ? 'text-gray-900' : 'text-gray-400'}`}
						value={gender}
						onChange={e => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
					>
						<option value="" disabled>{t('register.selectGender')}</option>
						<option value="Male">{t('register.male')}</option>
						<option value="Female">{t('register.female')}</option>
						<option value="Other">{t('register.other')}</option>
					</select>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<RegisterInputField 
					id="dob" 
					label={t('register.dob')} 
					type="date" 
					placeholder="mm/dd/yyyy" 
					value={dob} 
					onChange={e => setDob(e.target.value)} 
					icon="calendar"
					required={false} 
				/>
				<RegisterInputField 
					id="idNumber"
					label={t('register.idNumber')} 
					type="text"
					placeholder={t('register.idNumberPlaceholder')} 
					value={idNumber} 
					onChange={e => setIdNumber(e.target.value)} 
					icon="id" 
					required={false} 
				/>
			</div>

			<RegisterInputField 
				id="address"
				label={t('register.address')} 
				type="text"
				placeholder={t('register.addressPlaceholder')} 
				value={address} 
				onChange={e => setAddress(e.target.value)} 
				icon="address" 
				required={false} 
			/>
		</div>
	);
}
