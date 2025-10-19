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
    <div className="flex flex-col w-full max-w-4xl mx-auto animate-fadeIn">
      <div className="w-full">
        <div className="flex items-center mb-4 bg-amber-800 text-amber-50 p-3 rounded-t-lg shadow-md">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex-shrink-0 overflow-hidden border-2 border-amber-300 shadow-inner">
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
            <h2 className="font-medium text-lg">Servicio de Consulta</h2>
            <p className="text-sm text-amber-200">El bibliotecario le atenderá</p>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex h-3 w-3 rounded-full ${isTyping ? 'bg-green-400 animate-pulse' : 'bg-green-300'}`}></span>
          </div>
        </div>
        
        <div className="bg-[#f8f5f0] rounded-b-lg p-4 h-72 overflow-y-auto custom-scrollbar mb-4 librarian-chat border border-amber-300 shadow-inner">
          {conversationHistory.map((message, index) => (
            <div 
              key={index} 
              className={`mb-3 ${message.role === 'usuario' ? 'text-right' : ''}`}
            >
              <div 
                className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                  message.role === 'usuario' 
                    ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                    : 'bg-white border border-amber-200 text-gray-800'
                } shadow-sm`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              <div className="mt-1 text-xs text-amber-700 opacity-75">
                {message.role === 'usuario' ? 'Tú' : 'Bibliotecario'}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="mb-3">
              <div className="inline-block max-w-[80%] px-4 py-2 rounded-lg bg-white border border-amber-200">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
              <div className="mt-1 text-xs text-amber-700 opacity-75">
                Bibliotecario está escribiendo...
              </div>
            </div>
          )}
          
          <div ref={messageEndRef} />
        </div>
        
        {!isLoading && suggestions && suggestions.length > 0 && (
          <div className="mb-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
            <p className="text-xs font-medium text-amber-800 mb-2">Consultas frecuentes:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button 
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="bg-white hover:bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs transition-colors flex items-center border border-amber-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-center border-2 border-amber-300 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all">
          <input
            type="text"
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué libro estás buscando?"
            className="flex-grow px-4 py-3 focus:outline-none text-base bg-transparent"
            disabled={isLoading}
            aria-label="Consulta al bibliotecario"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="bg-amber-800 hover:bg-amber-900 text-white px-6 py-3 transition-colors disabled:bg-amber-300 flex items-center"
            aria-label="Enviar consulta"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Consultando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Consultar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Librarian;