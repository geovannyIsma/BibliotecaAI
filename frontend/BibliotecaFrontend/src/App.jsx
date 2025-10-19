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

  const loadBooks = async (params = {}) => {
    setLoading(true);
    try {
      const response = await fetchLibros(params);
      setBooks(response.results || []);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar libros iniciales
    loadBooks(filterParams);
  }, [filterParams]);

  const handleSearchResults = (results) => {
    if (results && results.libros) {
      setBooks(results.libros);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilterParams({ ...filterParams, ...newFilters });
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
              <BookGrid books={books} />
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
