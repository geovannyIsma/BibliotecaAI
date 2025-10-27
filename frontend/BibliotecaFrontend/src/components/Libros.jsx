import React, { useState } from 'react';
import { reservarLibro, devolverLibro, consultarDisponibilidad } from '../services/api';
import ReservaModal from './ReservaModal';

const BookCard = ({ book, onReservaChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Asignar un color de portada basado en la categoría
  const getCategoryColor = (categoryName) => {
    const colorMap = {
      'Ficción': 'bg-blue-600',
      'No Ficción': 'bg-green-700',
      'Ciencia': 'bg-purple-700',
      'Historia': 'bg-amber-700',
      'Biografía': 'bg-red-700',
      'Literatura': 'bg-indigo-700',
      'Poesía': 'bg-pink-700',
      'Arte': 'bg-teal-700'
    };
    
    return colorMap[categoryName] || 'bg-gray-700';
  };
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  const handleReservar = async (usuarioNombre, usuarioEmail, diasPrestamo, notas) => {
    setIsProcessing(true);
    try {
      await reservarLibro(book.id, usuarioNombre, usuarioEmail, diasPrestamo, notas);
      alert('¡Libro reservado exitosamente!');
      setShowReservaModal(false);
      if (onReservaChange) onReservaChange();
    } catch (error) {
      console.error('Error al reservar:', error);
      alert('Error al reservar el libro. Por favor intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDevolver = async () => {
    if (!confirm('¿Estás seguro de que deseas devolver este libro?')) return;
    
    setIsProcessing(true);
    try {
      await devolverLibro(book.id);
      alert('¡Libro devuelto exitosamente!');
      if (onReservaChange) onReservaChange();
    } catch (error) {
      console.error('Error al devolver:', error);
      alert('Error al devolver el libro. Por favor intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConsultarDisponibilidad = async () => {
    try {
      const resultado = await consultarDisponibilidad(book.id);
      alert(resultado.mensaje);
    } catch (error) {
      console.error('Error al consultar disponibilidad:', error);
    }
  };
  
  return (
    <>
      <div 
        className="relative transition-all duration-300 rounded-lg overflow-hidden shadow-md hover:shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Contenedor del libro con efecto 3D */}
        <div className="relative h-72 bg-amber-50 transform transition-transform duration-300 hover:scale-105">
          {/* Portada del libro */}
          <div className="absolute inset-0 flex items-center justify-center">
            {book.portada_url && !imageError ? (
              <img 
                src={book.portada_url} 
                alt={`Portada de ${book.titulo}`} 
                className="h-full w-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className={`h-full w-full ${getCategoryColor(book.nombre_categoria)} flex flex-col items-center justify-center p-4`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-white text-center mt-4 font-bold">{book.titulo}</h3>
                <p className="text-white/80 text-sm text-center mt-2">{book.autor}</p>
              </div>
            )}
          </div>
          
          
          {/* Cinta marcapáginas */}
          <div className="absolute -top-1 right-4 w-4 h-10 bg-red-600 transform rotate-6 shadow-md"></div>
          
          {/* Categoría en una esquina */}
          {book.nombre_categoria && (
            <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-md ${getCategoryColor(book.nombre_categoria)} text-white shadow-md`}>
              {book.nombre_categoria}
            </span>
          )}

          {/* Estado de disponibilidad */}
          <span className={`absolute bottom-2 right-2 text-xs font-bold px-2 py-1 rounded-md shadow-md ${book.disponible 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'}`}>
            {book.disponible ? 'Disponible' : 'Prestado'}
          </span>
        </div>
        
        {/* Detalles del libro - aparece solo en hover */}
        <div 
          className={`absolute inset-0 bg-amber-50/95 p-4 flex flex-col justify-between transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div>
            <h3 className="font-bold text-lg text-amber-900 book-title mb-1">{book.titulo}</h3>
            <p className="text-sm text-amber-800 italic mb-2">por {book.autor}</p>
            
            {book.sinopsis && (
              <div className="mt-2 text-xs text-gray-700 bg-amber-100/80 p-2 rounded border-l-4 border-amber-300 max-h-20 overflow-y-auto custom-scrollbar">
                {book.sinopsis}
              </div>
            )}

            {/* Información de reserva activa */}
            {book.reserva_activa && (
              <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs">
                <p className="font-semibold text-red-800">Reservado por:</p>
                <p className="text-red-700">{book.reserva_activa.usuario_nombre}</p>
                <p className="text-red-600 text-xs mt-1">
                  Vence: {new Date(book.reserva_activa.fecha_vencimiento).toLocaleDateString()}
                </p>
                {book.reserva_activa.dias_restantes !== null && (
                  <p className="text-red-600 text-xs">
                    ({book.reserva_activa.dias_restantes} días restantes)
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-2">
            {/* Botones de acción */}
            <div className="flex gap-2 mb-2">
              {book.disponible && !book.reserva_activa ? (
                <button
                  onClick={() => setShowReservaModal(true)}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Procesando...' : 'Reservar'}
                </button>
              ) : (
                <button
                  onClick={handleConsultarDisponibilidad}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs py-2 px-3 rounded transition-colors"
                >
                  Ver disponibilidad
                </button>
              )}
              
              {book.reserva_activa && (
                <button
                  onClick={handleDevolver}
                  disabled={isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Procesando...' : 'Devolver'}
                </button>
              )}
            </div>

            <div className="flex justify-between items-center text-xs text-amber-800">
              <span>
                {book.fecha_publicacion ? new Date(book.fecha_publicacion).getFullYear() : 'Año desconocido'}
              </span>
              <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full">
                {book.paginas > 0 ? `${book.paginas} págs.` : ''}
              </span>
            </div>
            
            <div className="mt-2 text-xs text-right text-amber-700">
              Añadido: {new Date(book.fecha_creacion).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {showReservaModal && (
        <ReservaModal
          libro={book}
          onClose={() => setShowReservaModal(false)}
          onReservar={handleReservar}
          isProcessing={isProcessing}
        />
      )}
    </>
  );
};

const BookGrid = ({ books = [], onReservaChange }) => {
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
    <div className="mt-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold flex items-center text-gray-800 library-title">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          Catálogo de Libros ({filteredBooks.length})
        </h2>

        {/* Filtros */}
        <div className="flex items-center space-x-4 bg-amber-100/50 p-2 rounded-lg border border-amber-200">
          <div className="flex items-center space-x-2">
            <label htmlFor="disponible" className="text-sm font-medium text-amber-900">Disponibilidad:</label>
            <select 
              id="disponible" 
              className="text-sm rounded-md border-amber-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
              value={filter.disponible}
              onChange={e => setFilter({...filter, disponible: e.target.value})}
            >
              <option value="todos">Todos</option>
              <option value="disponibles">Disponibles</option>
              <option value="no_disponibles">No disponibles</option>
            </select>
          </div>
          
          <div className="text-sm text-amber-800 font-medium">
            {filteredBooks.length} resultado(s)
          </div>
        </div>
      </div>
      
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-4 bg-[#f0e6d7]/30 rounded-lg">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} onReservaChange={onReservaChange} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 p-10 bg-amber-50 rounded-lg border-2 border-dashed border-amber-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-amber-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-lg font-medium">Estantería vacía</p>
          <p className="mt-2">No hay libros que coincidan con tu búsqueda</p>
        </div>
      )}
    </div>
  );
};

export default BookGrid;