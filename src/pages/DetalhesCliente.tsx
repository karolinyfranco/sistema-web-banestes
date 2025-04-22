import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Cliente } from "../types/Cliente";
import { Conta } from "../types/Conta";
import { Agencia } from "../types/Agencia";
import { fetchCSV } from "../services/fetchCSV";
import { parseCSV } from "../utils/parseCSV";
import MainLayout from "../components/MainLayout";
import { Card, Col, Container, ListGroup, Row, Spinner } from "react-bootstrap";

export function DetalhesCliente() {
  const { id } = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [contas, setContas] = useState<Conta[]>([]);
  const [agencia, setAgencia] = useState<Agencia | null>(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        const csvClientes = await fetchCSV("https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=clientes");
        const todosClientes = parseCSV<Cliente>(csvClientes, (row) => ({
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

        const clienteEncontrado = todosClientes.find((c) => c.id === id);
        if (!clienteEncontrado) return;

        setCliente(clienteEncontrado);

        const csvContas = await fetchCSV("https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=contas");
        const contasParseadas = parseCSV<Conta>(csvContas, (row) => ({
          id: row[0],
          cpfCnpjCliente: row[1].replace(/^"|"$/g, ""),
          tipo: row[2] as Conta["tipo"],
          saldo: parseFloat(row[3]),
          limiteCredito: parseFloat(row[4]),
          creditoDisponivel: parseFloat(row[5]),
        }));

        const contasDoCliente = contasParseadas.filter(
          (c) => c.cpfCnpjCliente === clienteEncontrado.cpfCnpj
        );
        setContas(contasDoCliente);

        const csvAgencias = await fetchCSV("https://docs.google.com/spreadsheets/d/1PBN_HQOi5ZpKDd63mouxttFvvCwtmY97Tb5if5_cdBA/gviz/tq?tqx=out:csv&sheet=agencias");
        const agenciasParseadas = parseCSV<Agencia>(csvAgencias, (row) => ({
          id: row[0],
          codigo: parseInt(row[1]),
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

  if (!cliente) return (
    <Container fluid className="d-flex justify-content-center">
      <Row>
        <Col>
          <Spinner animation="border" role="status" variant="dark" />
          <span>Carregando cliente...</span>
        </Col>
      </Row>
    </Container>);

  return (
    <MainLayout>
      <Row className="w-100 text-center mx-0">
        <Col>
          <h1 className="m-4">Detalhes do Cliente</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Header>Informações do Cliente</Card.Header>
            <Card.Body>
              <ListGroup className="list-group-flush">
                <ListGroup.Item><strong>Nome:</strong> {cliente.nome}</ListGroup.Item>
                <ListGroup.Item><strong>CPF/CNPJ:</strong> {cliente.cpfCnpj}</ListGroup.Item>
                <ListGroup.Item><strong>RG:</strong> {cliente.rg || '-'}</ListGroup.Item>
                <ListGroup.Item><strong>Data de Nascimento:</strong> {cliente.dataNascimento ? new Date(cliente.dataNascimento).toLocaleDateString() : '-'}</ListGroup.Item>
                <ListGroup.Item><strong>Email:</strong> {cliente.email}</ListGroup.Item>
                <ListGroup.Item><strong>Endereço:</strong> {cliente.endereco}</ListGroup.Item>
                <ListGroup.Item><strong>Estado Civil:</strong> {cliente.estadoCivil}</ListGroup.Item>
                <ListGroup.Item><strong>Renda Anual:</strong> R$ {cliente.rendaAnual.toFixed(2)}</ListGroup.Item>
                <ListGroup.Item><strong>Patrimônio:</strong> R$ {cliente.patrimonio.toFixed(2)}</ListGroup.Item>
                <ListGroup.Item><strong>Código Agência:</strong> {cliente.codigoAgencia}</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <h2 className="m-4 w-100 text-center mx-0">Contas</h2>
          <Card className="mb-4">
            <Card.Header>Contas do Cliente</Card.Header>
            <Card.Body>
              {contas.length > 0 ? (
                contas.map((conta) => (
                  <div key={conta.id} className="mb-4 pb-2 border-bottom">
                    <h5 className="text-capitalize">{conta.tipo}</h5>
                    <ListGroup className="list-group-flush">
                      <ListGroup.Item><strong>Saldo:</strong> R$ {conta.saldo.toFixed(2)}</ListGroup.Item>
                      <ListGroup.Item><strong>Limite de Crédito:</strong> R$ {conta.limiteCredito.toFixed(2)}</ListGroup.Item>
                      <ListGroup.Item><strong>Crédito Disponível:</strong> R$ {conta.creditoDisponivel.toFixed(2)}</ListGroup.Item>
                    </ListGroup>
                  </div>
                ))
              ) : (
                <p className="text-center">Nenhuma conta encontrada.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <h2 className="m-4 w-100 text-center mx-0">Agência</h2>
          {agencia ? (
            <Card className="mb-5">
              <Card.Header>Dados da Agência</Card.Header>
              <Card.Body>
                <ListGroup className="list-group-flush">
                  <ListGroup.Item><strong>Nome:</strong> {agencia.nome}</ListGroup.Item>
                  <ListGroup.Item><strong>Código:</strong> {agencia.codigo}</ListGroup.Item>
                  <ListGroup.Item><strong>Endereço:</strong> {agencia.endereco}</ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          ) : (
            <Card className="mb-5">
              <Card.Body className="text-center">
                Agência não encontrada.
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </MainLayout>
  );
}
