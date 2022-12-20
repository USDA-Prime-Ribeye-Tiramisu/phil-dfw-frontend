import { useContext, useState, } from 'react'
import { mapContext } from "./MapContext"
import { EuiSwitch, EuiRange, EuiRangeProps,   EuiFlexGroup, EuiText } from '@elastic/eui'
import { dataContext } from './DataContext'
import { useDebounce } from 'react-use'


const LatLongDisplay = ({ lat, lng } : any) => {
  return (
  <> 
    <EuiFlexGroup>
      <EuiText className="eui-textNumber">[ { lng.toPrecision(6) }, { lat.toPrecision(6) } ]</EuiText>
    </EuiFlexGroup>
  </>
  )
}

const StrategyToggle = ({ selection, toggle, mapRef } : any) => {
  
  const [checked, setChecked] = useState(selection === 'AREAL_PROPORTION');

  const onChange = (e: {
    target: { checked: React.SetStateAction<boolean> };
  }) => {
    toggle()
    setChecked(e.target.checked)
    mapRef.current.fire('recompute')
  };

  return (
  <>
    <EuiFlexGroup
      direction="column"
      gutterSize="s"
      justifyContent="center"
      alignItems='center'
     >
    <EuiFlexGroup
      direction="row"
      gutterSize="s"
      justifyContent="center"
      alignItems='center'
     >
      <EuiText><h6>Centroid</h6></EuiText>
      <EuiSwitch
        showLabel={false}
        label={""}
        checked={ checked }
        onChange={ onChange }
      ></EuiSwitch>
      <EuiText><h6>Areal Proportion</h6></EuiText>
      </EuiFlexGroup>
    </EuiFlexGroup>
  </>
  )
}

const RadiusSlider = ({ rad, setRad, mapRef } : any) => {

  const [value, setValue] = useState(rad)

  const onChange : EuiRangeProps['onChange'] = (e : any) => {
    setValue(e.currentTarget.value)
    setRad(e.currentTarget.value)
  }

  useDebounce(() => {
    mapRef.current.fire('redrawCircle')
    mapRef.current.fire('recompute')
  }, 400 , [value])

  

  return (
    <>
      <EuiRange
        min={500}
        max={5000}
        value={value}
        onChange={onChange}
        step={500}
        showRange
        showLabels
        showValue
        >
        </EuiRange>
    </>
  )
}

const InfoBox = ({ children } : any) => {
  return (
    <div className="infobox"> 
      { children }
    </div>
  )

}

const component = () => {
  const { mapRef, mapLat, mapLng }  = useContext(mapContext)
  const { rad, setRad, interpolationStrategy, toggleInterpolationStrategy } = useContext(dataContext)

  return (
    <InfoBox>
      <LatLongDisplay lat={mapLat} lng={mapLng} />
      <StrategyToggle selection={ interpolationStrategy } toggle={ toggleInterpolationStrategy } mapRef={ mapRef }/>
      <RadiusSlider rad={rad} setRad={setRad} mapRef={mapRef} />
    </InfoBox>
  )

}
export default component
