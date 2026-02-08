import "./App.css";
import { useRef } from "react";
import Navbar from "./components/Navbar";
import Convertor from "./components/Convertor";
import HowItWorks from "./components/HowItWorks";
import FAQs from "./components/FAQs";
import Footer from "./components/Footer";

const App = () => {
  const converterRef = useRef(null);
  const howWorksRef = useRef(null);
  const faqRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <Navbar
        onConverterClick={() => scrollToSection(converterRef)}
        onHowWorksClick={() => scrollToSection(howWorksRef)}
        onFAQClick={() => scrollToSection(faqRef)}
      />
      <Convertor ref={converterRef}/>
      <HowItWorks ref={howWorksRef} />
      <FAQs ref={faqRef} />
      <Footer />
    </div>
  );
};

export default App;