'use client'

import { useState, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { X, BarChart3 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

const locations = {
  "locations": {
    "Kroger": {
      "surplus": ["fruits", "dairy"],
      "surplus_mapping": {
        "fruits": ["bananas", "apples"],
        "dairy": ["milk", "yogurt"]
      },
      "data": {
        "lat": 42.3228,
        "lon": -83.1785,
        "address": "15255 Michigan Ave, Dearborn, MI 48126"
      }
    },
    "Westborn Market": {
      "surplus": ["vegetables", "baked goods"],
      "surplus_mapping": {
        "vegetables": ["carrots", "lettuce"],
        "baked goods": ["bread", "pastries"]
      },
      "data": {
        "lat": 42.3022,
        "lon": -83.2322,
        "address": "21755 Michigan Ave, Dearborn, MI 48124"
      }
    },
    "Dearborn Fresh Supermarket": {
      "surplus": ["grains", "canned goods"],
      "surplus_mapping": {
        "grains": ["rice", "pasta"],
        "canned goods": ["soup", "beans"]
      },
      "data": {
        "lat": 42.3220,
        "lon": -83.1760,
        "address": "13661 Colson St, Dearborn, MI 48126"
      }
    },
    "Forgotten Harvest": {
      "demand": ["fruits", "vegetables"],
      "data": {
        "lat": 42.3312,
        "lon": -83.0458,
        "address": "21800 Greenfield Rd, Oak Park, MI 48237"
      }
    },
    "Zaman International": {
      "demand": ["canned goods", "dairy"],
      "data": {
        "lat": 42.2922,
        "lon": -83.2838,
        "address": "26091 Trowbridge St, Inkster, MI 48141"
      }
    },
    "Gleaners Community Food Bank": {
      "demand": ["grains", "proteins"],
      "data": {
        "lat": 42.3314,
        "lon": -83.0458,
        "address": "2131 Beaufait St, Detroit, MI 48207"
      }
    }
  }
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

// University of Michigan-Dearborn
const center = {
  lat: 42.3177,
  lng: -83.2331
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

const LocationCard = ({ name, data, onClose }) => {
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
      <Badge variant={isSupplier ? "default" : "secondary"} className="mb-2">
        {isSupplier ? "Supplier" : "Demander"}
      </Badge>
      <p className="text-sm mb-2">{data.data.address}</p>
      <ScrollArea className="h-40">
        <InventoryList 
          title={isSupplier ? "Surplus Items" : "Demanded Items"} 
          items={items.flatMap(category => 
            isSupplier ? itemDetails[category] : [category]
          )} 
        />
      </ScrollArea>
    </div>
  )
}

const StatsPanel = ({ stats }) => (
  <div className="mb-4">
    <h2 className="text-lg font-medium flex items-center mb-2">
      <BarChart3 className="mr-2 h-5 w-5" />
      Top Stats
    </h2>
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
  </div>
)

export default function MissionControl() {
  const [selectedLocation, setSelectedLocation] = useState(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  })

  const handleMarkerClick = (name, data) => {
    setSelectedLocation({ name, ...data })
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
    <div className="relative h-screen flex">
      <div className="flex-1 relative">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
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
      <div className="w-64 bg-white shadow-lg z-10">
        <ScrollArea className="h-screen">
          <div className="p-4">
            <StatsPanel stats={stats} />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
