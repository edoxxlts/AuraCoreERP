import React, { useState } from 'react';
import {
  Lock,
  User,
  Shield,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export const LoginScreen: React.FC = () => {
  const { login, settings } = useERP();

  const [username, setUsername] = useState('ADMIN');
  const [password, setPassword] = useState('1234');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setErrorMsg(res.message || 'Error al iniciar sesión.');
        setLoading(false);
      }
    }, 250);
  };

  const handleQuickLoginAdmin = () => {
    setUsername('ADMIN');
    setPassword('1234');
    const res = login('ADMIN', '1234');
    if (!res.success) {
      setErrorMsg(res.message || 'Error al iniciar sesión.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white border-b border-slate-800 text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-2xl mx-auto mb-3 shadow-md">
            A
          </div>
          <h2 className="text-xl font-bold tracking-tight">{settings.tradeName || 'AuraCore ERP'}</h2>
          <p className="text-xs text-indigo-300 mt-0.5">Control de Acceso y Gestión ERP</p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Default Credentials Notice */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-950 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Credenciales de Administrador:</span>
              <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-indigo-900">
                <span>Usuario: <strong>ADMIN</strong></span>
                <span>·</span>
                <span>Clave: <strong>1234</strong></span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre de Usuario</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="ADMIN"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <span>{loading ? 'Verificando...' : 'Ingresar al Sistema ERP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-click login button for ADMIN */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleQuickLoginAdmin}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline"
            >
              Iniciar sesión rápida con un clic como ADMIN (1234)
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
          AuraCore ERP • Autenticación Segura y Control de Permisos
        </div>
      </div>
    </div>
  );
};
