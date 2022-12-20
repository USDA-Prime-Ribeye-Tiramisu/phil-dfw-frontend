import * as turf from '@turf/turf';
import { Point, Tract } from '../data/types';

export function toCircleFeature(p : Point, radiusMeter : number) : turf.Feature<turf.Polygon> {
  return turf.circle([p.longitude, p.latitude],
                      radiusMeter,
                      { steps: 128, units: 'meters'})
}

function extractGeometryFromJSON(jsonStr : string) : turf.Geometry {
  const json = JSON.parse(jsonStr)

  if (json.type && json.coordinates){
    return { type: json.type, coordinates: json.coordinates } as turf.Geometry 
  }

  throw new Error("json is not a valid geojson")
}

export function toTractFeature(t: Tract) : turf.Feature<turf.Geometry> {
  const geom = extractGeometryFromJSON(t.geojson!)
  return turf.feature(geom, { id: t.id } as GeoJSON.GeoJsonProperties)
}

export function toTractFeatureCollection(ts : Tract[]) : turf.FeatureCollection<turf.Geometry, GeoJSON.GeoJsonProperties>{
  return turf.featureCollection(ts.map(x => toTractFeature(x)))
}

export function getCentroid(t : Tract) : turf.Feature<turf.Point> {
  const feature = toTractFeature(t)
  return turf.centroid(feature)
 }

export function toCentroidsFeatureCollection(ts : Tract[]) {
  return turf.featureCollection(ts.map(x => getCentroid(x)))
}
