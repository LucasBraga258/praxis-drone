import AlertasManager from "./AlertasManager";

export const metadata = {
  title: "Central de Alertas | Praxis Drone",
};

export default function AlertasPage() {
  return (
    <main className="praxis-content" style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      <div className="max-w-4xl mx-auto">
        <AlertasManager />
      </div>
    </main>
  );
}