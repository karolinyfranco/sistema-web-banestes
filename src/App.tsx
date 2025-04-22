import { Route, Routes } from "react-router-dom";
import { ListaClientes } from "./pages/ListaClientes";
import { DetalhesCliente } from "./pages/DetalhesCliente";
import './bootstrap.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ListaClientes />} />
      <Route path="/cliente/:id" element={<DetalhesCliente />} />
    </Routes>
  );
}

export default App