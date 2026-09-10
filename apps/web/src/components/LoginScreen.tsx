import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { authService } from '@/lib/authService';

export function LoginScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signInWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#090d13] items-center justify-center p-6 relative">
      {/* Background Decorators */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-joint-900/20 via-[#090d13] to-[#090d13] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-slate-950/80 border-b border-slate-800 p-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-joint-600 to-joint-900 flex items-center justify-center shadow-lg shadow-joint-900/50 mb-4 border border-joint-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight text-center">
              Joint Planning Engine
            </h1>
            <p className="text-sm text-slate-400 mt-2 text-center font-mono">
              AUTHORIZED PERSONNEL ONLY
            </p>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            <div className="text-sm text-slate-300 text-center leading-relaxed">
              This system is restricted to cleared J-5 planners and commanding officers. 
              Please authenticate using your official credentials.
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-900/50 rounded-lg p-4 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-red-200">{error}</div>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full relative group flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Authenticate via Google SSO</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-mono mt-4">
              <Lock className="w-3 h-3" />
              <span>IL4/IL5 Secured Node</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
