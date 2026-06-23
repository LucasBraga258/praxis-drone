"use client";

export default function TesteIA() {

  async function testar() {

    const response = await fetch("/api/analisar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texto: `
Cultura: Milho

Município: Ribeirão Preto

UF: SP

GSD: 1.64

Latitude: -21.2421691

Longitude: -47.7888383
        `,
      }),
    });

    const data = await response.json();

    console.log(data);

    alert(JSON.stringify(data, null, 2));
  }

  return (
    <main className="p-10">

      <button
        onClick={testar}
        className="bg-green-700 text-white px-6 py-3 rounded-xl"
      >
        Testar Gemini
      </button>

    </main>
  );
}