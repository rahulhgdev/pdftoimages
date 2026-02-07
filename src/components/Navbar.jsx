
import logo from "../assets/logo.png";
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo flex items-center gap-2" title="Back to converter">
          <img src={logo} alt="logo" className="w-10 h-10 md:w-7 md:h-7" /> 
          <div className="hidden md:block">PDF2Image</div>
        </div>

        <ul className="navbar-links">
          <li className='navbar-link'> Converter </li>
          <li className='navbar-link'> How it works </li>
          <li className="navbar-link"> <a href="https://rahulhgdev.vercel.app/" target="_blank"> Contact </a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;