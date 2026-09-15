export interface SampleJob {
  id: string
  title: string
  company: string
  sector: string
  location: string
  posted: string
  closing: string
  minYears: number
  blurb: string
  url: string
}

export const SECTORS = [
  'Finance',
  'Education',
  'Engineering',
  'Mining',
  'Security',
  'Healthcare',
  'Technology',
  'Marketing',
  'Retail',
  'Maintenance',
  'Human Resources',
  'Construction',
  'Administration',
  'Science',
  'Logistics',
  'Hospitality',
  'Legal',
  'Agriculture',
  'Manufacturing',
  'Government',
  'NGO',
  'General',
] as const

export const LOCATIONS = [
  'Gaborone',
  'Francistown',
  'Maun',
  'Jwaneng',
  'Letlhakane',
  'Palapye',
  'Kasane',
  'Serowe',
  'Ramotswa',
  'Ghanzi',
  'Molepolole',
  'Mogoditshane',
  'Tonota',
  'Mochudi',
  'Remote',
  'Botswana',
] as const


