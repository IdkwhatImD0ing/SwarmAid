'use client'

import { useState, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { X, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

const locations = {
  "locations": {
    "Grocery Store A": {
      "surplus": ["fruits", "dairy"],
      "surplus_mapping": {
        "fruits": ["strawberry", "apple"],
        "dairy": ["milk", "cheese"]
      },
      "data": {
        "lat": 40.712776,
        "lon": -74.005974,
        "address": "123 Main St, New York, NY 10001"
      }
    },
    "Bakery B": {
      "surplus": ["grains", "baked goods"],
      "surplus_mapping": {
        "grains": ["bread", "rice"],
        "baked goods": ["muffins", "cookies"]
      },
      "data": {
        "lat": 42.652580,
        "lon": -73.756232,
        "address": "456 Country Rd, Albany, NY 12207"
      }
    },
    "Seafood Market C": {
      "surplus": ["seafood"],
      "surplus_mapping": {
        "seafood": ["salmon", "shrimp"]
      },
      "data": {
        "lat": 42.886448,
        "lon": -78.878372,
        "address": "789 Market St, Buffalo, NY 14202"
      }
    },
    "Soup Kitchen X": {
      "demand": ["fruits", "seafood"],
      "data": {
        "lat": 40.717054,
        "lon": -73.984472,
        "address": "321 Charity Ave, New York, NY 10002"
      }
    },
    "Homeless Shelter Y": {
      "demand": ["dairy", "grains"],
      "data": {
        "lat": 42.652580,
        "lon": -73.756232,
        "address": "654 Support St, Albany, NY 12205"
      }
    },
    "Community Kitchen Z": {
      "demand": ["baked goods", "seafood"],
      "data": {
        "lat": 42.886448,
        "lon": -78.878372,
        "address": "987 Hope Rd, Buffalo, NY 14203"
      }
    }
  }
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

const center = {
  lat: 41.881832,
  lng: -75.789206
}

const SupplierIcon = {
  path: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  fillColor: "#22c55e",
  fillOpacity: 1,
  strokeWeight: 1,
  strokeColor: "#ffffff",
  scale: 1.5
}

const DemandIcon = {
  path: "M16 6v-2c0-2.21-1.79-4-4-4s-4 1.79-4 4v2h-4v14h16v-14h-4zm-6-2c0-1.1.9-2 2-2s2 .9 2 2v2h-4v-2z",
  fillColor: "#3b82f6",
  fillOpacity: 1,
  strokeWeight: 1,
  strokeColor: "#ffffff",
  scale: 1.5
}

const InventoryList = ({ title, items }) => (
  <div className="mt-2">
    <h4 className="font-semibold text-sm">{title}:</h4>
    <ul className="list-disc list-inside">
      {items.map((item, index) => (
        <li key={index} className="text-sm">{item}</li>
      ))}
    </ul>
  </div>
)

const LocationCard = ({ name, data, onToggle, isOpen }) => {
  const isSupplier = 'surplus' in data
  const items = isSupplier ? data.surplus : data.demand
  const itemDetails = isSupplier ? data.surplus_mapping : {}

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <Badge variant={isSupplier ? "default" : "secondary"} className="ml-2">
          {isSupplier ? "Supplier" : "Demander"}
        </Badge>
      </CardHeader>
      <CardContent>
        <button
          onClick={onToggle}
          className="flex items-center justify-between w-full text-sm text-gray-500 hover:text-gray-700"
        >
          {isOpen ? "Hide Details" : "Show Details"}
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {isOpen && (
          <div className="mt-2">
            <p className="text-sm">{data.data.address}</p>
            <InventoryList 
              title={isSupplier ? "Surplus Items" : "Demanded Items"} 
              items={items.flatMap(category => 
                isSupplier ? itemDetails[category] : [category]
              )} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const StatsPanel = ({ stats }) => (
  <Card className="mb-4 mt-20 bg-white bg-opacity-90">
    <CardHeader>
      <CardTitle className="text-lg font-medium flex items-center">
        <BarChart3 className="mr-2 h-5 w-5" />
        Top Stats
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        <li>
          <span className="font-semibold">Most Common Missing Food:</span> {stats.mostCommonMissing}
        </li>
        <li>
          <span className="font-semibold">Most Common Extra Food:</span> {stats.mostCommonExtra}
        </li>
        <li>
          <span className="font-semibold">Top Donor:</span> {stats.topDonor}
        </li>
      </ul>
    </CardContent>
  </Card>
)

export default function MissionControl() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [openCards, setOpenCards] = useState({})
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleCard = (id) => {
    setOpenCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  })

  const handleMarkerClick = (name, data) => {
    setSelectedLocation({ name, ...data })
    setSidebarOpen(true)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
    setSelectedLocation(null)
  }

  const stats = useMemo(() => {
    const demandCounts = {}
    const surplusCounts = {}
    const donorCounts = {}

    Object.entries(locations.locations).forEach(([name, data]) => {
      if ('demand' in data) {
        data.demand.forEach(item => {
          demandCounts[item] = (demandCounts[item] || 0) + 1
        })
      } else if ('surplus' in data) {
        data.surplus.forEach(category => {
          data.surplus_mapping[category].forEach(item => {
            surplusCounts[item] = (surplusCounts[item] || 0) + 1
          })
        })
        donorCounts[name] = data.surplus.reduce((acc, category) => acc + data.surplus_mapping[category].length, 0)
      }
    })

    const mostCommonMissing = Object.entries(demandCounts).sort((a, b) => b[1] - a[1])[0][0]
    const mostCommonExtra = Object.entries(surplusCounts).sort((a, b) => b[1] - a[1])[0][0]
    const topDonor = Object.entries(donorCounts).sort((a, b) => b[1] - a[1])[0][0]

    return {
      mostCommonMissing,
      mostCommonExtra,
      topDonor
    }
  }, [])

  return (
    <div className="relative h-screen">
      <div className="w-full h-full">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={7}
          >
            {Object.entries(locations.locations).map(([name, data]) => (
              <Marker
                key={name}
                position={{ lat: data.data.lat, lng: data.data.lon }}
                icon={'surplus' in data ? SupplierIcon : DemandIcon}
                onClick={() => handleMarkerClick(name, data)}
              />
            ))}
          </GoogleMap>
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <div className="absolute top-4 left-4 w-64 z-10">
        <StatsPanel stats={stats} />
      </div>
      {sidebarOpen && selectedLocation && (
        <div className="absolute top-0 right-0 w-full md:w-1/3 h-full bg-white shadow-lg transition-transform transform translate-x-0">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedLocation.name}</h2>
              <Button variant="ghost" size="icon" onClick={closeSidebar}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <LocationCard
                name={selectedLocation.name}
                data={selectedLocation}
                onToggle={() => toggleCard(selectedLocation.name)}
                isOpen={openCards[selectedLocation.name]}
              />
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  )
}