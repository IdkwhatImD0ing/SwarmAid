// CombinedStats.js
import {Card, CardContent} from '@/components/ui/card'
import {Utensils, BarChart3, Truck, DollarSign} from 'lucide-react'

const statsData = [
  {
    title: 'Total Food Redist.',
    valueKey: 'totalFoodRedistributed',
    unit: 'kg',
    icon: Utensils,
  },
  {
    title: 'Food Waste Reduc.',
    valueKey: 'foodWasteReduction',
    unit: '%',
    icon: BarChart3,
  },
  {title: 'Fuel Reduction', valueKey: 'fuelReduction', unit: 'L', icon: Truck},
  {
    title: 'Cash Value of Items',
    valueKey: 'cashValue',
    unit: '$',
    icon: DollarSign,
  },
]

const CombinedStats = ({stats}) => (
  <Card className="p-2">
    <CardContent className="grid grid-cols-2 gap-2">
      {statsData.map((stat, index) => (
        <div key={index} className="flex items-center space-x-1">
          <stat.icon
            className="h-4 w-4 text-muted-foreground"
            aria-label={`${stat.title} Icon`}
          />
          <div>
            <div className="text-xs font-semibold">{stat.title}</div>
            <div className="text-sm font-bold">
              {stats[stat.valueKey]} {stat.unit}
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)

export default CombinedStats
