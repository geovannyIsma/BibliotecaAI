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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar onFilterChange={handleFilterChange} />
      
      <main className="container mx-auto p-4 flex-grow">
        <Librarian onSearchResults={handleSearchResults} />
        
        {loading ? (
          <div className="flex justify-center mt-8">
            <LoadingSpinner />
          </div>
        ) : (
          <BookGrid books={books} />
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
