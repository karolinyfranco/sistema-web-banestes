import { Navbar, Nav, NavDropdown, Container, Image } from "react-bootstrap";
import { Link } from 'react-router-dom';
import avatarFake from "../assets/img/avatar-fake.svg";
import logoBanestes from "../assets/img/banestesbranco.svg";

export default function AppNavbar() {

  return (
    <Navbar className="w-100" expand="lg" bg="primary" data-bs-theme="dark" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <Image
            alt="Logotipo do Banestes"
            src={logoBanestes}
            width="35"
            height="35"
            className="d-inline-block align-top"
          />{' '}
          BANESTES
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <NavDropdown
              title={
                <span>
                  <Image
                    alt="Foto de perfil do usuário"
                    src={avatarFake}
                    loading="lazy"
                    roundedCircle
                    width="35"
                    height="35"
                    className="me-2"
                  />
                  <span>Bem-vindo(a), Fulano</span>
                </span>
              }
              id="user-nav-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="#">Perfil</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="#" onClick={() => alert("Você foi deslogado!")}>
                Sair
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}