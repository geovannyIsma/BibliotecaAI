import { useState, useEffect } from 'react';
import './App.css';
import Librarian from './components/Bibliotecario';
import BookGrid from './components/Libros';
import { fetchLibros } from './services/api';

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInitialBooks = async () => {
      setLoading(true);
      try {
        const response = await fetchLibros();
        setBooks(response.results || []);
      } catch (error) {
        console.error('Error loading initial books:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialBooks();
  }, []);

  const handleSearchResults = (results) => {
    if (results && results.libros) {
      setBooks(results.libros);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Biblioteca Virtual</h1>
      </header>
      
      <main className="container mx-auto pb-8">
        <Librarian onSearchResults={handleSearchResults} />
        
        {loading ? (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <BookGrid books={books} />
        )}
      </main>
      
      <footer className="text-center text-gray-500 text-sm mt-8">
        Biblioteca Virtual
      </footer>
    </div>
  );
}

export default App;
