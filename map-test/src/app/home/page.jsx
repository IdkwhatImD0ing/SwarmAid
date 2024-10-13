'use client'

import { useState, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { X, BarChart3, PieChart, Utensils, Truck, DollarSign } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

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

const StatsCard = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
)

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const RedistributedFoodChart = ({ data }) => (
    <Card className="col-span-2">
    <CardHeader>
      <CardTitle>Redistributed Food</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[300px] flex">
        <ResponsiveContainer width="50%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              startAngle={0}
              endAngle={360}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </RechartsPieChart>
        </ResponsiveContainer>
        <div className="w-1/2 flex flex-col justify-center">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center mb-2">
              <div 
                className="w-4 h-4 mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span>{entry.name}: {entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
)

const StatsPanel = ({ stats }) => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold mb-4">Mission Control Dashboard</h2>
    <div className="grid grid-cols-2 gap-4">
      <StatsCard title="Total Food Redist." value={`${stats.totalFoodRedistributed} kg`} icon={Utensils} />
      <StatsCard title="Food Waste Reduc." value={`${stats.foodWasteReduction}%`} icon={BarChart3} />
      <StatsCard title="Fuel Reduction" value={`${stats.fuelReduction} L`} icon={Truck} />
      <StatsCard title="Cash Value of Items" value={`$${stats.cashValue}`} icon={DollarSign} />
      <RedistributedFoodChart data={stats.redistributedFoodData} />
    </div>
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
    // This is mock data. In a real application, you would calculate these values based on actual data.
    return {
      totalFoodRedistributed: 5000,
      foodWasteReduction: 30,
      fuelReduction: 500,
      cashValue: 25000,
      redistributedFoodData: [
        { name: 'Fruits', value: 400 },
        { name: 'Vegetables', value: 300 },
        { name: 'Grains', value: 300 },
        { name: 'Dairy', value: 200 },
        { name: 'Meat', value: 100 },
      ]
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
      <div className="w-100 bg-white shadow-lg z-10 overflow-auto">
        <ScrollArea className="h-screen">
          <div className="p-4">
            <StatsPanel stats={stats} />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
