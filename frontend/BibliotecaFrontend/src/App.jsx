import { useState, useEffect } from 'react';
import './App.css';
import Librarian from './components/Bibliotecario';
import BookGrid from './components/Libros';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import { fetchLibros } from './services/api';

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterParams, setFilterParams] = useState({});
  const [noResultsMessage, setNoResultsMessage] = useState('');

  const loadBooks = async (params = {}) => {
    setLoading(true);
    try {
      const response = await fetchLibros(params);
      setBooks(response.results || response || []);
      setNoResultsMessage('');
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar libros iniciales
    loadBooks(filterParams);
  }, []);

  const handleSearchResults = (results) => {
    // Solo actualizar los libros si hay resultados
    if (results && results.libros && results.libros.length > 0) {
      setBooks(results.libros);
      setNoResultsMessage('');
    } else if (results && results.libros && results.libros.length === 0) {
      // Mostrar mensaje pero mantener los libros actuales
      setNoResultsMessage('No se encontraron libros que coincidan con tu búsqueda, mostrando catálogo completo.');
    }
  };

  const handleFilterChange = (newFilters) => {
    const newParams = { ...filterParams, ...newFilters };
    setFilterParams(newParams);
    setNoResultsMessage('');
    loadBooks(newParams);
  };

  const handleReservaChange = async () => {
    // Recargar libros cuando haya cambios en reservas
    await loadBooks(filterParams);
  };

  return (
    <div className="min-h-screen biblioteca-container flex flex-col">
      <Navbar onFilterChange={handleFilterChange} />
      
      <main className="container mx-auto p-4 flex-grow">
        <div className="bg-amber-50 rounded-lg shadow-md p-6 mb-8 library-desk">
          <Librarian onSearchResults={handleSearchResults} />
        </div>
        
        <div className="mt-6 relative">
          {/* Estantería superior */}
          <div className="h-4 library-shelf rounded-t-lg mb-1"></div>
          
          {loading ? (
            <div className="flex justify-center mt-8 p-12 bg-amber-50 rounded-lg shadow-md">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="bg-amber-50 rounded-lg p-6 shadow-md">
              {noResultsMessage && (
                <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-lg text-amber-800">
                  {noResultsMessage}
                </div>
              )}
              <BookGrid books={books} onReservaChange={handleReservaChange} />
            </div>
          )}
          
          {/* Estantería inferior */}
          <div className="h-4 library-shelf rounded-b-lg mt-1"></div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
