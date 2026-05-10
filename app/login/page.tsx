'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(from);
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-white font-black text-2xl">M</span>
          </div>
        </div>
        <h1 className="text-white font-bold text-xl text-center mb-1">MATBAA HESAP</h1>
        <p className="text-gray-500 text-sm text-center mb-8">Devam etmek için şifre girin</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as unknown as React.FormEvent)}
              placeholder="Şifre"
              autoFocus
              className={`w-full bg-[#111] border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all ${
                error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-orange-500/50'
              }`}
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">Yanlış şifre</p>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş'}
          </button>
        </form>
      </div>
    </div>
  );
}
