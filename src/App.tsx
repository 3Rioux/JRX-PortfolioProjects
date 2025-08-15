'use client';
import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';
import clsx from 'clsx';
import AddProjectForm from '@/components/AddProjectForm';
import LoginForm from '@/components/LoginForm';
import EditProjectForm from '@/components/EditProjectForm';
import { SearchProjectsPage } from '@/components/SearchProjectsPage.tsx';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function App() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="bg-background text-foreground min-h-screen p-4 md:p-10 text-gray-900">
      {/* Navbar */}
      <header className="header-projects flex justify-between items-center mb-6 sticky top-0 z-10 shadow-sm p-4 rounded-xl backdrop-blur-sm">
        <h1 className="text-xl dark:text-white">
          Justin Rioux's <span className="font-bold text-primary">Projects</span>
        </h1>
        <nav className="space-x-4 hidden md:block">
          <a
            href="https://3rioux.github.io/JustinRioux-JRXDev.github.io/index.html#page1"
            className="text-sm hover:underline"
          >
            Home
          </a>
          <a href="searchprojects" className="text-sm hover:underline">
            Projects
          </a>
          <a
            href="https://3rioux.github.io/JustinRioux-JRXDev.github.io/index.html#page2"
            className="text-sm hover:underline"
          >
            About
          </a>
        </nav>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <ModeToggle />
        </ThemeProvider>
      </header>

      {/* Routes */}
      <Routes>
        {/* Redirect / to /searchprojects */}
        <Route path="/" element={<Navigate to="/searchprojects" replace />} />

        <Route path="/searchprojects" element={<SearchProjectsPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/add-project"
          element={
            <ProtectedRoute>
              <AddProjectForm />
            </ProtectedRoute>
          }
        />
        <Route path="/edit-project/:id" element={<EditProjectForm />} />
      </Routes>

      {/* Footer */}
      <footer className="mt-16 border-t pt-6 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
        <p>© 2025 MyPortfolio</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#">LinkedIn</a>
          <a href="#">GitHub</a>
          {user && (
            <Link className="cursor-pointer select-none text-md" to="/add-project">
              Add New Project
            </Link>
          )}
          {!user ? (
            <Link className={clsx('cursor-pointer select-none text-md')} to="/login">
              Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className={clsx('cursor-pointer select-none text-md text-red-600')}
            >
              Logout
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
