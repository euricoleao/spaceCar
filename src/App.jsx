import { useState, useEffect } from "react";
import Login from "./Login";
import Carregamento from "./Carregamento";

export default function App() {
  const [logado, setLogado] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
  const ok = localStorage.getItem("liontechcar_logado");
  const r = localStorage.getItem("liontechcar_role");

  if (ok === "true" && r) {
    setLogado(true);
    setRole(r);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  
}, []);


  function sair() {
    localStorage.removeItem("liontechcar_logado");
    localStorage.removeItem("liontechcar_role");
    setLogado(false);
    setRole(null);
  }

  return logado ? (
    <Carregamento onLogout={sair} role={role} />
  ) : (
    <Login onLogin={(r) => {
      setRole(r);
      setLogado(true);
    }} />
  );
}
