'use client'

import {useState, useMemo, useEffect} from 'react'
import {GoogleMap, useJsApiLoader, Marker} from '@react-google-maps/api'
import {X, BarChart3, PieChart, Utensils, Truck, DollarSign} from 'lucide-react'
import {Badge} from '@/components/ui/badge'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import RedistributedFoodChart from './chart'
import CombinedStats from './combined'
import AssignmentsList from './assignments'
const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const center = {
  lat: 42.3177,
  lng: -83.2331,
}

const SupplierIcon = {
  path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  fillColor: '#22c55e',
  fillOpacity: 1,
  strokeWeight: 1,
  strokeColor: '#ffffff',
  scale: 1.5,
}

const DemandIcon = {
  path: 'M16 6v-2c0-2.21-1.79-4-4-4s-4 1.79-4 4v2h-4v14h16v-14h-4zm-6-2c0-1.1.9-2 2-2s2 .9 2 2v2h-4v-2z',
  fillColor: '#3b82f6',
  fillOpacity: 1,
  strokeWeight: 1,
  strokeColor: '#ffffff',
  scale: 1.5,
}

const InventoryList = ({title, items}) => (
  <div className="mt-2">
    <h4 className="font-semibold text-sm">{title}:</h4>
    <ul className="list-disc list-inside">
      {items.map((item, index) => (
        <li key={index} className="text-sm">
          {item}
        </li>
      ))}
    </ul>
  </div>
)

const LocationCard = ({name, data, onClose}) => {
  const isSupplier = 'surplus' in data
  const items = isSupplier ? data.surplus : data.demand
  const itemDetails = isSupplier ? data.surplus_mapping : {}

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-64">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{name}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <Badge variant={isSupplier ? 'default' : 'secondary'} className="mb-2">
        {isSupplier ? 'Supplier' : 'Demander'}
      </Badge>
      <p className="text-sm mb-2">{data.data.address}</p>
      <ScrollArea className="h-40">
        <InventoryList
          title={isSupplier ? 'Surplus Items' : 'Demanded Items'}
          items={items.flatMap((category) =>
            isSupplier ? itemDetails[category] : [category],
          )}
        />
      </ScrollArea>
    </div>
  )
}

const StatsPanel = ({stats}) => (
  <div className="space-y-4">
    <CombinedStats stats={stats} />
    <RedistributedFoodChart data={stats.redistributedFoodData} />
  </div>
)

export default function MissionControl() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [locations, setLocations] = useState({locations: {}})
  const [connected, setConnected] = useState(false)
  const [socket, setSocket] = useState(null)
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    const socket = new WebSocket(
      `wss://fitting-correctly-lioness.ngrok-free.app/ws?client_id=1235`,
    )

    socket.onopen = () => {
      console.log('WebSocket connection established')
      socket.send(
        JSON.stringify({
          event: 'get_db',
        }),
      )
      setConnected(true)
      setSocket(socket)
    }

    socket.onmessage = (event) => {
      console.log('Received:', event.data)
      const data = JSON.parse(event.data)
      if (data.event === 'db_response') {
        setLocations(data.data)
      } else if (data.event === 'assignments') {
        socket.send(JSON.stringify({event: 'get_db'}))
        setAssignments((prevAssignments) => [...prevAssignments, ...data.data])
      }
    }

    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    socket.onclose = (event) => {
      console.log('WebSocket closed:', event)
      setConnected(false)
    }
  }, [])

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    clickableIcons: false,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  }), [])

  const {isLoaded} = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  })

  const handleMarkerClick = (name, data) => {
    setSelectedLocation({name, ...data})
  }

  const stats = useMemo(() => {
    // This is mock data. In a real application, you would calculate these values based on actual data.
    return {
      totalFoodRedistributed: 5000,
      foodWasteReduction: 30,
      fuelReduction: 500,
      cashValue: 25000,
      redistributedFoodData: [
        {name: 'Fruits', value: 400},
        {name: 'Vegetables', value: 300},
        {name: 'Grains', value: 300},
        {name: 'Dairy', value: 200},
        {name: 'Meat', value: 100},
      ],
    }
  }, [])

  return (
    <div className="relative h-screen flex">
      <div className="flex-1 relative">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
            options={mapOptions}
          >
            {Object.entries(locations.locations).map(([name, data]) => (
              <Marker
                key={name}
                position={{lat: data.data.lat, lng: data.data.lon}}
                icon={'surplus' in data ? SupplierIcon : DemandIcon}
                onClick={() => handleMarkerClick(name, data)}
              />
            ))}
          </GoogleMap>
        ) : (
          <div>Loading...</div>
        )}
        {selectedLocation && (
          <div className="absolute top-20 right-4 z-20">
            <LocationCard
              name={selectedLocation.name}
              data={selectedLocation}
              onClose={() => setSelectedLocation(null)}
            />
          </div>
        )}
      </div>
      <div className="w-1/3 bg-white shadow-lg z-10 flex flex-col">
        {/* Existing ScrollArea for Stats */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <h2 className="text-2xl font-bold mb-4">
              Mission Control Dashboard
            </h2>
            <StatsPanel stats={stats} />
          </ScrollArea>
        </div>
        {/* New ScrollArea for Transfers */}
        <div className="flex-1 overflow-hidden border-t p-4">
          <h2 className="text-2xl font-bold mb-4">Transfers</h2>
          <ScrollArea className="h-full">
            <AssignmentsList assignments={assignments} />
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
