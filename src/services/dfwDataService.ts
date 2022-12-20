import { Point, InterpolationStrategy, getIdFromInterpolationStrategy, Zone, Tract } from "../data/types";

const baseUrl = "http://localhost:8080/api"
export const tractsUrl = baseUrl + "/shapes"
export const zoneUrl = (p : Point, radius: number, strategy : InterpolationStrategy) => {
  const params : URLSearchParams = new URLSearchParams({
    "lat": `${p.latitude}`,
    "lng": `${p.longitude}`,
    "rad": `${radius}`,
    "strategyId": `${getIdFromInterpolationStrategy(strategy)}`
  })

  return baseUrl + "/compute?" +params.toString()
} 

export function tractsFetcher() : (url : string) => Promise<Tract[]> {
  return (...args) => fetch(...args).then(x => x.json())

} 

export function zoneDataFetcher() : (url : string) => Promise<Zone> {
  return (...args) => fetch(...args)
    .then(x => x.json())
    .then(x => ({ totalPopulation: x.totalPopulation, medianIncome: x.medianIncome }) as Zone)
}
