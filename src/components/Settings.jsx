import React from 'react';
import ServerDiagnostics from './ServerDiagnostics';
import { useAuth } from '../lib/authContext';

export default function Settings() {
  const { isAdmin } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage app preferences and run server diagnostics.</p>
      </header>

      {/* your existing settings sections can stay above/below */}

      {isAdmin && (
        <section>
          <ServerDiagnostics />
        </section>
      )}

      {!isAdmin && (
        <div className="rounded-lg border bg-yellow-50 text-yellow-800 p-4">
          Diagnostics are visible to admins only.
        </div>
      )}
    </div>
  );
}