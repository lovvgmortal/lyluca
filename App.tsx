import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ScriptEditor } from './components/ScriptEditor';
import { ScriptsProvider } from './contexts/ScriptsContext';
import { StylesProvider } from './contexts/StylesContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainer } from './components/ToastContainer';
import { SettingsModal } from './components/SettingsModal';
import { Tutorial } from './components/Tutorial';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FoldersProvider } from './contexts/FoldersContext';
import { KeywordStylesProvider } from './contexts/KeywordStylesContext';
import { UsersProvider } from './contexts/UsersContext';
import { Work } from './components/Work';

const AppContent: React.FC = () => {
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {user && <Header onSettingsClick={() => setSettingsModalOpen(true)} />}
      <ToastContainer />
      <main className="flex-grow">
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
          <Route path="/" element={<ProtectedRoute><Work /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/edit/:scriptId?" element={<ProtectedRoute><ScriptEditor /></ProtectedRoute>} />
          <Route path="/tutorial" element={<ProtectedRoute><Tutorial /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={user ? "/" : "/auth"} />} />
        </Routes>
      </main>
      {user && <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <HashRouter>
          <AuthProvider>
            <UsersProvider>
              <ScriptsProvider>
                <FoldersProvider>
                  <StylesProvider>
                    <KeywordStylesProvider>
                      <AppContent />
                    </KeywordStylesProvider>
                  </StylesProvider>
                </FoldersProvider>
              </ScriptsProvider>
            </UsersProvider>
          </AuthProvider>
        </HashRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;