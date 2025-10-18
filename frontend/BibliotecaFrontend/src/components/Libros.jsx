import React from 'react';

const BookCard = ({ book }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 relative">
        {book.portada_url ? (
          <img 
            src={book.portada_url} 
            alt={book.titulo} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/200x300?text=Sin+Imagen";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        
        {book.nombre_categoria && (
          <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {book.nombre_categoria}
          </span>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg line-clamp-1" title={book.titulo}>{book.titulo}</h3>
        <p className="text-sm text-gray-600 mb-2" title={book.autor}>{book.autor}</p>
        
        {book.sinopsis && (
          <div className="mt-2 text-xs text-gray-500 line-clamp-3" title={book.sinopsis}>
            {book.sinopsis}
          </div>
        )}
        
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-500">
            {book.fecha_publicacion ? new Date(book.fecha_publicacion).getFullYear() : 'Año desconocido'}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {book.paginas > 0 ? `${book.paginas} págs.` : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

const BookGrid = ({ books = [] }) => {
  if (!books || books.length === 0) {
    return (
      <div className="mt-8 text-center text-gray-500 p-10 bg-white rounded-lg shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-lg font-medium">No hay libros para mostrar</p>
        <p className="mt-2">Intenta con una nueva búsqueda o pregunta al bibliotecario</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          Libros encontrados ({books.length})
        </h2>
        <div className="text-sm text-gray-500">
          Mostrando {books.length} resultado(s)
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default BookGrid;