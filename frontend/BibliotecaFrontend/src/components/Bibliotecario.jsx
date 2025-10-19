import { useState, useEffect, useRef } from 'react';
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
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([
    { role: 'bibliotecario', content: '¡Hola! Soy tu bibliotecario virtual. ¿En qué puedo ayudarte hoy?' }
  ]);
  
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Efecto de escritura
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Agregar la consulta del usuario a la conversación
    const userMessage = query;
    setConversationHistory(prev => [
      ...prev, 
      { role: 'usuario', content: userMessage }
    ]);
    
    // Mostrar efecto de escritura
    setIsTyping(true);
    setIsLoading(true);
    setQuery('');
    
    try {
      // Buscar libros con la consulta
      const resultados = await buscarLibros(userMessage);
      
      let respuesta = '';
      
      // Crear respuesta basada en los resultados
      if (resultados.explicacion) {
        respuesta = resultados.explicacion;
      } else if (resultados.libros && resultados.libros.length > 0) {
        respuesta = `He encontrado ${resultados.libros.length} libros que podrían interesarte.`;
      } else {
        respuesta = "No he encontrado libros que coincidan con tu búsqueda. ¿Puedo ayudarte con algo más?";
      }
      
      // Actualizar la conversación con la respuesta del bibliotecario
      setConversationHistory(prev => [
        ...prev,
        { role: 'bibliotecario', content: respuesta }
      ]);
      
      // Actualizar sugerencias si existen
      if (resultados.sugerencias && resultados.sugerencias.length > 0) {
        setSuggestions(resultados.sugerencias);
      }
      
      // Pasar los resultados al componente padre
      onSearchResults(resultados);
    } catch (error) {
      console.error('Error:', error);
      
      setConversationHistory(prev => [
        ...prev,
        { role: 'bibliotecario', content: 'Lo siento, ha ocurrido un error al procesar tu consulta. ¿Podrías intentarlo nuevamente?' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto rounded-xl bg-white shadow-md p-6 animate-fadeIn">
      <div className="w-full mb-4">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex-shrink-0 overflow-hidden">
            <img 
              src="/bibliotecario.png" 
              alt="Bibliotecario" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/100?text=B";
              }}
            />
          </div>
          <div className="ml-3">
            <h2 className="font-medium text-lg">Bibliotecario Virtual</h2>
            <p className="text-sm text-gray-500">Siempre disponible para ayudarte</p>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex h-3 w-3 rounded-full ${isTyping ? 'bg-green-400' : 'bg-green-300'}`}></span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto custom-scrollbar mb-4">
          {conversationHistory.map((message, index) => (
            <div 
              key={index} 
              className={`mb-3 ${message.role === 'usuario' ? 'text-right' : ''}`}
            >
              <div 
                className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                  message.role === 'usuario' 
                    ? 'bg-blue-100 text-blue-900' 
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="mb-3">
              <div className="inline-block max-w-[80%] px-4 py-2 rounded-lg bg-white border border-gray-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messageEndRef} />
        </div>
        
        {!isLoading && suggestions && suggestions.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Sugerencias:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button 
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                  </svg>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-center border rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          <input
            type="text"
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué libro estás buscando?"
            className="flex-grow px-4 py-3 focus:outline-none text-base"
            disabled={isLoading}
            aria-label="Consulta al bibliotecario"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 transition-colors disabled:bg-blue-300 flex items-center"
            aria-label="Enviar consulta"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Enviar
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Escribe tu consulta o selecciona una sugerencia para comenzar
        </p>
      </form>
    </div>
  );
};

export default Librarian;