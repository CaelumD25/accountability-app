import './App.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx"
import Items from "./pages/Items.tsx"

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/" element={<Items/>} />
      </Routes>
    </Router>
  )
}

export default App
