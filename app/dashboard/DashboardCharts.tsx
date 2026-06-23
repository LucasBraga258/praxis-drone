"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface Props {
  saudeData: {
    nome: string;
    valor: number;
  }[];

  culturasData: {
    nome: string;
    valor: number;
  }[];

  monitoramentosData: {
    mes: string;
    voos: number;
  }[];
}

export default function DashboardCharts({
  saudeData,
  culturasData,
  monitoramentosData,
}: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-10">

      {/* Saúde */}

      <div className="bg-[#16253D] p-6 rounded-2xl">

        <h2 className="text-xl font-bold mb-4">
          🌱 Saúde das Fazendas
        </h2>

        <div className="h-[300px]">

          <ResponsiveContainer>

            <PieChart>

              <Pie
                data={saudeData}
                dataKey="valor"
                outerRadius={100}
                label
              >
                <Cell fill="#22c55e" />
                <Cell fill="#facc15" />
                <Cell fill="#ef4444" />
              </Pie>

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* Culturas */}

      <div className="bg-[#16253D] p-6 rounded-2xl">

        <h2 className="text-xl font-bold mb-4">
          🌾 Culturas
        </h2>

        <div className="h-[300px]">

          <ResponsiveContainer>

            <PieChart>

              <Pie
                data={culturasData}
                dataKey="valor"
                outerRadius={100}
                label
              />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* Monitoramentos */}

      <div className="bg-[#16253D] p-6 rounded-2xl">

        <h2 className="text-xl font-bold mb-4">
          🚁 Monitoramentos
        </h2>

        <div className="h-[300px]">

          <ResponsiveContainer>

            <BarChart data={monitoramentosData}>

              <XAxis dataKey="mes" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="voos"
                fill="#22c55e"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}