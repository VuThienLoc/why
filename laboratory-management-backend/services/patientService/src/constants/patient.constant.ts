export const PATIENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DECEASED: "deceased",
} as const;

export const BLOOD_TYPES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const GENDER_TYPES = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
} as const;
