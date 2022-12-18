import {assert, expect, test } from 'vitest'
import { getShapes, getZoneData } from '../src/services/dfwDataService'
import { Zone, Tract } from '../src/data/types'

test('fetch geojson from backend', async () => {
  const result : Tract[] = await getShapes() 
  assert(result.length > 0)
  assert(
    result.reduce((acc, cur) => acc && !!cur.geojson, true)
  )
})

test('fetch computed value from backend', async () => {
  const result : Zone = await getZoneData({ latitude: 33.045352, longitude: -96.781508 }, 2000, "CENTROID")
  assert(result.totalPopulation && result.medianIncome)
})
