// components/TransferList.js
import {Card, CardHeader, CardContent, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'

const AssignmentsList = ({assignments, onAssignmentClick}) => {
  return (
    <div className="space-y-4">
      {assignments.map((assignment, index) => {
        const [origin, destination, category, items] = assignment;
        return (
          <Card 
            key={index} 
            className="shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => onAssignmentClick(origin, destination)}
          >
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">
                {origin} &rarr; {destination}
              </CardTitle>
              <Badge variant="secondary" className="capitalize">
                {category}
              </Badge>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium text-sm mb-2">Items:</h4>
              <ul className="list-disc list-inside text-sm">
                {items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AssignmentsList;
