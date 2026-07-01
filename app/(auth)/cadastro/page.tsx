"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { toast } from "sonner";
import { LeafIcon, UserPlusIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [perfil, setPerfil] = useState("produtor");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          perfil,
          status: "pendente",
        },
      },
    });

    if (error) {
      toast.error("Erro ao realizar cadastro: " + error.message);
      setLoading(false);
      return;
    }

    toast.success("Cadastro realizado! Aguardando aprovação do administrador.");
    router.push("/pendente");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1726] text-white py-12">
      <div className="w-full max-w-md bg-[#16253D] p-8 rounded-2xl shadow-2xl border border-slate-800">
        <div className="flex justify-center mb-8">
          <div className="bg-praxis-green-500/20 p-4 rounded-full border border-praxis-green-500/50">
            <LeafIcon className="w-10 h-10 text-praxis-green-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Solicitar Acesso</h1>
        <p className="text-slate-400 text-center text-sm mb-8">
          Preencha seus dados. Seu cadastro passará por aprovação.
        </p>

        <form onSubmit={handleCadastro} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-[#0d1726] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-praxis-green-500 transition-all"
              placeholder="João da Silva"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              E-mail corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0d1726] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-praxis-green-500 transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d1726] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-praxis-green-500 transition-all pr-12"
                placeholder="••••••••"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Tipo de Perfil
            </label>
            <select
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
              className="w-full bg-[#0d1726] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-praxis-green-500 transition-all"
            >
              <option value="produtor">Produtor Rural</option>
              <option value="agronomo">Agrônomo / Técnico</option>
              <option value="empresa">Empresa / Revenda</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-praxis-green-500 hover:bg-praxis-green-600 text-slate-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Enviar Solicitação"}
            {!loading && <UserPlusIcon className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-400 mb-4">
            Já possui uma conta ativa?
          </p>
          <Link 
            href="/login"
            className="inline-block w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-lg transition-colors border border-slate-700"
          >
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}
