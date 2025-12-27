import { useState } from "react";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

 function entrar() {
  if (usuario === "admin" && senha === "1234") {
    localStorage.setItem("liontechcar_logado", "true");
    localStorage.setItem("liontechcar_role", "admin");
    onLogin("admin");
    return;
  }

  if (usuario === "user" && senha === "1234") {
    localStorage.setItem("liontechcar_logado", "true");
    localStorage.setItem("liontechcar_role", "user");
    onLogin("user");
    return;
  }

  setErro("Usuário ou senha inválidos");
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900">
      <div className="bg-black/60 p-6 rounded-xl w-full max-w-sm">
        <h1 className="text-2xl text-yellow-500 font-bold mb-4 text-center">
          LionTechCar
        </h1>

        <input
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full p-3 mb-3 rounded bg-neutral-800 text-white"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-3 mb-3 rounded bg-neutral-800 text-white"
        />

        {erro && (
          <p className="text-red-400 text-sm mb-2">{erro}</p>
        )}

        <button
          onClick={entrar}
          className="w-full bg-yellow-500 text-black font-bold p-3 rounded"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
