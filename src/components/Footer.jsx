const Footer = () => {
  return (
    <footer className="flex justify-center mb-3">
      <div className="w-full max-w-md px-6 py-4 rounded-2xl bg-white shadow-lg">
        <p className="text-sm text-slate-600 text-center">
          Developed by{" "}
          <a href="https://github.com/rahulhgdev" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-900 hover:text-blue-600 transition-colors"> Rahul Gupta</a>✌
        </p>
      </div>
    </footer>
  );
};

export default Footer;