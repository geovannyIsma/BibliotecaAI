import { useState } from 'react';

const ReservaModal = ({ libro, onClose, onReservar, isProcessing }) => {
  const [formData, setFormData] = useState({
    usuarioNombre: '',
    usuarioEmail: '',
    diasPrestamo: 14,
    notas: ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!formData.usuarioNombre.trim()) {
      newErrors.usuarioNombre = 'El nombre es requerido';
    }
    
    if (!formData.usuarioEmail.trim()) {
      newErrors.usuarioEmail = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.usuarioEmail)) {
      newErrors.usuarioEmail = 'Email inválido';
    }
    
    if (formData.diasPrestamo < 1 || formData.diasPrestamo > 30) {
      newErrors.diasPrestamo = 'Los días deben estar entre 1 y 30';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onReservar(
        formData.usuarioNombre,
        formData.usuarioEmail,
        formData.diasPrestamo,
        formData.notas
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-amber-50 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-amber-800 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h3 className="text-xl font-bold">Reservar Libro</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-amber-200 transition-colors"
            disabled={isProcessing}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Información del libro */}
          <div className="mb-6 p-4 bg-white rounded-lg border border-amber-200">
            <h4 className="font-bold text-lg text-amber-900 mb-1">{libro.titulo}</h4>
            <p className="text-sm text-amber-700 italic">{libro.autor}</p>
            {libro.nombre_categoria && (
              <span className="inline-block mt-2 text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded">
                {libro.nombre_categoria}
              </span>
            )}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="usuarioNombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                id="usuarioNombre"
                name="usuarioNombre"
                value={formData.usuarioNombre}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.usuarioNombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tu nombre"
                disabled={isProcessing}
              />
              {errors.usuarioNombre && (
                <p className="text-red-500 text-xs mt-1">{errors.usuarioNombre}</p>
              )}
            </div>

            <div>
              <label htmlFor="usuarioEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="usuarioEmail"
                name="usuarioEmail"
                value={formData.usuarioEmail}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.usuarioEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="tu@email.com"
                disabled={isProcessing}
              />
              {errors.usuarioEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.usuarioEmail}</p>
              )}
            </div>

            <div>
              <label htmlFor="diasPrestamo" className="block text-sm font-medium text-gray-700 mb-1">
                Días de préstamo (1-30) *
              </label>
              <input
                type="number"
                id="diasPrestamo"
                name="diasPrestamo"
                value={formData.diasPrestamo}
                onChange={handleChange}
                min="1"
                max="30"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.diasPrestamo ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isProcessing}
              />
              {errors.diasPrestamo && (
                <p className="text-red-500 text-xs mt-1">{errors.diasPrestamo}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Fecha de devolución: {new Date(Date.now() + formData.diasPrestamo * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                id="notas"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Comentarios adicionales..."
                disabled={isProcessing}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {isProcessing ? 'Reservando...' : 'Confirmar Reserva'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservaModal;
