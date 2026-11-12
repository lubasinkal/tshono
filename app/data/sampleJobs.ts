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
  occupation?: string
  employmentType?: string
  vacancies?: number
  workMode?: string
  educationLevel?: string
  salaryMin?: number
  salaryMax?: number
  salaryPeriod?: string
  district?: string
  applyInstructions?: string
}

export { SECTORS, LOCATIONS } from '~~/shared/constants'
