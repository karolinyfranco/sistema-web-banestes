import { useEffect, useState } from "react";
import { Cliente } from "../types/Cliente";
import { fetchCSV } from "../services/fetchCSV";
import { parseCSV } from "../utils/parseCSV";
import { Link } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { Button, Col, Dropdown, Form, FormCheck, Pagination, Row, Table, Image } from "react-bootstrap";
import gear from "../assets/img/gearbranco.svg";

export function ListaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [textoDigitado, setTextoDigitado] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [colunasSelecionadas, setColunasSelecionadas] = useState<string[]>([
    "nome", "email", "cpfCnpj",
  ]);
  const opcoesColunas: { chave: keyof Cliente | string; label: string }[] = [
    { chave: "nome", label: "Nome" },
    { chave: "email", label: "Email" },
    { chave: "cpfCnpj", label: "CPF/CNPJ" },
    { chave: "rg", label: "RG" },
    { chave: "dataNascimento", label: "Data de Nascimento" },
    { chave: "rendaAnual", label: "Renda Anual" },
    { chave: "patrimonio", label: "Patrimônio" },
    { chave: "estadoCivil", label: "Estado Civil" },
    { chave: "codigoAgencia", label: "Código Agência" },
  ];
  const itensPorPagina = 10;

  function alternarColuna(chave: keyof Cliente | string) {
    setColunasSelecionadas((prev) => {
      if (prev.includes(chave)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== chave);
      } else {
        return [...prev, chave];
      }
    });
  }

  const renderizarOpcoesColunas = () => (
    <>
      {opcoesColunas.map((opcao) => (
        <FormCheck
          key={opcao.chave}
          type="checkbox"
          label={opcao.label}
          checked={colunasSelecionadas.includes(opcao.chave)}
          onChange={() => alternarColuna(opcao.chave)}
        />
      ))}
    </>
  );

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
      <Row className="w-100 text-center mt-4 mx-0">
        <Col>
          <h1>Lista de Clientes</h1>
        </Col>
      </Row>

      <Row>
        <Col>
          <Dropdown className="selecionar-colunas">
            <Dropdown.Toggle variant="secondary" id="dropdown-colunas" className="d-none d-md-inline">
              <Image
                alt="Logotipo do Banestes"
                src={gear}
                width="25"
                height="25"
                className="d-inline-block align-top"
              />{' '}
              Selecionar Colunas
            </Dropdown.Toggle>

            <Dropdown.Menu style={{ padding: "10px" }}>
              {renderizarOpcoesColunas()}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs="3">
          <Dropdown className="selecionar-colunas">
            <Dropdown.Toggle variant="secondary" id="dropdown-colunas-mobile" className="d-inline d-md-none p-2">
              <Image
                alt="Logotipo do Banestes"
                src={gear}
                width="25"
                height="25"
                className="d-inline-block align-top"
              />
            </Dropdown.Toggle>

            <Dropdown.Menu style={{ padding: "10px" }}>
              {renderizarOpcoesColunas()}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      <Row className="mb-3 w-100 d-flex justify-content-center">
        <Col className="m-1" md="8">
          <Form.Control
            type="text"
            placeholder="Digite o nome ou CPF/CNPJ do cliente"
            value={textoDigitado}
            onChange={(e) => setTextoDigitado(e.target.value)} />
        </Col>
        <Col className="m-1" md="3" sm="6" xs="6">
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
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                {colunasSelecionadas.includes("nome") && <th>Nome</th>}
                {colunasSelecionadas.includes("email") && <th>Email</th>}
                {colunasSelecionadas.includes("cpfCnpj") && <th>CPF/CNPJ</th>}
                {colunasSelecionadas.includes("rg") && <th>RG</th>}
                {colunasSelecionadas.includes("dataNascimento") && <th>Data de Nascimento</th>}
                {colunasSelecionadas.includes("rendaAnual") && <th>Renda Anual</th>}
                {colunasSelecionadas.includes("patrimonio") && <th>Patrimônio</th>}
                {colunasSelecionadas.includes("estadoCivil") && <th>Estado Civil</th>}
                {colunasSelecionadas.includes("codigoAgencia") && <th>Código Agência</th>}
              </tr>
            </thead>
            <tbody>
              {clientesPaginados.map((cliente) => (
                <tr key={cliente.id}>
                  {colunasSelecionadas.includes("nome") && (
                    <td>
                      <Link to={`/cliente/${cliente.id}`} className="link-tabela">
                        {cliente.nome}
                      </Link>
                    </td>
                  )}
                  {colunasSelecionadas.includes("email") && <td>{cliente.email}</td>}
                  {colunasSelecionadas.includes("cpfCnpj") && <td>{cliente.cpfCnpj}</td>}
                  {colunasSelecionadas.includes("rg") && <td>{cliente.rg || '-'}</td>}
                  {colunasSelecionadas.includes("dataNascimento") && (
                    <td>{cliente.dataNascimento.toLocaleDateString()}</td>
                  )}
                  {colunasSelecionadas.includes("rendaAnual") && (
                    <td>R$ {cliente.rendaAnual.toFixed(2)}</td>
                  )}
                  {colunasSelecionadas.includes("patrimonio") && (
                    <td>R$ {cliente.patrimonio.toFixed(2)}</td>
                  )}
                  {colunasSelecionadas.includes("estadoCivil") && (
                    <td>{cliente.estadoCivil}</td>
                  )}
                  {colunasSelecionadas.includes("codigoAgencia") && (
                    <td>{cliente.codigoAgencia}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Row>
        <Col>
          <Pagination className="mb-5 d-flex justify-content-center">
            <Pagination.First
              onClick={() => setPaginaAtual(1)}
              disabled={paginaAtual === 1}
            />
            <Pagination.Prev
              onClick={() => setPaginaAtual((p) => Math.max(p - 1, 1))}
              disabled={paginaAtual === 1}>
              Anterior
            </Pagination.Prev>

            <Pagination.Item active>
              {paginaAtual} de {totalPaginas}
            </Pagination.Item>

            <Pagination.Next
              onClick={() => setPaginaAtual((p) => Math.min(p + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas}>
              Próxima
            </Pagination.Next>
            <Pagination.Last
              onClick={() => setPaginaAtual(totalPaginas)}
              disabled={paginaAtual === totalPaginas}
            />
          </Pagination>
        </Col>
      </Row>
    </MainLayout>
  );
}
