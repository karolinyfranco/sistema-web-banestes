import { useEffect, useState } from "react";
import { Cliente } from "../types/Cliente";
import { fetchCSV } from "../services/fetchCSV";
import { parseCSV } from "../utils/parseCSV";
import { Link } from "react-router-dom";
import MainLayout from "../components/layouts/MainLayout";
import { Button, Col, Form, Pagination, Row, Table } from "react-bootstrap";

export function ListaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [textoDigitado, setTextoDigitado] = useState("");
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

        setClientes(clientesParseados);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    }

    carregarClientes();
  }, []);

  useEffect(() => {
    setPaginaAtual(1);
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
    <MainLayout>
      <Row className="m-4 ">
        <Col>
          <h1>Lista de Clientes</h1>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={8}>
          <Form.Control
            type="text"
            placeholder="Digite o nome ou CPF/CNPJ do cliente"
            value={textoDigitado}
            onChange={(e) => setTextoDigitado(e.target.value)} />
        </Col>
        <Col md={4}>
          <Button
            variant="primary"
            className="w-100"
            onClick={() => setBusca(textoDigitado)}>
            Buscar
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Id</th>
                <th>Nome</th>
                <th>Email</th>
                <th>CPF/CNPJ</th>
              </tr>
            </thead>
            <tbody>
              {clientesPaginados.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.id}</td>
                  <td>
                    <Link to={`/cliente/${cliente.id}`}>
                      {cliente.nome}
                    </Link>
                  </td>
                  <td>{cliente.email}</td>
                  <td>{cliente.cpfCnpj}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Pagination className="justify-content-center">
        <Pagination.Prev
          onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
          disabled={paginaAtual === 1}>
          Anterior
        </Pagination.Prev>

        <Pagination.Item active>
          Página {paginaAtual} de {totalPaginas}
        </Pagination.Item>

        <Pagination.Next
          onClick={() => setPaginaAtual((p) => Math.min(p + 1, totalPaginas))}
          disabled={paginaAtual === totalPaginas}>
          Próxima
        </Pagination.Next>
      </Pagination>
    </MainLayout>
  );
}
