import { useState } from 'react';

const STORAGE_KEY = 'liontechcar_pedidos';

export default function Carregamento({ onLogout }) {
  const [aba, setAba] = useState('cadastro');
  const [rotaSelecionada, setRotaSelecionada] = useState(null);

  const [pedidos, setPedidos] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [editIndex, setEditIndex] = useState(null);

  const [form, setForm] = useState({
    destino: '',
    rota: '',
    numero: '',
    nome: '',
    volume: '',
  });

  function salvarPedido() {
    if (
      !form.destino ||
      !form.rota ||
      !form.numero ||
      !form.nome ||
      !form.volume
    ) {
      alert('Preencha todos os campos');
      return;
    }

    const novo = {
      ...form,
      volume: parseFloat(form.volume.replace(',', '.')),
    };

    const lista = [...pedidos];

    if (editIndex !== null) {
      lista[editIndex] = novo;
      setEditIndex(null);
    } else {
      lista.push(novo);
    }

    setPedidos(lista);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    setForm({ destino: '', rota: '', numero: '', nome: '', volume: '' });
  }

  function editarPedido(index) {
    const p = pedidos[index];
    setForm({
      destino: p.destino,
      rota: p.rota,
      numero: p.numero,
      nome: p.nome,
      volume: p.volume.toString().replace('.', ','),
    });
    setEditIndex(index);
    setAba('cadastro');
  }

  function excluirPedido(index) {
    if (!confirm('Deseja excluir este pedido?')) return;
    const lista = pedidos.filter((_, i) => i !== index);
    setPedidos(lista);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  }

  function resumoPorDestino() {
    const mapa = {};

    pedidos.forEach((p) => {
      const destino = p.destino.trim().toUpperCase();
      const rota = p.rota.trim().toUpperCase();

      if (!mapa[destino]) mapa[destino] = {};
      if (!mapa[destino][rota]) mapa[destino][rota] = { qtd: 0, vol: 0 };

      mapa[destino][rota].qtd += 1;
      mapa[destino][rota].vol += p.volume;
    });

    return mapa;
  }

  function enviarWhatsApp() {
    let texto = '📦 RESUMO DE CARREGAMENTO\n\n';
    const resumo = resumoPorDestino();

    Object.entries(resumo).forEach(([destino, rotas]) => {
      texto += `Destino: ${destino}\n`;
      Object.entries(rotas).forEach(([rota, d]) => {
        texto += `${rota} — ${d.qtd} pedido(s) — ${d.vol
          .toFixed(2)
          .replace('.', ',')}\n`;
      });
      texto += '\n';
    });

    const total = pedidos.reduce((s, p) => s + p.volume, 0);
    texto += `Volume total: ${total.toFixed(2).replace('.', ',')}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-3">
      <header className="bg-neutral-900 text-yellow-500 p-4 rounded-xl mb-4 text-center relative ">
        <button
          onClick={onLogout}
          className="absolute right-0 top-1 w-8 h-8 flex items-center justify-center bg-red-500 text-white px-3 py-1 rounded text-xs"
        >
          Sair
        </button>
        <h1 className="text-xl font-bold">LionTechCar</h1>
        <p className="text-xs opacity-90 text-white">
          Controle de Carregamento
        </p>
      </header>

      <div className="flex mb-4 bg-white rounded-xl shadow">
        <button
          onClick={() => setAba('cadastro')}
          className={`flex-1 p-3 ${
            aba === 'cadastro' ? 'bg-blue-600 text-yellow-500' : ''
          }`}
        >
          Cadastro
        </button>
        <button
          onClick={() => setAba('resumo')}
          className={`flex-1 p-3 ${
            aba === 'resumo' ? 'bg-blue-600 text-yellow-500' : ''
          }`}
        >
          Resumo
        </button>
      </div>

      {aba === 'cadastro' && (
        <div className="bg-neutral-900 rounded-xl p-4 shadow space-y-3">
          <input
            placeholder="Destino"
            value={form.destino}
            onChange={(e) => setForm({ ...form, destino: e.target.value })}
            className="w-full p-3 border rounded"
          />
          <input
            placeholder="Cidade / Rota"
            value={form.rota}
            onChange={(e) => setForm({ ...form, rota: e.target.value })}
            className="w-full p-3 border rounded"
          />
          <input
            placeholder="Nº do Pedido"
            value={form.numero}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
            className="w-full p-3 border rounded"
          />
          <input
            placeholder="Nome do Pedido"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full p-3 border rounded"
          />
          <input
            placeholder="Volume (0,35)"
            value={form.volume}
            onChange={(e) => setForm({ ...form, volume: e.target.value })}
            className="w-full p-3 border rounded"
          />

          <button
            onClick={salvarPedido}
            className="w-full bg-green-600 text-white p-3 rounded font-bold"
          >
            {editIndex !== null ? 'Salvar Alteração' : 'Adicionar Pedido'}
          </button>
        </div>
      )}

      {aba === 'resumo' && (
        <div className="space-y-3 bg-neutral-950">
          <div className="bg-neutral-900 p-4 rounded-xl shadow">
            <h2 className="font-bold mb-2 text-yellow-500">Resumo Geral</h2>
            <p>
              <strong>Pedidos totais:</strong> {pedidos.length}
            </p>
            <p>
              <strong>Volume total:</strong>{' '}
              {pedidos
                .reduce((s, p) => s + p.volume, 0)
                .toFixed(2)
                .replace('.', ',')}
            </p>
          </div>

          <div className="bg-neutral-900 p-4 rounded-xl shadow">
            <h2 className="font-bold mb-2 text-yellow-500">Total por Cidade</h2>
            {Object.entries(resumoPorDestino()).map(([destino, rotas]) => {
              const totalCidade = Object.values(rotas).reduce(
                (s, r) => s + r.vol,
                0
              );
              const qtdCidade = Object.values(rotas).reduce(
                (s, r) => s + r.qtd,
                0
              );
              return (
                <p key={destino}>
                  {destino} — {qtdCidade} pedido(s) —{' '}
                  {totalCidade.toFixed(2).replace('.', ',')}
                </p>
              );
            })}
          </div>

          <div className="bg-neutral-900 p-4 rounded-xl shadow">
            <h2 className="font-bold mb-2 text-yellow-500">Total por Rotas</h2>
            {Object.entries(resumoPorDestino()).map(([destino, rotas]) => (
              <div key={destino} className="mb-2">
                <p className="font-semibold">{destino}</p>
                {Object.entries(rotas).map(([rota, d]) => (
                  <button
                    key={rota}
                    onClick={() => setRotaSelecionada({ destino, rota })}
                    className="block text-sm ml-2 text-blue-600 underline"
                  >
                    {rota} — {d.qtd} pedido(s) —{' '}
                    {d.vol.toFixed(2).replace('.', ',')}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {rotaSelecionada && (
            <div className="bg-neutral-800 p-4 rounded-xl shadow">
              <h2 className="font-bold mb-2 text-yellow-500">
                Pedidos de {rotaSelecionada.destino} / {rotaSelecionada.rota}
              </h2>
              {pedidos
                .filter(
                  (p) =>
                    p.destino.trim().toUpperCase() ===
                      rotaSelecionada.destino &&
                    p.rota.trim().toUpperCase() === rotaSelecionada.rota
                )
                .map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm border-b py-1"
                  >
                    <span>
                      {p.numero} - <span className='text-blue-700'>{p.nome}{' '}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        vol: {p.volume.toFixed(2).replace('.', ',')}
                      </span>
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => editarPedido(i)}
                        className="flex items-center justify-center text-red-600 text-lg w-8 h-8 ml-2"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => excluirPedido(i)}
                        className="flex items-center justify-center text-red-600 text-lg w-8 h-8"
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          <button
            onClick={enviarWhatsApp}
            className="w-full bg-green-500 text-white p-3 rounded-xl font-bold"
          >
            Enviar Resumo no <span className='text-green-400'>WhatsApp</span> 
          </button>
        </div>
      )}
    </div>
  );
}
