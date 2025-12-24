import { useState } from 'react';
import bgLogin from './assets/bg-login.jpg';

export default function Login({ onLogin }) {
  const [credenciais] = useState(() => {
    try {
      const salvas = localStorage.getItem('liontechcar_login');
      return salvas ? JSON.parse(salvas) : { usuario: '', senha: '' };
    } catch {
      return { usuario: '', senha: '' };
    }
  });

  const [login, setLogin] = useState({
    usuario: credenciais.usuario || '',
    senha: '',
  });

  const primeiraVez = !credenciais.usuario;

  function entrar() {
    if (primeiraVez) {
      if (!login.usuario || !login.senha) {
        alert('Preencha usuário e senha');
        return;
      }
      localStorage.setItem('liontechcar_login', JSON.stringify(login));
      onLogin();
    } else {
      if (
        login.usuario === credenciais.usuario &&
        login.senha === credenciais.senha
      ) {
        onLogin();
      } else {
        alert('Usuário ou senha inválidos');
      }
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgLogin})` }}
    >
      <div className="bg-white/20 p-6 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-bold text-center text-yellow-500">
          LionTechCar
        </h1>

        <input
          placeholder="Usuário"
          value={login.usuario}
          onChange={(e) => setLogin({ ...login, usuario: e.target.value })}
          className="w-full p-3 border-2 rounded mb-5 text-black"
        />

        <input
          type="password"
          placeholder="Senha"
          value={login.senha}
          onChange={(e) => setLogin({ ...login, senha: e.target.value })}
          className="   w-full p-3 border-2 rounded mb-5 text-black"
        />

        <button
          onClick={entrar}
          className="w-full  text-black text-2xl p-3 rounded font-bold"
        >
          {primeiraVez ? 'Criar Acesso' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}
