import { createContext, useRef, useState, useEffect, useContext, useCallback } from 'react'
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';
import { dataContext } from './DataContext';
import { zoneUrl, zoneDataFetcher  } from "../services/dfwDataService"
import { Tract, Zone, InterpolationStrategy } from '../data/types'
import { toCircleFeature, toTractFeatureCollection, toCentroidsFeatureCollection } from '../utils/featureUtils';

const fetchZoneData = (lng : number, lat : number, rad : number, strategy : InterpolationStrategy) : any => {
  return zoneDataFetcher()(zoneUrl({longitude: lng, latitude: lat}, rad, strategy))
}

const mapContext = createContext<any>(undefined);

const addDraggableMarker = (map : mapboxgl.Map, initialLng: number, initialLat: number) => {
  const marker = new mapboxgl.Marker({
    draggable: true
  })
  .setLngLat([initialLng, initialLat])
  .addTo(map)

  return marker;
}

const addPopup = (map : mapboxgl.Map, lng : number, lat : number, rad: number, strategy: InterpolationStrategy) => {

  const popup = new mapboxgl.Popup({ closeOnClick : false, offset: [0, -20]})
    .setLngLat([lng, lat])
    .setHTML(`<div class="popup"><p>Total Population<strong class="blurred">- - - - -</strong></p><p>Median Income<strong class="blurred">- - - - -</strong></div>`)
    .addTo(map)

  map.on('closePopup', () => {
    popup.remove()
  })

  fetchZoneData(lng, lat, rad, strategy)
    .then((x : Zone) => {
      popup.setHTML(`<div class="popup"><p>Total Population<strong>${x.totalPopulation ? Math.round(x.totalPopulation) : 'N/A' }</strong></p><p>Median Income<strong>${ x.medianIncome ? '$' + x.medianIncome.toFixed(2) : 'N/A' }</strong></div>`)
  })
}

const setCircle = (map : mapboxgl.Map, lng : number, lat : number, rad : number) => {
  
  const id = 'circle'
  const data = toCircleFeature({ longitude: lng, latitude: lat }, rad)
  
  if (map.getSource(id)){
    (map.getSource(id) as GeoJSONSource).setData(data);
  }else {
    map.addSource(id, {
      type: 'geojson',
      data,
    })
  }

  if (!map.getLayer(id)){
    map.addLayer({
      id,
      type: 'fill',
      source: id,
      paint: {
        'fill-color': '#f08',
        'fill-opacity': 0.3
      }
    })
  }
}

const setCircleDragging = (map : mapboxgl.Map, lng : number, lat : number, rad : number) => {

  const id = 'circleDragging'
  const data = toCircleFeature({ longitude: lng, latitude: lat }, rad)
  
  if (map.getSource(id)){
    (map.getSource(id) as GeoJSONSource).setData(data);
  }
  else {
    map.addSource(id, {
      type: 'geojson',
      data,
    })
  }

  if (!map.getLayer(id)){
    map.addLayer({
      id,
      type: 'fill',
      source: id,
      paint: {
        'fill-color': '#f08',
        'fill-opacity': 0.1
      }
    })
  }
}

const setTract = (map : mapboxgl.Map, ts : Tract[]) => {
  const id = 'tracts'

  if (map.getSource(id) || map.getLayer(id)){
    return
  }

  map.addSource(id, {
    type: 'geojson',
    data: toTractFeatureCollection(ts) as any
  })

  map.addLayer({
    id,
    type: 'fill',
    source: id,
    paint: {
      'fill-color': '#78A7A9',
      'fill-opacity': 0.3
    }
  })
}

const setCentroids = (map : mapboxgl.Map, ts : Tract[]) => {
  const id = 'centroids'

  if (map.getSource(id) || map.getLayer(id)){
    return
  }

  map.addSource(id, {
    type: 'geojson',
    data: toCentroidsFeatureCollection(ts)
  })

  map.addLayer({
    id,
    type: 'circle',
    source: id,
    paint: {
      'circle-color': '#78A7A9',
      'circle-radius': 4
    }
  })
}

