// v.0.0.01 salah

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataCardProps {
  value: number;
  label: string;
}
export const DataCard = ({ value, label }: DataCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flow-row items-center justify-between space-y-0 pb-2 text-center">
        <CardTitle className="text-sm font-medium text-center">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl text-center">{value}</div>
      </CardContent>
    </Card>
  );
};
