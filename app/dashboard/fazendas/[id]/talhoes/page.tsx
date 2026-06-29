"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  listarTalhoes,
} from "@/lib/services/talhoes";

export default function TalhoesPage() {

  const params = useParams();

  const fazendaId = Number(params.id);

  const [talhoes, setTalhoes] =
    useState<any[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  useEffect(() => {

    carregar();

  }, []);

  async function carregar() {

    try {

      const dados =
        await listarTalhoes(
          fazendaId
        );

      setTalhoes(dados);

    } catch (error) {

      console.error(error);

    } finally {

      setCarregando(false);

    }

  }

  return (

    <main className="min-h-screen bg-[#07111F] text-white p-8">

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold">

            🌱 Talhões

          </h1>

          <p className="text-slate-400 mt-2">

            Gerencie os talhões desta fazenda.

          </p>

        </div>

        <Link
          href={`/dashboard/fazendas/${fazendaId}/talhoes/novo`}
          className="bg-green-700 hover:bg-green-800 px-5 py-3 rounded-xl font-bold"
        >
          + Novo Talhão
        </Link>

      </div>

      {carregando && (

        <div className="bg-[#16253D] rounded-xl p-8 text-center">

          Carregando...

        </div>

      )}

      {!carregando && talhoes.length === 0 && (

        <div className="bg-[#16253D] rounded-xl p-10 text-center">

          <div className="text-6xl mb-4">

            🌱

          </div>

          <h2 className="text-2xl font-bold">

            Nenhum talhão cadastrado

          </h2>

          <p className="text-slate-400 mt-3">

            Cadastre o primeiro talhão desta fazenda.

          </p>

        </div>

      )}

      {!carregando && talhoes.length > 0 && (

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {talhoes.map((talhao) => (

            <div
              key={talhao.id}
              className="bg-[#16253D] rounded-xl p-6 border border-slate-700"
            >

              <h2 className="text-2xl font-bold mb-4">

                🌱 {talhao.nome}

              </h2>

              <div className="space-y-2 text-slate-300">

                <p>

                  <strong>Cultura:</strong>{" "}
                  {talhao.cultura || "-"}

                </p>

                <p>

                  <strong>Área:</strong>{" "}
                  {talhao.area
                    ? `${talhao.area} ha`
                    : "-"}

                </p>

                <p>

                  <strong>Safra:</strong>{" "}
                  {talhao.safra || "-"}

                </p>

                <p>

                  <strong>Variedade:</strong>{" "}
                  {talhao.variedade || "-"}

                </p>

              </div>

              <div className="mt-6">

                <Link
                  href={`/dashboard/talhoes/${talhao.id}`}
                  className="inline-block bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg font-semibold"
                >
                  Abrir
                </Link>

              </div>

            </div>

          ))}

        </div>

      )}

    </main>

  );

}