const component = (props : any) =>  {

  const data = useContext(dataContext);

  const mapRef = useRef<mapboxgl.Map | undefined>(undefined)
  const [mapLng, setMapLng] = useState<number>(data.lngRef.current)
  const [mapLat, setMapLat] = useState<number>(data.latRef.current)
  const markerRef = useRef<any>()
  const popupRef = useRef<any>()

  const mapOnLoadHandler = useCallback(() => {
      setTract(mapRef.current!, data.tracts)
      setCentroids(mapRef.current!, data.tracts)
      setCircle(mapRef.current!, data.lngRef.current, data.latRef.current, data.radRef.current)
      addPopup(mapRef.current!, data.lngRef.current, data.latRef.current, data.radRef.current, data.interpolationStrategy.current)
  }, [data.lng, data.lat, data.rad, data.strategy])

  const markerDragEndHandler = useCallback(() => {
    mapRef.current!.removeLayer('circleDragging')
    const { lng, lat } = markerRef.current.getLngLat()
    data.setLng(lng)
    data.setLat(lat)
    mapRef.current!.fire('closePopup')
    setCircle(mapRef.current!, data.lngRef.current, data.latRef.current, data.radRef.current)
    addPopup(mapRef.current!, data.lngRef.current, data.latRef.current, data.radRef.current, data.interpolationStrategy.current)
  }, [data.lng, data.lat, data.rad, data.strategy])

  const markerDraggingHandler = useCallback(() => {
    const { lng, lat } = markerRef.current.getLngLat()
    setCircleDragging(mapRef.current!, lng, lat, data.radRef.current)
  }, [data.lng, data.lat, data.rad, data.strategy])

  const computeZoneHandler = useCallback(() => {
    mapRef.current!.fire('closePopup')
    addPopup(mapRef.current!, data.lngRef.current, data.latRef.current, data.radRef.current, data.interpolationStrategy.current)
  }, [data.lng, data.lat, data.rad, data.strategy])

  const redrawCircleHandler = useCallback(() => {
    setCircle(mapRef.current!, data.lngRef.current, data.latRef.current, data.radRef.current)
  }, [data.lng, data.lat, data.rad, data.strategy])


  // init of map
  useEffect(() => {
      if (!mapRef.current){
        // key is stored inside .env.local in root folder
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY
        mapRef.current = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/light-v11',
          center: [mapLng, mapLat],
          zoom: 13,
        })
      }
  }, [])

  // wire handlers to map events
  useEffect(() => {
    if (!mapRef.current) {
      return 
    }
    mapRef.current.once('load', mapOnLoadHandler)
    markerRef.current = addDraggableMarker(mapRef.current, data.lngRef.current, data.latRef.current)
    markerRef.current.on('drag', markerDraggingHandler);
    markerRef.current.on('dragend', markerDragEndHandler);

    // register a recompite event into map
    mapRef.current.on('recompute', computeZoneHandler)
    mapRef.current.on('redrawCircle', redrawCircleHandler)

    return () => {
      markerRef.current.remove()
    }

  }, [mapOnLoadHandler, markerDraggingHandler, markerDragEndHandler])

  useEffect(() => {
    if (!mapRef.current) {
      return 
    }
    mapRef.current.on("move", () => {
      setMapLng(Number.parseFloat(mapRef.current!.getCenter().lng.toFixed(4)))
      setMapLat(Number.parseFloat(mapRef.current!.getCenter().lat.toFixed(4)))
    })
  })

  return (
      <>
          <mapContext.Provider value={{ mapRef, mapLat, mapLng }}>
            { props.children }
            <div id="map" style={{ height: "100vh", width: "100vw" }}></div>
          </mapContext.Provider>
      </>
  )

}
export default component
export  {
  mapContext
}
