export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  identifyNumber: string;

  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;  
  age: number;
  address: string;

  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };

  avatar?: string;

  medicalHistory: string[];
  allergies: string[];

  bloodType: string; 

  status: 'active' | 'inactive';

  createdAt: string;
  updatedAt: string;
  lastVisit: string;
}
