"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function HistoricoChart({
  data,
}: {
  data: any[];
}) {
  return (
    <div className="bg-[#16253D] rounded-xl p-6 mb-8">

      <h2 className="text-2xl font-bold mb-6 text-white">
        Evolução do Talhão
      </h2>

      <div className="h-[400px]">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="data" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="alto"
              stroke="#22c55e"
              strokeWidth={3}
              name="Alto Vigor"
            />

            <Line
              type="monotone"
              dataKey="medio"
              stroke="#facc15"
              strokeWidth={3}
              name="Médio Vigor"
            />

            <Line
              type="monotone"
              dataKey="baixo"
              stroke="#ef4444"
              strokeWidth={3}
              name="Baixo Vigor"
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}