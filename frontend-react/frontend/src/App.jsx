import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Products from "./components/Products";
import Payments from "./components/Payments";

export default function App() {
  return (
    <Router>
      <main>
        <nav>
          <Link className="underline" to="/">Produkty</Link>
          <Link className="underline" to="/payments">Płatności</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/payments" element={<Payments />} />
        </Routes>
      </main>
    </Router>
  );
}
