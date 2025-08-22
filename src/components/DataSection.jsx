import React from "react";
import {
  LineChart, Line,
  BarChart, Bar, LabelList,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#fbbf24", "#a78bfa"];

const parseValue = (value) => {
  const match = String(value).match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
};

export default function DataSection({ title, data }) {
  if (!data || !Array.isArray(data)) return null;

  const chartData = data.map(item => ({
    label: item.label,
    value: parseValue(item.value)
  }));

  return (
    <div className="p-6 m-4 rounded-xl bg-gray-800/60 backdrop-blur-md shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>

      {/* Text Info */}
      <div className="space-y-2 mb-6">
        {data.map((item, i) => (
          <div key={i}>
            <span className="font-semibold">{item.label}:</span> {item.value}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {title.includes("Climate") ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="label" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: "#222", borderRadius: "8px" }} />
              <Line type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={3} activeDot={{ r: 6 }} />
            </LineChart>
          ) : title.includes("Disasters") ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="label" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip contentStyle={{ backgroundColor: "#222", borderRadius: "8px" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                <LabelList dataKey="value" position="top" fill="#fff" />
              </Bar>
            </BarChart>
          ) : (
            <PieChart>
              <Tooltip contentStyle={{ backgroundColor: "#222", borderRadius: "8px" }} />
              <Pie data={chartData} dataKey="value" nameKey="label" outerRadius={90} label>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
