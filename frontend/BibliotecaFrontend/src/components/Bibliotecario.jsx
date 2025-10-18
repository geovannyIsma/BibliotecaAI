import { useState } from 'react';
import { enviarConsulta, buscarLibros } from '../services/api';

const Librarian = ({ onSearchResults }) => {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('¡Hola! Soy tu bibliotecario virtual. ¿En qué puedo ayudarte hoy?');
  const [suggestions, setSuggestions] = useState([
    "¿Qué libros tienen sobre ciencia ficción?",
    "Busco libros de Gabriel García Márquez",
    "¿Puedes recomendarme un libro de historia?"
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // Buscar libros con la consulta
      const resultados = await buscarLibros(query);
      
      // Actualizar el mensaje del bibliotecario y sugerencias
      if (resultados.explicacion) {
        setMessage(resultados.explicacion);
      } else if (resultados.libros && resultados.libros.length > 0) {
        setMessage(`He encontrado ${resultados.libros.length} libros que podrían interesarte.`);
      } else {
        setMessage("No he encontrado libros que coincidan con tu búsqueda. ¿Puedo ayudarte con algo más?");
      }
      
      // Actualizar sugerencias si existen
      if (resultados.sugerencias && resultados.sugerencias.length > 0) {
        setSuggestions(resultados.sugerencias);
      }
      
      // Pasar los resultados al componente padre
      onSearchResults(resultados);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Lo siento, ha ocurrido un error al procesar tu consulta.');
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
      <div className="relative w-full flex justify-center mb-12">
        <div className="w-50 h-50 bg-gray-300 rounded-full">
          <img 
            src="/src/assets/bibliotecario.png" 
            alt="Bibliotecario" 
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/200x200?text=Bibliotecario";
            }}
          />
        </div>
        <div className="absolute -top-8 left-1/2 transform translate-x-32 bg-white border-2 border-black rounded-lg p-5 w-[550px] min-h-[150px] shadow-lg">
          <div className="text-base leading-relaxed max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? "Pensando..." : message}
          </div>
          
          {!isLoading && suggestions && suggestions.length > 0 && (
            <div className="mt-4 border-t pt-3">
              <p className="font-medium text-sm text-gray-600 mb-2">Sugerencias:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button 
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs hover:bg-blue-200 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}    
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl mt-40">
        <div className="flex items-center border-2 rounded-lg overflow-hidden">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué libro estás buscando?"
            className="flex-grow px-4 py-3 focus:outline-none text-base"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 disabled:bg-blue-300 flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Buscando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Librarian;