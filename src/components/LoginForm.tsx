import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Login failed: ${error.message}`);
    } else {
      setMessage('Logged in successfully!');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-xl bg-muted">
      <h2 className="mb-2 text-xl font-semibold">Login</h2>
      <input
        className="w-full border px-3 py-2 rounded mb-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full border px-3 py-2 rounded mb-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="w-full bg-blue-600 text-white py-2 rounded"
        onClick={handleLogin}
      >
        Login
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
