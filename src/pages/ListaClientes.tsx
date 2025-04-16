import { useEffect, useState } from "react";
import { Cliente } from "../types/Cliente";
import { fetchCSV } from "../services/fetchCSV";
import { parseCSV } from "../utils/parseCSV";

export function ListaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  useEffect(() => {
    async function carregarClientes() {
      try {
        const csv = await fetchCSV(
          "https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=clientes"
        );

        const clientesParseados = parseCSV<Cliente>(csv, (row) => ({
          id: row[0],
          cpfCnpj: row[1].replace(/^"|"$/g, ""),
          rg: row[2] || undefined,
          dataNascimento: new Date(row[3]),
          nome: row[4].replace(/^"|"$/g, ""),
          nomeSocial: row[5] ? row[5].replace(/^"|"$/g, "") : undefined,
          email: row[6],
          endereco: row[7],
          rendaAnual: parseFloat(row[8]),
          patrimonio: parseFloat(row[9]),
          estadoCivil: row[10] as Cliente["estadoCivil"],
          codigoAgencia: parseInt(row[11]),
        }));

        console.log(
          "Clientes carregados:",
          clientesParseados.map((c) => c.nome)
        );

        setClientes(clientesParseados);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    }

    carregarClientes();
  }, []);

  useEffect(() => {
    setPaginaAtual(1); // Voltar para a primeira página quando buscar algo
  }, [busca]);

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.cpfCnpj.includes(busca)
  );

  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = indiceInicial + itensPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Lista de Clientes</h1>

      <input
        type="text"
        placeholder="Buscar por nome ou CPF/CNPJ"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem",
          width: "100%",
          maxWidth: "400px",
        }}
      />

      <ul>
        {clientesPaginados.map((cliente) => (
          <li key={cliente.id}>
            {cliente.nome} - {cliente.cpfCnpj}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
          disabled={paginaAtual === 1}
          style={{ marginRight: "0.5rem" }}
        >
          Anterior
        </button>

        <span>
          Página {paginaAtual} de {totalPaginas}
        </span>

        <button
          onClick={() => setPaginaAtual((p) => Math.min(p + 1, totalPaginas))}
          disabled={paginaAtual === totalPaginas}
          style={{ marginLeft: "0.5rem" }}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
