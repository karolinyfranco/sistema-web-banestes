import { PropsWithChildren } from "react";
import { Col, Container, Row } from "react-bootstrap";
import AppNavbar from "./Navbar";

export default function MainLayout({ children }: PropsWithChildren){
    return (
        <>
        <AppNavbar />
        <Container fluid className="d-flex justify-content-center">
            <Row style={{ width: "100%", maxWidth: "800px" }}>
                <Col>
                    { children }
                </Col>
            </Row>
        </Container>
        </>
      );
}