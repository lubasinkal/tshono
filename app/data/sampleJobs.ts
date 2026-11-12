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

export { SECTORS, LOCATIONS } from '~~/shared/constants'
