import { useMemo, useState } from 'react';
import { useRef } from 'react';

// Chaves de armazenamento local
const STORAGE_KEY = 'liontechcar_pedidos';
const STORAGE_ENVIADOS_KEY = 'liontechcar_pedidos_enviados';
const STORAGE_PRODUTOS_KEY = 'liontechcar_produtos';
const usuarioLogado = localStorage.getItem('liontechcar_user') || 'Usuário';

export default function Carregamento({ onLogout, role = 'user' }) {
  const isAdmin = role === 'admin';

  const [produtos, setProdutos] = useState(
    () => JSON.parse(localStorage.getItem('liontechcar_produtos')) || []
  );

  const [usuarios, setUsuarios] = useState(
    JSON.parse(localStorage.getItem('liontechcar_usuarios')) || []
  );

  const [novoUsuario, setNovoUsuario] = useState({
    usuario: '',
    senha: '',
    role: 'user',
  });

  const [aba, setAba] = useState('cadastro');
  const [rotaSelecionada, setRotaSelecionada] = useState(null);
  const listaRotasRef = useRef(null);
  const [dataLimpeza, setDataLimpeza] = useState('');
  const [pedidoAberto, setPedidoAberto] = useState(null);
  // const [voltarAberto, setVoltarAberto] = useState(null);

  // Itens do pedido

  const [codigoProduto, setCodigoProduto] = useState('');
  const [itensPedido, setItensPedido] = useState([]);
  const [produtoEncontrado, setProdutoEncontrado] = useState(null);
  const [quantidadeProduto, setQuantidadeProduto] = useState('');

  // Cadastro de produto
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [comprimento, setComprimento] = useState('');
  const [largura, setLargura] = useState('');
  const [altura, setAltura] = useState('');
  const [editandoCodigo, setEditandoCodigo] = useState(null);

  const [pedidos, setPedidos] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const volumeCalculado = useMemo(() => {
    if (!produtoEncontrado || !quantidadeProduto) return 0;

    return Number(produtoEncontrado.volume) * Number(quantidadeProduto);
  }, [produtoEncontrado, quantidadeProduto]);

  const [pedidosEnviados, setPedidosEnviados] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_ENVIADOS_KEY);
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

  function criarUsuario() {
    if (!novoUsuario.usuario || !novoUsuario.senha) {
      alert('Preencha usuário e senha');
      return;
    }

    if (usuarios.some((u) => u.usuario === novoUsuario.usuario)) {
      alert('Usuário já existe');
      return;
    }

    const lista = [...usuarios, novoUsuario];
    setUsuarios(lista);

    localStorage.setItem('liontechcar_usuarios', JSON.stringify(lista));

    setNovoUsuario({ usuario: '', senha: '', role: 'user' });
  }
  // BUSCAR PRODUTO POR CÓDIGO
  function salvarProduto() {
    if (!codigo || !descricao || !comprimento || !largura || !altura) {
      alert('Preencha todos os campos');
      return;
    }

    const volume = Number(comprimento) * Number(largura) * Number(altura);

    const novoProduto = {
      codigo,
      descricao,
      comprimento: Number(comprimento),
      largura: Number(largura),
      altura: Number(altura),
      volume,
    };

    let listaAtualizada;

    if (editandoCodigo) {
      // ✏️ EDITAR
      listaAtualizada = produtos.map((p) =>
        p.codigo === editandoCodigo ? novoProduto : p
      );
    } else {
      // ➕ NOVO
      const existe = produtos.some((p) => p.codigo === codigo);
      if (existe) {
        alert('Código já cadastrado');
        return;
      }
      listaAtualizada = [...produtos, novoProduto];
    }

    setProdutos(listaAtualizada);
    localStorage.setItem(
      'liontechcar_produtos',
      JSON.stringify(listaAtualizada)
    );

    limparFormulario();
  }

  function editarProduto(produto) {
    setCodigo(produto.codigo);
    setDescricao(produto.descricao);
    setComprimento(produto.comprimento);
    setLargura(produto.largura);
    setAltura(produto.altura);

    setEditandoCodigo(produto.codigo);
  }

  function limparFormulario() {
    setCodigo('');
    setDescricao('');
    setComprimento('');
    setLargura('');
    setAltura('');
    setEditandoCodigo(null);
  }

  function salvarPedido() {
    if (!form.destino || !form.rota || !form.numero || !form.nome) {
      alert('Preencha todos os campos');
      return;
    }

    if (itensPedido.length === 0) {
      alert('Adicione ao menos um item');
      return;
    }

    const volumeFinal = itensPedido.reduce(
      (soma, item) => soma + Number(item.volumeTotal || 0),
      0
    );

    const novo = {
      ...form,
      volume: volumeFinal,
      itens: itensPedido,
    };

    const lista = [...pedidos];

    if (editIndex !== null) {
      // 🔄 ATUALIZA pedido existente
      lista[editIndex] = novo;
    } else {
      // ➕ NOVO pedido
      lista.push(novo);
    }

    setPedidos(lista);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    alert('Pedido salvo com sucesso');

    // limpar formulário
    setForm({
      destino: '',
      rota: '',
      numero: '',
      nome: '',
      volume: '',
    });

    // limpar itens do pedido
    setItensPedido([]);

    // limpar produto em edição
    setProdutoEncontrado(null);
    setQuantidadeProduto('');
    setCodigoProduto('');

    // sair do modo edição
    setEditIndex(null);
  }

  function scrollCima() {
    listaRotasRef.current?.scrollBy({ top: -80, behavior: 'smooth' });
  }

  function scrollBaixo() {
    listaRotasRef.current?.scrollBy({ top: 80, behavior: 'smooth' });
  }

  // criar função para limparar e sair do modo edição
  function cancelarEdicao() {
    // limpar formulário
    setForm({
      destino: '',
      rota: '',
      numero: '',
      nome: '',
      volume: '',
    });
    // limpar itens do pedido
    setItensPedido([]);
    // limpar produto em edição
    setProdutoEncontrado(null);
    setQuantidadeProduto('');
    setCodigoProduto('');
    // sair do modo edição
    setEditIndex(null);
  }

  function editarPedidoPorNumero(numero) {
    const p = pedidos.find((p) => p.numero === numero);
    if (!p) return;

    setForm({
      destino: p.destino,
      rota: p.rota,
      numero: p.numero,
      nome: p.nome,
      volume: p.volume.toString().replace('.', ','),
    });

    const indexReal = pedidos.findIndex((p) => p.numero === numero);
    setEditIndex(indexReal);
    setAba('cadastro');
  }

  function enviarPedido(numeroPedido) {
    const pedido = pedidos.find((p) => p.numero === numeroPedido);
    if (!pedido) return;

    // remove da lista ativa
    const novaLista = pedidos.filter((p) => p.numero !== numeroPedido);
    setPedidos(novaLista);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));

    // garante todos os campos importantes
    const pedidoEnviado = {
      numero: pedido.numero,
      nome: pedido.nome,
      destino: pedido.destino || '—',
      rota: pedido.rota || '',
      volume: Number(pedido.volume) || 0,
      enviadoEm: new Date().toISOString(),
    };

    const enviadosAtualizados = [pedidoEnviado, ...pedidosEnviados];

    setPedidosEnviados(enviadosAtualizados);
    localStorage.setItem(
      STORAGE_ENVIADOS_KEY,
      JSON.stringify(enviadosAtualizados)
    );
  }

  function buscarProdutoPorCodigo(codigo) {
    const produto = produtos.find((p) => p.codigo === codigo);

    if (!produto) {
      setProdutoEncontrado(null);
      return;
    }

    setProdutoEncontrado(produto);
  }

  function adicionarItemPedido() {
    if (!produtoEncontrado || !quantidadeProduto) {
      alert('Produto ou quantidade inválidos');
      return;
    }

    const quantidade = Number(quantidadeProduto);

    const volumeUnitario =
      produtoEncontrado.comprimento *
      produtoEncontrado.largura *
      produtoEncontrado.altura;

    const item = {
      codigo: produtoEncontrado.codigo,
      descricao: produtoEncontrado.descricao,
      quantidade,
      volumeUnitario,
      volumeTotal: volumeUnitario * quantidade,
    };

    setItensPedido([...itensPedido, item]);

    setCodigoProduto('');
    setQuantidadeProduto('');
    setProdutoEncontrado(null);
  }

  function removerProduto(codigo) {
    if (!confirm('Deseja remover este produto?')) return;

    const lista = produtos.filter((p) => p.codigo !== codigo);

    setProdutos(lista);
    localStorage.setItem('liontechcar_produtos', JSON.stringify(lista));
  }

  function excluirDefinitivo(numeroPedido) {
    if (!confirm('Excluir este pedido permanentemente?')) return;

    const novaLista = pedidosEnviados.filter((p) => p.numero !== numeroPedido);

    setPedidosEnviados(novaLista);
    localStorage.setItem(STORAGE_ENVIADOS_KEY, JSON.stringify(novaLista));
  }

  function limparRelatoriosPorData(dataLimite) {
    if (!dataLimite) {
      alert('Selecione uma data');
      return;
    }

    const limite = new Date(dataLimite);

    const filtrados = pedidosEnviados.filter((p) => {
      if (!p.enviadoEm) return false;
      return new Date(p.enviadoEm) >= limite;
    });

    const removidos = pedidosEnviados.length - filtrados.length;

    if (removidos === 0) {
      alert('Nenhum relatório para remover nessa data');
      return;
    }

    if (!confirm(`Deseja remover ${removidos} pedido(s) antigos?`)) return;

    setPedidosEnviados(filtrados);
    localStorage.setItem(STORAGE_ENVIADOS_KEY, JSON.stringify(filtrados));
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

  function limparTodosRelatorios() {
    if (!Array.isArray(pedidosEnviados) || pedidosEnviados.length === 0) {
      alert('Não há relatórios para apagar');
      return;
    }

    const confirmar = window.confirm(
      '⚠️ Tem certeza que deseja apagar TODOS os relatórios enviados?'
    );
    if (!confirmar) return;

    const confirmar2 = window.confirm(
      '❗ Esta ação NÃO poderá ser desfeita. Confirmar novamente?'
    );
    if (!confirmar2) return;

    setPedidosEnviados([]);
    localStorage.removeItem(STORAGE_ENVIADOS_KEY);
  }

  function removerItem(index) {
    setItensPedido((prev) => prev.filter((_, i) => i !== index));
  }

  function buscarPedidoPorNumero() {
    const pedido = pedidos.find((p) => p.numero === form.numero);

    if (!pedido) {
      alert('Pedido não encontrado');
      return;
    }

    // carregar dados do pedido
    setForm({
      destino: pedido.destino,
      rota: pedido.rota,
      numero: pedido.numero,
      nome: pedido.nome,
      volume: pedido.volume,
    });

    // carregar itens
    setItensPedido(pedido.itens || []);
  }

  function editarItem(index) {
    const item = itensPedido[index];

    setProdutoEncontrado({
      codigo: item.codigo,
      descricao: item.descricao,
      volume: item.volumeUnitario,
    });

    setQuantidadeProduto(item.quantidade);
    setCodigoProduto(item.codigo);
  }

  return (
    <div className="min-h-screen w-full max-w-full bg-neutral-950 p-3 overflow-y-auto">
      {/* ESTA É A HEADER */}
      <header className="fixed top-1 mb left-0 right-0 z-50 bg-neutral-900 text-yellow-500 p-4 text-center">
        <button
          onClick={onLogout}
          className="absolute right-3 top-3 w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded text-xs"
        >
          Sair
        </button>
        <p className="text-white text-xs">
          Logado como: <span className="font-semibold">{usuarioLogado}</span>
        </p>

        <h1 className="text-3xl font-bold">LionTechCar</h1>
        <p className="text-xs opacity-90 text-white">
          Controle de Carregamento
        </p>
      </header>
      {/* FIM DA HEADER */}

      <div className="h-20 mt-3"></div>

      <div className="flex mb-4 bg-neutral-800 rounded-xl  text-white shadow overflow-hidden mt-2 gap-1">
        {/* Botão de Cadastro */}
        <button
          onClick={() => setAba('cadastro')}
          className={`flex-1 p-3 ${
            aba === 'cadastro'
              ? 'bg-neutral-900 text-yellow-500 rounded-2xl border-2'
              : 'boxshadow  border-1 rounded-2xl text-stone-500'
          }`}
        >
          Cadastro
        </button>

        {/* Botão de Resumo */}
        <button
          onClick={() => setAba('resumo')}
          className={`flex-1 p-3 ${
            aba === 'resumo'
              ? 'bg-neutral-900 text-yellow-500 rounded-2xl border-2'
              : 'boxshadow  border-1 rounded-2xl text-stone-500'
          }`}
        >
          Ativos
        </button>

        {/* Botão de Enviados */}
        <button
          onClick={() => setAba('enviados')}
          className={`flex-1 p-3 ${
            aba === 'enviados'
              ? 'bg-neutral-900 text-yellow-500 rounded-2xl border-2'
              : 'boxshadow  border-1 rounded-2xl text-stone-500'
          }`}
        >
          Enviados
        </button>

        {/* Botão de Relatório */}
        <button
          onClick={() => setAba('relatorios')}
          className={`flex-1 p-3 ${
            aba === 'relatorios'
              ? 'bg-neutral-900 text-yellow-500 rounded-2xl border-2'
              : 'boxshadow  border-1 rounded-2xl text-stone-500'
          }`}
        >
          Relatórios
        </button>
      </div>
      {/* segunda parte dos botoes */}
      <div className="flex mb-4 bg-neutral-800 rounded-xl text-white shadow overflow-hidden  justify-between">
        {/* Botão de Produtos */}
        <button
          onClick={() => setAba('produtos')}
          className={`px-3 py-1 rounded ${
            aba === 'produtos'
              ? 'bg-neutral-900 text-yellow-500 rounded-2xl border-2'
              : 'boxshadow  border-1 rounded-2xl text-stone-500 '
          }`}
        >
          Produtos
        </button>
        <h1 className="ml-4 mt-2 text-yellow-500">
          {' '}
          Bem vindo !
        </h1>
        {/* Botão de Resumo */}
        {isAdmin && (
          <button
            onClick={() => setAba('usuarios')}
            className={`flex-1 p-3 mr-1 max-w-[90px] ${
              aba === 'usuarios'
                ? 'bg-neutral-900 text-yellow-500 rounded-2xl border-2'
                : 'boxshadow  border-1 rounded-2xl text-stone-500'
            }`}
          >
            Usuários
          </button>
        )}
      </div>

      {aba === 'cadastro' && (
        <div className="bg-neutral-900 rounded-xl p-4 shadow space-y-3 text-gray-400">
          <input
            placeholder="Número do pedido"
            value={form.numero}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
            className="w-[165px] mr-3 p-3 border rounded "
          />

          <button
            onClick={buscarPedidoPorNumero}
            className="text-green-600 border-2 border-green-600 px-3 py-2 rounded-2xl font-bold hover:bg-green-600 hover:text-white transition-colors"
          >
            Buscar pedido
          </button>

          <input
            placeholder="Destino"
            value={form.destino}
            onChange={(e) => setForm({ ...form, destino: e.target.value })}
            className="w-full p-3 border rounded "
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

          {/* Produto por código */}

          <h2 className="text-yellow-500 text-sm font-bold">Produto</h2>

          <input
            placeholder="Código do Produto"
            value={codigoProduto}
            onChange={(e) => {
              setCodigoProduto(e.target.value);
              buscarProdutoPorCodigo(e.target.value);
            }}
            className="w-full p-2 rounded border bg-neutral-900"
          />

          <input
            placeholder="Nome do Produto"
            value={produtoEncontrado ? produtoEncontrado.descricao : ''}
            onChange={(e) => {
              setCodigoProduto(e.target.value);
              buscarProdutoPorCodigo(e.target.value);
            }}
            className="w-full p-2 rounded border bg-neutral-900"
          />

          <input
            type="number"
            min="1"
            placeholder="Quantidade"
            value={quantidadeProduto}
            onChange={(e) => setQuantidadeProduto(e.target.value)}
            className="w-full p-2 rounded border bg-neutral-900 "
          />

          {produtoEncontrado && (
            <p className="text-green-400 text-sm">
              Volume unitário:{' '}
              {(
                produtoEncontrado.comprimento *
                produtoEncontrado.largura *
                produtoEncontrado.altura
              ).toFixed(3)}{' '}
              m³
            </p>
          )}

          <input
            placeholder="Volume (m³)"
            value={volumeCalculado.toFixed(3)}
            disabled
            className="w-full p-1 rounded border bg-neutral-900 text-white"
          />

          <button
            onClick={adicionarItemPedido}
            className="w-full bg-blue-800 text-white p-1 rounded mt-2"
          >
            ➕ Adicionar produto
          </button>

          <button
            onClick={salvarPedido}
            className="w-full bg-neutral-800 text-yellow-500 p-3 rounded font-bold"
          >
            {editIndex !== null ? 'Salvar Alteração' : 'Adicionar Pedido'}
          </button>

          {/* button limpar e sair do modo edição  */}
          {editIndex !== null && (
            <button
              onClick={cancelarEdicao}
              className="w-full bg-red-600 text-white p-2 rounded"
            >
              🔄 Cancelar Edição
            </button>
          )}

          {/* ===== AQUI COMEÇA A LISTA DE ITENS DO PEDIDO ===== */}
          {itensPedido.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-yellow-500 font-semibold text-sm">
                Itens do pedido
              </p>
              {itensPedido.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-6 text-xs bg-neutral-800 text-white rounded px-2 py-1 gap-1"
                >
                  <span className="truncate col-span-2">{item.descricao}</span>
                  <span className="text-center">{item.quantidade}</span>
                  <span className="text-right">
                    {Number(item.volumeUnitario || 0)
                      .toFixed(2)
                      .replace('.', ',')}
                  </span>
                  <span className="text-right">
                    {Number(item.volumeTotal || 0)
                      .toFixed(2)
                      .replace('.', ',')}
                  </span>

                  {/* EDITAR */}
                  <button
                    onClick={() => editarItem(i)}
                    className="text-yellow-400"
                  >
                    ✏️
                  </button>

                  {/* REMOVER */}
                  <button
                    onClick={() => removerItem(i)}
                    className="text-red-400"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {aba === 'produtos' && (
        <div className="bg-neutral-900 p-4 rounded-xl gap-1 space-y-3 shadow">
          <h2 className="text-yellow-500 font-bold mb-2">
            Cadastro de Produtos
          </h2>

          <input
            placeholder="Código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="w-full p-2 rounded border bg-neutral-900 text-white "
          />

          <input
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full p-2 rounded border bg-neutral-900 text-white"
          />

          <input
            placeholder="Comprimento (m)"
            value={comprimento}
            onChange={(e) => setComprimento(e.target.value)}
            className="w-full p-2 rounded border bg-neutral-900 text-white"
          />

          <input
            placeholder="Largura (m)"
            value={largura}
            onChange={(e) => setLargura(e.target.value)}
            className="w-full p-2 rounded border bg-neutral-900 text-white"
          />

          <input
            placeholder="Altura (m)"
            value={altura}
            onChange={(e) => setAltura(e.target.value)}
            className="w-full p-2 rounded border bg-neutral-900 text-white"
          />

          <button
            onClick={salvarProduto}
            className="w-full bg-yellow-500 text-black font-bold p-2 rounded"
          >
            Salvar produto
          </button>

          {produtos.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-yellow-500 font-semibold text-sm">
                Produtos cadastrados
              </p>

              {produtos.map((p, i) => (
                <div
                  key={i}
                  className="grid grid-cols-6 text-xs bg-neutral-800 text-white rounded px-2 py-1 gap-1"
                >
                  <span>{p.codigo}</span>
                  <span className="col-span-2 truncate">{p.descricao}</span>
                  <span>{p.volume.toFixed(3)}</span>

                  <button
                    onClick={() => editarProduto(p)}
                    className="text-yellow-400"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => removerProduto(p.codigo)}
                    className="text-red-400"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {aba === 'resumo' && (
        <div className="space-y-3 bg-neutral-950">
          <div className="bg-neutral-900 p-4 rounded-xl shadow">
            <h2 className="font-bold mb-2 text-yellow-500">Resumo Geral</h2>
            <p className="text-white">
              <strong>Pedidos totais:</strong> {pedidos.length}
            </p>
            <p className="text-white">
              <strong>Volume total:</strong>{' '}
              {pedidos
                .reduce((s, p) => s + p.volume, 0)
                .toFixed(2)
                .replace('.', ',')}
            </p>
          </div>

          {/* TOTAL POR CIDADE */}
          <div className="bg-neutral-900 p-4 rounded-xl shadow">
            <h2 className="font-bold mb-3 text-yellow-500">Total por Cidade</h2>

            {/* Cabeçalho da tabela */}
            <div className="grid grid-cols-3 text-xs font-semibold text-gray-300 border-b border-neutral-700 pb-1 mb-2">
              <span>Cidade</span>
              <span className="text-center">Pedidos</span>
              <span className="text-right">Volume</span>
            </div>

            {/* Linhas com scroll */}
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
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
                  <div
                    key={destino}
                    className="grid grid-cols-3 items-center bg-neutral-800 rounded px-2 py-1 text-sm"
                  >
                    <span className="text-white truncate">{destino}</span>
                    <span className="text-center text-white">{qtdCidade}</span>
                    <span className="text-right text-white">
                      {totalCidade.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-neutral-900 p-4 rounded-xl shadow">
            {/* Título + setinhas */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-yellow-500">Total por Rotas</h2>

              <div className="flex gap-2">
                <button
                  onClick={scrollCima}
                  className="w-7 h-7 flex items-center justify-center bg-neutral-800 text-white rounded"
                >
                  ↑
                </button>
                <button
                  onClick={scrollBaixo}
                  className="w-7 h-7 flex items-center justify-center bg-neutral-800 text-white rounded"
                >
                  ↓
                </button>
              </div>
            </div>

            {/* Cabeçalho da tabela */}
            <div className="grid grid-cols-3 text-xs font-semibold text-gray-300 border-b border-neutral-700 pb-1 mb-1">
              <span>Rota</span>
              <span className="text-center">Pedidos</span>
              <span className="text-right  mr-2">Volume</span>
            </div>

            {/* Corpo da tabela */}
            <div
              ref={listaRotasRef}
              className="max-h-48 overflow-y-auto no-scrollbar space-y-1 pr-1"
            >
              {Object.entries(resumoPorDestino()).map(([destino, rotas]) => (
                <div key={destino}>
                  {/* Nome da cidade */}
                  <div className="text-yellow-400 text-xs font-semibold mt-2 ">
                    {destino}
                  </div>

                  {Object.entries(rotas).map(([rota, d]) => (
                    <button
                      key={rota}
                      onClick={() => setRotaSelecionada({ destino, rota })}
                      className="grid  items-center bg-neutral-800 hover:bg-neutral-700 rounded px-2 py-1 text-sm  mb-2"
                      style={{ gridTemplateColumns: '140px 60px 130px' }}
                    >
                      <span className="truncate text-left text-blue-400">
                        {rota}
                      </span>
                      <span className="text-center text-white ">{d.qtd}</span>{' '}
                      {/* pedidos */}
                      <span className="text-right text-white ">
                        {d.vol.toFixed(2).replace('.', ',')}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {rotaSelecionada && (
            <div className="bg-neutral-800 p-4 rounded-xl shadow ">
              <h2 className="font-bold mb-2 text-yellow-500">
                Pedidos de {rotaSelecionada.destino} / {rotaSelecionada.rota}
              </h2>
              <div className="max-h-30 overflow-y-auto no-scrollbar space-y-2 mb-4 flex flex-col">
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
                      className="flex flex-col items-center  text-sm border-b py-1"
                    >
                      <span className="text-white">
                        <button
                          onClick={() =>
                            setPedidoAberto(pedidoAberto === i ? null : i)
                          }
                          className="w-full text-left bg-neutral-800 hover:bg-neutral-700 rounded px-3 py-2"
                        >
                          <div className="flex flex-row justify-between items-center">
                            <span className="text-white font-semibold">
                              {p.numero} -{' '}
                              <span className="text-blue-400">{p.nome}</span>
                            </span>

                            <span className="text-xs text-gray-400">
                              vol:{' '}
                              {Number(p.volume || 0)
                                .toFixed(3)
                                .replace('.', ',')}
                            </span>
                          </div>
                        </button>
                      </span>
                      <div>
                        {pedidoAberto === i &&
                          p.itens &&
                          p.itens.length > 0 && (
                            <div className="ml-4 mt-2 bg-neutral-900 rounded-lg p-2">
                              {/* Cabeçalho */}
                              <div className="grid grid-cols-4 text-[11px] text-gray-400 border-b border-neutral-700 pb-1 mb-1">
                                <span>Produto</span>
                                <span className="text-center">Qtde</span>
                                <span className="text-right">Vol. Unit</span>
                                <span className="text-right">Vol. Total</span>
                              </div>

                              {/* Lista de itens */}
                              <div className="max-h-40 overflow-y-auto space-y-1 ">
                                {p.itens.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="grid grid-cols-4 items-center text-xs bg-neutral-800 text-white rounded px-2 py-1"
                                  >
                                    <span className="truncate">
                                      {item.descricao}
                                    </span>

                                    <span className="text-center">
                                      {item.quantidade}
                                    </span>

                                    <span className="text-right">
                                      {Number(item.volumeUnitario || 0)
                                        .toFixed(3)
                                        .replace('.', ',')}
                                    </span>

                                    <span className="text-right font-semibold text-yellow-500">
                                      {Number(item.volumeTotal || 0)
                                        .toFixed(3)
                                        .replace('.', ',')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => editarPedidoPorNumero(p.numero)}
                          className="flex items-center justify-center text-red-600 text-lg w-8 h-8 ml-2"
                          title="Editar"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => enviarPedido(p.numero)}
                          className="text-green-500"
                        >
                          ✔
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <button
            onClick={enviarWhatsApp}
            className="w-full bg-neutral-800 text-white p-3 rounded-xl font-bold"
          >
            Enviar Resumo no <span className="text-green-400">WhatsApp</span>
          </button>
        </div>
      )}

      {aba === 'enviados' && (
        <div className="bg-neutral-900 p-4 rounded-xl shadow space-y-2">
          <h2 className="font-bold text-yellow-500 mb-3">Pedidos Enviados</h2>

          {pedidosEnviados.length === 0 && (
            <p className="text-gray-400 text-sm">
              Nenhum pedido enviado ainda.
            </p>
          )}

          {/* Cabeçalho */}
          {pedidosEnviados.length > 0 && (
            <div className="grid grid-cols-5 text-xs font-semibold text-gray-400 border-b border-neutral-700 pb-1">
              <span>Pedido</span>
              <span>Cidade</span>
              <span className="text-center">Volume</span>
              <span className="text-center">Data</span>
              <span className="text-right">Ação</span>
            </div>
          )}

          {/* Linhas */}
          {pedidosEnviados.map((p, i) => (
            <div
              key={i}
              className="grid grid-cols-5 items-center bg-neutral-800 rounded px-2 py-2 text-sm text-white"
            >
              <span className="truncate">
                {p.numero} - {p.nome}
              </span>

              <span className="truncate text-center">{p.destino}</span>

              <span className="text-center">
                {Number(p.volume || 0)
                  .toFixed(2)
                  .replace('.', ',')}
              </span>

              <span className="text-center text-xs text-gray-300">
                {p.enviadoEm
                  ? new Date(p.enviadoEm).toLocaleDateString('pt-BR')
                  : '--'}
              </span>

              {/* Lixeira definitiva */}
              <button
                onClick={() => excluirDefinitivo(p.numero)}
                className="text-red-500 text-right"
                title="Excluir definitivamente"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {aba === 'relatorios' && (
        <div className="bg-neutral-900 p-4 rounded-xl shadow space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="date"
              onChange={(e) => setDataLimpeza(e.target.value)}
              className="bg-neutral-800 text-white text-sm px-2 py-1 rounded"
            />

            <button
              onClick={() => limparRelatoriosPorData(dataLimpeza)}
              className="bg-orange-600  text-white px-3 py-1 rounded text-sm w-[100px]"
            >
              Limpar por data
            </button>

            <button
              onClick={limparTodosRelatorios}
              className="bg-red-700  text-white px-3 py-1 rounded text-sm"
            >
              Limpar tudo
            </button>
          </div>

          <h2 className="font-bold text-yellow-500 mb-3">
            Relatório de Pedidos Enviados
          </h2>

          {/* Cabeçalho */}
          <div className="grid grid-cols-4 text-xs font-semibold text-gray-300 border-b border-neutral-700 pb-1">
            <span>Pedido</span>
            <span className="text-center">Cidade</span>
            <span className="text-center">Volume</span>
            <span className="text-right">Data</span>
          </div>

          {pedidosEnviados.length === 0 && (
            <p className="text-gray-400 text-sm mt-2">Nenhum pedido enviado.</p>
          )}

          {/* Linhas */}
          <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-hide">
            {pedidosEnviados.map((p, i) => (
              <div
                key={i}
                className="grid grid-cols-4 items-center bg-neutral-800 rounded px-2 py-1 text-sm"
              >
                <span className="text-white truncate">
                  {p.numero} - {p.nome}
                </span>

                <span className="text-center text-white">
                  {p.destino || '—'}
                </span>

                <span className="text-center text-white">
                  {Number(p.volume || 0)
                    .toFixed(2)
                    .replace('.', ',')}
                </span>

                <span className="text-right text-white text-xs">
                  {p.enviadoEm
                    ? new Date(p.enviadoEm).toLocaleDateString('pt-BR')
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {aba === 'usuarios' && isAdmin && (
        <div className="bg-neutral-900 p-4 rounded-xl space-y-3">
          <h2 className="text-yellow-500 font-bold">Criar Usuário</h2>

          <input
            placeholder="Usuário"
            value={novoUsuario.usuario}
            onChange={(e) =>
              setNovoUsuario({ ...novoUsuario, usuario: e.target.value })
            }
            className="w-full p-2 rounded bg-neutral-800 text-white"
          />

          <input
            placeholder="Senha"
            type="password"
            value={novoUsuario.senha}
            onChange={(e) =>
              setNovoUsuario({ ...novoUsuario, senha: e.target.value })
            }
            className="w-full p-2 rounded bg-neutral-800 text-white"
          />

          <select
            value={novoUsuario.role}
            onChange={(e) =>
              setNovoUsuario({ ...novoUsuario, role: e.target.value })
            }
            className="w-full p-2 rounded bg-neutral-800 text-white"
          >
            <option value="user">Usuário</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={criarUsuario}
            className="w-full bg-yellow-500 text-black font-bold p-2 rounded"
          >
            Criar Usuário
          </button>
        </div>
      )}
    </div>
  );
}
