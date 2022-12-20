import './App.css'
import MapProvider from './components/MapContext'
import DataProvider from './components/DataContext'
import Menu from './components/Menu'

function App() {
  return (
    <div className="App">
      <DataProvider>
        <MapProvider>
          <Menu />
        </MapProvider>
      </DataProvider>
    </div>
  )
}

export default App
