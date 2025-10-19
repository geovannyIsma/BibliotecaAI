import React, { useState } from 'react';

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

        {/* Mostrar estado de disponibilidad */}
        <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full ${book.disponible 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'}`}>
          {book.disponible ? 'Disponible' : 'No disponible'}
        </span>
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

        {/* Mostrar fecha de creación */}
        <div className="mt-2 text-xs text-gray-500 text-right">
          Añadido: {new Date(book.fecha_creacion).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

const BookGrid = ({ books = [] }) => {
  const [filter, setFilter] = useState({
    disponible: 'todos', // 'todos', 'disponibles', 'no_disponibles'
  });

  // Aplicar filtros a la lista de libros
  const filteredBooks = books.filter(book => {
    if (filter.disponible === 'disponibles' && !book.disponible) return false;
    if (filter.disponible === 'no_disponibles' && book.disponible) return false;
    return true;
  });

  return (
    <div className="mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          Libros encontrados ({filteredBooks.length})
        </h2>

        {/* Filtros */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="disponible" className="text-sm font-medium text-gray-700">Disponibilidad:</label>
            <select 
              id="disponible" 
              className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              value={filter.disponible}
              onChange={e => setFilter({...filter, disponible: e.target.value})}
            >
              <option value="todos">Todos</option>
              <option value="disponibles">Disponibles</option>
              <option value="no_disponibles">No disponibles</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-500">
            Mostrando {filteredBooks.length} resultado(s)
          </div>
        </div>
      </div>
      
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 p-10 bg-white rounded-lg shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-lg font-medium">No hay libros para mostrar con los filtros actuales</p>
          <p className="mt-2">Intenta ajustar los filtros o realiza una nueva búsqueda</p>
        </div>
      )}
    </div>
  );
};

export default BookGrid;