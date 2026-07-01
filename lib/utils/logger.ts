/**
 * Logger Centralizado
 * Padroniza os logs do sistema e evita console.log espalhados pelo código.
 */

const isDev = process.env.NODE_ENV !== "production";

export const Logger = {
  info: (mensagem: string, dados?: any) => {
    if (isDev) {
      console.log(`[INFO] ${new Date().toISOString()} - ${mensagem}`, dados ? dados : "");
    }
  },

  warn: (mensagem: string, dados?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${mensagem}`, dados ? dados : "");
  },

  error: (mensagem: string, erro?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${mensagem}`);
    if (erro) {
      if (erro instanceof Error) {
        console.error(erro.stack);
      } else {
        console.error(erro);
      }
    }
  },

  debug: (mensagem: string, dados?: any) => {
    if (isDev) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${mensagem}`, dados ? dados : "");
    }
  }
};
