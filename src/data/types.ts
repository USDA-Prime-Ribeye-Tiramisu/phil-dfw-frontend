export interface Point {
  latitude: number
  longitude: number
}

export interface Zone {
  center? : Point
  radius? : number
  totalPopulation: number
  medianIncome: number
  composition?: Tract[]
}

export interface Tract {
  id : string
  geojson : string
}

const _interpolationStrategy = {
  "CENTROID" : 1,
  "AREAL_PROPORTION" : 2
} as const 

export type InterpolationStrategy = keyof typeof _interpolationStrategy

export function getIdFromInterpolationStrategy(is : InterpolationStrategy) : number {
  return _interpolationStrategy[is]
}
