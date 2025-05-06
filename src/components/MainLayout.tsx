import { PropsWithChildren } from "react";
import { Col, Container, Row } from "react-bootstrap";
import AppNavbar from "./Navbar";

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <Container fluid className="flex-grow-1 d-flex justify-content-center">
        <Row style={{ width: "100%", maxWidth: "900px" }}>
          <Col>{children}</Col>
        </Row>
      </Container>
      <footer className="bg-primary text-white text-center py-3">
        <Container>
          <span style={{ display: "inline-block", minHeight: "24px" }}>
            © 2025 Sistema Banestes - Todos os direitos reservados.
          </span>
        </Container>
      </footer>
    </div>
  );
}
