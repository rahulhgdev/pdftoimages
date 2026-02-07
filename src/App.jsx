import "./App.css";
import Navbar from './components/Navbar'
import Convertor from './components/Convertor'
import HowItWorks from './components/HowItWorks'
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Convertor />
      <HowItWorks />
      <Footer />
    </div>
  )
}

export default App