const Footer = () => {
  return (
    <footer className="bg-[#8b5e34] text-amber-100 border-t-4 border-[#6e4423] py-6 mt-8 shadow-inner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h3 className="text-amber-100 font-medium text-lg library-title">Biblioteca Virtual</h3>
            <p className="text-amber-200 text-sm mt-1">© {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
