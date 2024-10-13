'use client'

import {Card, CardContent} from '@/components/ui/card'
import {Utensils, BarChart3, Truck, DollarSign} from 'lucide-react'

// Define the stats data with icons and other details
const statsData = [
  {
    title: 'Total Food Redistributed',
    valueKey: 'totalFoodRedistributed',
    unit: 'kg',
    icon: Utensils,
  },
  {
    title: 'Food Waste Reduction',
    valueKey: 'foodWasteReduction',
    unit: '%',
    icon: BarChart3,
  },
  {
    title: 'Fuel Reduction',
    valueKey: 'fuelReduction',
    unit: 'L',
    icon: Truck,
  },
  {
    title: 'Cash Value of Items',
    valueKey: 'cashValue',
    unit: '$',
    icon: DollarSign,
  },
]

const CombinedStats = ({stats}) => (
  <Card className="bg-white shadow-xl rounded-xl overflow-hidden">
    {/* Header */}
    <div className="bg-gradient-to-r from-green-500 to-teal-400 px-4 py-3">
      <h3 className="text-white text-lg font-semibold">Combined Statistics</h3>
    </div>

    {/* Content */}
    <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg"
        >
          {/* Icon */}
          <stat.icon
            className="h-6 w-6 text-teal-500"
            aria-label={`${stat.title} Icon`}
          />

          {/* Stat Details */}
          <div>
            <div className="text-xs font-medium text-gray-600">
              {stat.title}
            </div>
            <div className="text-lg font-bold text-gray-800">
              {stats[stat.valueKey]} {stat.unit}
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)

export default CombinedStats
