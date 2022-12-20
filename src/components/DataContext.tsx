import { createContext, useState, useEffect, useRef,  MutableRefObject } from 'react'
import useSWRImmutable from 'swr/immutable'
import { InterpolationStrategy } from '../data/types';
import { tractsUrl,  tractsFetcher } from '../services/dfwDataService';


const useTracts = () => {
  const { data : tracts, isLoading } =  useSWRImmutable(tractsUrl , tractsFetcher())
  return { tracts, isLoading }
}

const useStateRef = <T,>(initialValue : T) : [T, MutableRefObject<T>, (data : T) => void ] =>  {
  const [ get, _set ] = useState<T>(initialValue)
  const ref = useRef<T>(get)
  const set = (data : T) => {
    ref.current = data
    _set(data)
  }

  return [get, ref, set]
}

const dataContext = createContext<any>(undefined);

const component = ( { children } : any) => {

  const [lng, lngRef, setLng] = useStateRef<number>(-96.781508)
  const [lat, latRef, setLat] = useStateRef<number>(33.045352)
  const [rad, radRef, setRad] = useStateRef<number>(2000)
  const [strategy, strategyRef, setStrategy] = useStateRef<InterpolationStrategy>("CENTROID")
  const { tracts, isLoading } = useTracts()

  if (isLoading){
    return (<h2 className="loading">...Loading</h2>)
  }

  return (
    <>
      <dataContext.Provider 
        value={{
          tracts,
          lng, lngRef, setLng,
          lat, latRef, setLat,
          rad, radRef, setRad,
          strategy,
          interpolationStrategy: strategyRef, 
          toggleInterpolationStrategy : () => setStrategy(strategy === 'CENTROID' ? 'AREAL_PROPORTION' : 'CENTROID')
        }}>
          { children }
      </dataContext.Provider>
    </>
  )
}

export default component
export {
  dataContext
}
