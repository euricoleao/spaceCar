import { useEffect, useState } from "react";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function fazerLogin() {
  const usuarios =
    JSON.parse(localStorage.getItem("liontechcar_usuarios")) || [];

  const encontrado = usuarios.find(
    (u) =>
      u.usuario === usuario.trim() &&
      u.senha === senha.trim()
  );

  if (!encontrado) {
    setErro("Usuário ou senha inválidos");
    return;
  }

  // salva sessão
  localStorage.setItem("liontechcar_logado", "true");
  localStorage.setItem("liontechcar_user", encontrado.usuario);
  localStorage.setItem("liontechcar_role", encontrado.role);

  onLogin(encontrado.role);
}


  // cria admin padrão se não existir
 useEffect(() => {
  const usuarios = JSON.parse(
    localStorage.getItem("liontechcar_usuarios")
  );

  if (!usuarios) {
    localStorage.setItem(
      "liontechcar_usuarios",
      JSON.stringify([
        { usuario: "admin", senha: "1234", role: "admin" }
      ])
    );
  }
}, []);



  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage:
      "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/bacgro.jpg')"}}>
        {/* uma imagem aqui */}
        <div className="absolute top-20 rounded-2xl left-0 w-full h-full opacity-50 bg-black">

          <img src="/card-2.jpg" alt="logo" className="rounded-2xl" />
        </div>
     

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
          onClick={fazerLogin}
          className="w-full bg-yellow-500 text-black font-bold p-3 rounded"
        >
          Entrar
        </button>
      </div>
    </div>
  );
}
