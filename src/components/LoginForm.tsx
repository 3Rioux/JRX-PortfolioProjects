import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate(); // initialize the navigate function

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Login failed: ${error.message}`);
    } else {
      setMessage('Logged in successfully!');
      navigate('/add-project'); // redirect after successful login
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-xl bg-muted">

      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mb-4 w-full py-1.5 bg-gray-300 hover:bg-gray-400 text-black rounded dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      >
        ← Back
      </button>
      
      <h2 className="mb-4 text-xl font-semibold dark:text-violet-500">Login:</h2>
      <input
        className="w-full border px-3 py-2 rounded mb-2 dark:text-gray-100"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full border px-3 py-2 rounded mb-2 dark:text-gray-100"
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
