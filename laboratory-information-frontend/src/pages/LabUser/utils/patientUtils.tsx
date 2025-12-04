import type { Patient } from '../types/Patient';

export const filterPatients = (
  patients: Patient[],
  searchTerm: string,
  genderFilter: string
): Patient[] => {
  let filtered = patients;

  if (searchTerm) {
    filtered = filtered.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
    );
  }

  if (genderFilter !== 'All') {
    filtered = filtered.filter(patient => patient.gender === genderFilter);
  }

  return filtered;
};

