// RedistributedFoodChart.js
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const RedistributedFoodChart = ({data}) => {
  // Calculate total value for percentage calculations
  const total = data.reduce((acc, item) => acc + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Redistributed Food
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Horizontal Segmented Line */}
        <div className="w-full h-4 flex">
          {data.map((entry, index) => (
            <div
              key={index}
              className="h-full"
              style={{
                width: `${(entry.value / total) * 100}%`,
                backgroundColor: COLORS[index % COLORS.length],
              }}
            />
          ))}
        </div>

        {/* Custom Legend */}
        <div className="mt-2 flex flex-wrap justify-center space-x-4">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center space-x-1">
              <div
                className="w-3 h-3"
                style={{backgroundColor: COLORS[index % COLORS.length]}}
              />
              <span className="text-xs">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default RedistributedFoodChart
