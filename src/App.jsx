import { useState } from "react";
import Login from "./Login";
import Carregamento from "./Carregamento";

export default function App() {
  const [logado, setLogado] = useState(false);

  return logado ? (
    <Carregamento onLogout={() => setLogado(false)} />
  ) : (
    <Login onLogin={() => setLogado(true)} />
  );
}
