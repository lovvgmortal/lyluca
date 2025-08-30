import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from './Icon';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const { data } = await signUp(email, password);
        if (data.user && !data.session) {
           setMessage('Sign up successful! Please check your email for a confirmation link.');
        }
      }
      // The auth context will handle redirection on success if confirmation is not needed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const switchMode = () => {
    setIsLogin(!isLogin); 
    setError(null); 
    setMessage(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="max-w-md w-full bg-brand-surface rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
            <Icon name="book" className="mx-auto w-12 h-12 text-brand-primary mb-4" />
            <h1 className="text-3xl font-bold text-brand-text">Script Assistant</h1>
            <p className="text-brand-text-secondary mt-2">
                {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
              <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm" role="alert">
                <p>{error}</p>
              </div>
          )}
          {message && (
             <div className="bg-green-100 dark:bg-green-900/50 border border-green-400 text-green-700 dark:text-green-400 px-4 py-3 rounded-md text-sm" role="alert">
                <p>{message}</p>
              </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-text-secondary">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full bg-brand-bg text-brand-text p-3 rounded-md border border-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium text-brand-text-secondary">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full bg-brand-bg text-brand-text p-3 rounded-md border border-brand-surface focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="••••••••"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-brand-text-inverse bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin"></div> : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-brand-text-secondary">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={switchMode} className="font-medium text-brand-primary hover:text-opacity-80 ml-2">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};