import { useState, useEffect } from 'react';
import Login from './Login';
import Carregamento from './Carregamento';

export default function App() {
  const [logado, setLogado] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const usuarios = JSON.parse(localStorage.getItem('liontechcar_users'));

    if (!usuarios) {
      localStorage.setItem(
        'liontechcar_users',
        JSON.stringify([{ username: 'admin', senha: '1234', role: 'admin' }])
      );
    }
  }, []);

  function sair() {
    localStorage.removeItem('liontechcar_logado');
    localStorage.removeItem('liontechcar_role');
    setLogado(false);
    setRole(null);
  }

  return logado ? (
    <Carregamento onLogout={sair} role={role} />
  ) : (
    <Login
      onLogin={(r) => {
        setRole(r);
        setLogado(true);
      }}
    />
  );
}
