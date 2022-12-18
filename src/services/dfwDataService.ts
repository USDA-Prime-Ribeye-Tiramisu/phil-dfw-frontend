import { Point, InterpolationStrategy, getIdFromInterpolationStrategy, Zone, Tract } from "../data/types";

const baseUrl = "http://localhost:8080/api"

export async function getShapes() : Promise<Tract[]> {

  return fetch(baseUrl + "/shapes").then(x => x.json())
} 

export async function getZoneData(p : Point, radius : number, strategy : InterpolationStrategy) : Promise<Zone> {

  const params : URLSearchParams = new URLSearchParams({
    "lat": `${p.latitude}`,
    "lng": `${p.longitude}`,
    "rad": `${radius}`,
    "strategyId": `${getIdFromInterpolationStrategy(strategy)}`
  })

  return fetch(baseUrl + "/compute?"  + params.toString())
    .then(x => x.json())
    .then(x => ({
      center: p,
      radius: radius,
      totalPopulation: x.totalPopulation,
      medianIncome: x.medianIncome 
    }) as Zone)
}
