import { Route, Routes } from "react-router-dom";
import { ListaClientes } from "./pages/ListaClientes";
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ListaClientes />} />
    </Routes>
  );
}

export default App