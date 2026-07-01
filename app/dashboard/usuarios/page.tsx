"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Card from "@/app/components/ui/Card";
import { CheckCircleIcon, XCircleIcon, ClockIcon, UsersIcon, ShieldIcon } from "lucide-react";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  status: string;
  created_at: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("perfis_usuarios")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao buscar usuários");
    } else {
      setUsuarios(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("perfis_usuarios")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success(`Usuário ${newStatus} com sucesso!`);
      fetchUsuarios();
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1 flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-praxis-green-400" />
            Gestão de Usuários e Acessos
          </h1>
          <p className="text-slate-400 text-sm">Aprove ou rejeite solicitações de cadastro na plataforma.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <div className="flex flex-col">
            <span className="text-slate-400 text-sm mb-1">Total de Usuários</span>
            <span className="text-3xl font-bold text-white">{usuarios.length}</span>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col">
            <span className="text-slate-400 text-sm mb-1">Aguardando Aprovação</span>
            <span className="text-3xl font-bold text-amber-400">
              {usuarios.filter((u) => u.status === "pendente").length}
            </span>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col">
            <span className="text-slate-400 text-sm mb-1">Admins Master</span>
            <span className="text-3xl font-bold text-praxis-green-400">
              {usuarios.filter((u) => u.perfil === "admin").length}
            </span>
          </div>
        </Card>
      </div>

      <Card>
        {loading ? (
          <div className="text-slate-400 py-8 text-center">Carregando usuários...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium rounded-tl-lg">Nome</th>
                  <th className="px-6 py-4 font-medium">E-mail</th>
                  <th className="px-6 py-4 font-medium">Perfil</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right rounded-tr-lg">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {usuarios.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{user.nome}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs font-semibold uppercase">
                        {user.perfil}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === "pendente" && (
                        <span className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase">
                          <ClockIcon className="w-4 h-4" /> Pendente
                        </span>
                      )}
                      {user.status === "aprovado" && (
                        <span className="flex items-center gap-1.5 text-praxis-green-400 text-xs font-bold uppercase">
                          <CheckCircleIcon className="w-4 h-4" /> Aprovado
                        </span>
                      )}
                      {user.status === "rejeitado" && (
                        <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold uppercase">
                          <XCircleIcon className="w-4 h-4" /> Rejeitado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.status === "pendente" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => updateStatus(user.id, "aprovado")}
                            className="bg-praxis-green-500/20 text-praxis-green-400 hover:bg-praxis-green-500 hover:text-slate-900 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={() => updateStatus(user.id, "rejeitado")}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                          >
                            Rejeitar
                          </button>
                        </div>
                      )}
                      {user.status === "aprovado" && user.perfil !== "admin" && (
                        <button
                          onClick={() => updateStatus(user.id, "bloqueado")}
                          className="text-red-400 hover:text-red-300 text-xs font-medium"
                        >
                          Bloquear Acesso
                        </button>
                      )}
                      {user.perfil === "admin" && (
                        <span className="flex items-center justify-end gap-1 text-slate-500 text-xs">
                          <ShieldIcon className="w-3 h-3" /> Protegido
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
