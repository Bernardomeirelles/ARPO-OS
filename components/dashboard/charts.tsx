"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FunnelChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Funil de vendas</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={80} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 12, 12, 0]} fill="#1E3A8A" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function RevenueChart({ data }: { data: Array<{ month: string; receita: number }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita últimos 6 meses</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="receita" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SourceChart({ data }: { data: Array<{ name: string; value: number }> }) {
  const colors = ["#1E3A8A", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads por origem</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={72} outerRadius={104} paddingAngle={3}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PerformanceChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance vendedores</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#1E3A8A" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
