import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";

import Register from "./register";
import Cards from "./Cards";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cards" element={<Cards />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;