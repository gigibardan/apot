import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ConversionChartProps {
  data: {
    newsletterRate: number;
    favoritesRate: number;
    reviewRate: number;
    contactRate: number;
  };
}

export function ConversionChart({ data }: ConversionChartProps) {
  const chartData = [
    { name: "Newsletter", rate: data.newsletterRate },
    { name: "Favorite", rate: data.favoritesRate },
    { name: "Recenzii", rate: data.reviewRate },
    { name: "Contact", rate: data.contactRate },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate de Conversie (%)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: any) => `${value.toFixed(2)}%`}
            />
            <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
