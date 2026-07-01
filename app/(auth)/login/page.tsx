"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { toast } from "sonner";
import { LeafIcon, ShieldIcon, EyeIcon, EyeOffIcon } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let errorMessage = "Erro ao fazer login.";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "E-mail ou senha incorretos. Verifique seus dados.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Seu e-mail ainda não foi confirmado ou aprovado.";
      } else {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    toast.success("Login realizado com sucesso!");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1726] text-white py-12">
      <div className="w-full max-w-md bg-[#16253D] p-8 rounded-2xl shadow-2xl border border-slate-800">
        <div className="flex justify-center mb-8">
          <div className="bg-praxis-green-500/20 p-4 rounded-full border border-praxis-green-500/50">
            <LeafIcon className="w-10 h-10 text-praxis-green-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Praxis Drone</h1>
        <p className="text-slate-400 text-center text-sm mb-8">
          Plataforma de Inteligência Agrícola
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              E-mail corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0d1726] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-praxis-green-500 focus:ring-1 focus:ring-praxis-green-500 transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-400">
                Senha
              </label>
              <a href="#" className="text-xs text-praxis-green-400 hover:text-praxis-green-300 transition-colors">
                Esqueceu a senha?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d1726] border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-praxis-green-500 focus:ring-1 focus:ring-praxis-green-500 transition-all pr-12"
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-praxis-green-500 hover:bg-praxis-green-600 text-slate-900 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Autenticando..." : "Entrar no Sistema"}
            {!loading && <ShieldIcon className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-400 mb-4">
            Ainda não possui acesso à plataforma?
          </p>
          <button 
            onClick={() => router.push("/cadastro")}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-lg transition-colors border border-slate-700"
          >
            Solicitar Cadastro
          </button>
        </div>
      </div>
    </div>
  );
}
