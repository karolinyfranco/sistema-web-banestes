import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Cliente } from "../types/Cliente";
import { Conta } from "../types/Conta";
import { Agencia } from "../types/Agencia";
import { fetchCSV } from "../services/fetchCSV";
import { parseCSV } from "../utils/parseCSV";
import MainLayout from "../components/layouts/MainLayout";
import { Col, Row, Table } from "react-bootstrap";

export function DetalhesCliente() {
  const { id } = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [agencia, setAgencia] = useState<Agencia | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        // Buscar clientes
        const csvClientes = await fetchCSV("https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=clientes");
        const todosClientes = parseCSV<Cliente>(csvClientes, (row) => ({
          id: row[0],
          cpfCnpj: row[1].replace(/^"|"$/g, "").replace(/\D/g, ""),
          rg: row[2]?.replace(/^"|"$/g, "") || undefined,
          dataNascimento: new Date(row[3]?.replace(/^"|"$/g, "")),
          nome: row[4].replace(/^"|"$/g, ""),
          nomeSocial: row[5] ? row[5].replace(/^"|"$/g, "") : undefined,
          email: row[6]?.replace(/^"|"$/g, ""),
          endereco: row[7]?.replace(/^"|"$/g, ""),
          rendaAnual: parseFloat(
            row[8]?.replace(/^"|"$/g, "").replace("R$ ", "").replace(".", "").replace(",", ".") || "0"
          ),
          patrimonio: parseFloat(
            row[9]?.replace(/^"|"$/g, "").replace(",", ".") || "0"
          ),
          estadoCivil: row[10]?.replace(/^"|"$/g, "") as Cliente["estadoCivil"],
          codigoAgencia: Number.isNaN(parseInt(row[11])) ? 0 : parseInt(row[11]?.replace(/^"|"$/g, "")),
        }));

        console.log("IDs disponíveis:", todosClientes.map(c => c.id));
        console.log("ID procurado:", id);

        const clienteEncontrado = todosClientes.find((c) => c.id === id);
        if (!clienteEncontrado) return;

        setCliente(clienteEncontrado);

        // Buscar contas
        const csvContas = await fetchCSV("https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=contas");
        const contasParseadas = parseCSV<Conta>(csvContas, (row) => ({
          id: row[0],
          cpfCnpjCliente: row[1].replace(/^"|"$/g, ""),
          tipo: row[2] as Conta["tipo"],
          saldo: parseFloat(row[3].replace(/^"|"$/g, "")),
          limiteCredito: parseFloat(row[4].replace(/^"|"$/g, "")),
          creditoDisponivel: parseFloat(row[5].replace(/^"|"$/g, "")),
        }));

        const contasDoCliente = contasParseadas.filter(
          (c) => c.cpfCnpjCliente === clienteEncontrado.cpfCnpj
        );
        setContas(contasDoCliente);

        // Buscar agência
        const csvAgencias = await fetchCSV("https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=agencias");
        const agenciasParseadas = parseCSV<Agencia>(csvAgencias, (row) => ({
          id: row[0],
          codigo: parseInt(row[1].replace(/^"|"$/g, "") || "0"),
          nome: row[2],
          endereco: row[3],
        }));

        const agenciaDoCliente = agenciasParseadas.find(
          (a) => a.codigo === clienteEncontrado.codigoAgencia
        );
        setAgencia(agenciaDoCliente ?? null);
      } catch (error) {
        console.error("Erro ao carregar detalhes do cliente:", error);
      }
    }

    carregarDados();
  }, [id]);

  if (!cliente) return <p>Carregando cliente...</p>;

  return (
    <MainLayout>
      <Row>
        <Col>
          <h1>Detalhes do Cliente</h1>
        </Col>

        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF/CNPJ</th>
                <th>RG</th>
                <th>Data de Nascimento</th>
                <th>Email</th>
                <th>Endereço</th>
                <th>Renda Anual</th>
                <th>Patrimônio</th>
                <th>Estado Civil</th>
                <th>Código Agência</th>
              </tr>
            </thead>
            <tbody>
              <tr key={cliente.id}>
                <td>{cliente.nome}</td>
                <td>{cliente.cpfCnpj}</td>
                <td>{cliente.rg}</td>
                <td>{cliente.dataNascimento.toLocaleDateString()}</td>
                <td>{cliente.email}</td>
                <td>{cliente.endereco}</td>
                <td>R$ {cliente.rendaAnual.toFixed(2)}</td>
                <td>R$ {cliente.patrimonio.toFixed(2)}</td>
                <td>{cliente.estadoCivil}</td>
                <td>{cliente.codigoAgencia}</td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>

      <Row>
        <Col>
          <h2>Contas</h2>
        </Col>

        <Col>
          <Table striped bordered hover>
            {contas.length > 0 ? (
              <>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Saldo</th>
                    <th>Limite de Crédito</th>
                    <th>Crédito Disponível</th>
                  </tr>
                </thead>
                <tbody>
                  {contas.map((conta) => (
                    <tr key={conta.id}>
                      <td>{conta.tipo}</td>
                      <td>R$ {conta.saldo.toFixed(2)}</td>
                      <td>R$ {conta.limiteCredito.toFixed(2)}</td>
                      <td>R$ {conta.creditoDisponivel.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={4} className="text-center">Nenhuma conta encontrada.</td>
                </tr>
              </tbody>
            )}
          </Table>
        </Col>
      </Row>

      <Row>
        <Col>
          <h2>Agência</h2>
        </Col>

        <Col>
          <Table striped bordered hover>
            {agencia ? (
              <>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Código</th>
                    <th>Endereço</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{agencia.nome}</td>
                    <td>{agencia.codigo}</td>
                    <td>{agencia.endereco}</td>
                  </tr>
                </tbody>
              </>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={3} className="text-center">Agência não encontrada.</td>
                </tr>
              </tbody>
            )}
          </Table>
        </Col>
      </Row>
    </MainLayout>
  );
}
