import { useState } from "react";
import logo from "../assets/logo.png";
import { Menu, X } from "lucide-react";

const Navbar = ({ onConverterClick, onHowWorksClick, onFAQClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (callback) => {
    callback();
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            title="Back to converter"
            onClick={onConverterClick}
          >
            <img src={logo} alt="logo" className="w-10 h-10 md:w-9 md:h-9" />
            <span className="text-lg font-semibold text-gray-800">
              PDF2Image
            </span>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-8">
            <li
              className="text-gray-700 hover:text-blue-600 cursor-pointer font-medium transition-colors"
              onClick={() => handleNavClick(onConverterClick)}
            >
              Converter
            </li>
            <li
              className="text-gray-700 hover:text-blue-600 cursor-pointer font-medium transition-colors"
              onClick={() => handleNavClick(onHowWorksClick)}
            >
              How it works
            </li>
            <li
              className="text-gray-700 hover:text-blue-600 cursor-pointer font-medium transition-colors"
              onClick={() => handleNavClick(onFAQClick)}
            >
              FAQs
            </li>
            <li className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              <a
                href="https://rahulhgdev.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact
              </a>
            </li>
          </ul>

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X size={24} className="text-gray-800" />
            ) : (
              <Menu size={24} className="text-gray-800" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <ul className="flex flex-col gap-2 pt-4">
              <li
                className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer font-medium rounded-lg transition-colors"
                onClick={() => handleNavClick(onConverterClick)}
              >
                Converter
              </li>
              <li
                className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer font-medium rounded-lg transition-colors"
                onClick={() => handleNavClick(onHowWorksClick)}
              >
                How it works
              </li>
              <li
                className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer font-medium rounded-lg transition-colors"
                onClick={() => handleNavClick(onFAQClick)}
              >
                FAQs
              </li>
              <li className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium rounded-lg transition-colors">
                <a
                  href="https://rahulhgdev.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;