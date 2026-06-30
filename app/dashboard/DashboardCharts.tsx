"use client";

import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

interface Props {
  saudeData:        { nome: string; valor: number }[];
  culturasData:     { nome: string; valor: number }[];
  monitoramentosData: { mes: string; voos: number }[];
  statusData:       { nome: string; valor: number }[];
}

const SAUDE_COLORS  = ["#22c55e", "#f59e0b", "#ef4444"];
const STATUS_COLORS = ["#22c55e", "#3b82f6", "#ef4444"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--bg-border)",
          borderRadius: "var(--radius-md)",
          padding: "8px 14px",
          fontSize: 12,
          color: "var(--text-primary)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {label && <p style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>}
        <p style={{ fontWeight: 700 }}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="praxis-card" style={{ padding: 20 }}>
      <h3
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function DashboardCharts({
  saudeData,
  culturasData,
  monitoramentosData,
  statusData,
}: Props) {
  const totalSaude = saudeData.reduce((s, d) => s + d.valor, 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {/* Saúde das Fazendas */}
      <ChartCard title="Saúde das Fazendas">
        {totalSaude === 0 ? (
          <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>Sem dados</p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 120, height: 120, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={saudeData}
                    dataKey="valor"
                    innerRadius={30}
                    outerRadius={55}
                    strokeWidth={2}
                    stroke="var(--bg-card)"
                  >
                    {saudeData.map((_, i) => (
                      <Cell key={i} fill={SAUDE_COLORS[i % SAUDE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {saudeData.map((d, i) => (
                <div key={d.nome} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: SAUDE_COLORS[i], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: "var(--text-secondary)" }}>{d.nome}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: SAUDE_COLORS[i] }}>{d.valor}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ChartCard>

      {/* Status Missões */}
      <ChartCard title="Status das Missões">
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 120, height: 120, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData.filter((d) => d.valor > 0)}
                  dataKey="valor"
                  innerRadius={30}
                  outerRadius={55}
                  strokeWidth={2}
                  stroke="var(--bg-card)"
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {statusData.map((d, i) => (
              <div key={d.nome} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[i], flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: "var(--text-secondary)" }}>{d.nome}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLORS[i] }}>{d.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      {/* Monitoramentos por Mês (full width) */}
      <div className="praxis-card" style={{ padding: 20, gridColumn: "1 / -1" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          Monitoramentos por Mês — {new Date().getFullYear()}
        </h3>
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monitoramentosData} barSize={24}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="mes"
                tick={{ fill: "var(--text-muted)", fontSize: 10.5 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--text-muted)", fontSize: 10.5 }}
                axisLine={false}
                tickLine={false}
                width={24}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="voos" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}