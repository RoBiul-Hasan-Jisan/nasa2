import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Country from "./pages/Country";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/country/:country" element={<Country />} />
      </Routes>
    </Router>
  );
}

export default App;
