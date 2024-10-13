'use client'

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Tooltip, TooltipProvider} from '@/components/ui/tooltip' // Ensure you have a Tooltip component
import {useMemo} from 'react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const RedistributedFoodChart = ({data}) => {
  // Calculate total value for percentage calculations
  const total = useMemo(
    () => data.reduce((acc, item) => acc + item.value, 0),
    [data],
  )

  if (!data || data.length === 0) {
    return (
      <Card className="bg-white shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-400 px-4 py-3">
          <CardTitle className="text-white text-lg font-semibold">
            Redistributed Food
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-center text-gray-500">No data available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className="bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-green-500 to-teal-400 px-4 py-3">
          <CardTitle className="text-white text-lg font-semibold">
            Redistributed Food
          </CardTitle>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-4">
          {/* Horizontal Segmented Line */}
          <div className="w-full h-6 flex rounded-md overflow-hidden">
            {data.map((entry, index) => (
              <Tooltip
                key={index}
                content={`${entry.name}: ${entry.value} (${(
                  (entry.value / total) *
                  100
                ).toFixed(1)}%)`}
              >
                <div
                  className="h-full cursor-pointer transition-all duration-300 ease-in-out"
                  style={{
                    width: `${(entry.value / total) * 100}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
              </Tooltip>
            ))}
          </div>

          {/* Custom Legend */}
          <div className="mt-4 flex flex-wrap justify-center space-x-6">
            {data.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{backgroundColor: COLORS[index % COLORS.length]}}
                />
                <span className="text-sm font-medium text-gray-700">
                  {entry.name}: {entry.value} (
                  {((entry.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default RedistributedFoodChart
