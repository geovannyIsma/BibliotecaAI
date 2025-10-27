const API_URL = import.meta.env.VITE_API_URL;

export const fetchLibros = async (params = {}) => {
  try {
    // Construir la URL con parámetros de consulta
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('q', params.query);
    if (params.categoria) queryParams.append('categoria', params.categoria);
    if (params.disponible !== undefined) queryParams.append('disponible', params.disponible);
    if (params.fecha_desde) queryParams.append('fecha_desde', params.fecha_desde);
    if (params.fecha_hasta) queryParams.append('fecha_hasta', params.fecha_hasta);
    
    const url = `${API_URL}/libros/?${queryParams.toString()}`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching libros:', error);
    throw error;
  }
};

export const fetchCategorias = async () => {
  try {
    const response = await fetch(`${API_URL}/categorias/`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching categorias:', error);
    throw error;
  }
};

export const enviarConsulta = async (consulta) => {
  try {
    const response = await fetch(`${API_URL}/bibliotecario/consulta/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ consulta }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error enviando consulta:', error);
    throw error;
  }
};

export const buscarLibros = async (consulta) => {
  try {
    const response = await fetch(`${API_URL}/bibliotecario/buscar_libros/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ consulta }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error buscando libros:', error);
    throw error;
  }
};

// Funciones para reservas
export const reservarLibro = async (libroId, usuarioNombre, usuarioEmail, diasPrestamo = 14, notas = '') => {
  try {
    const response = await fetch(`${API_URL}/libros/${libroId}/reservar/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario_nombre: usuarioNombre,
        usuario_email: usuarioEmail,
        dias_prestamo: diasPrestamo,
        notas: notas
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error reservando libro:', error);
    throw error;
  }
};

export const devolverLibro = async (libroId) => {
  try {
    const response = await fetch(`${API_URL}/libros/${libroId}/devolver/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error devolviendo libro:', error);
    throw error;
  }
};

export const fetchReservas = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.estado) queryParams.append('estado', params.estado);
    if (params.email) queryParams.append('email', params.email);
    if (params.libro) queryParams.append('libro', params.libro);
    
    const url = `${API_URL}/reservas/?${queryParams.toString()}`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching reservas:', error);
    throw error;
  }
};

export const cancelarReserva = async (reservaId) => {
  try {
    const response = await fetch(`${API_URL}/reservas/${reservaId}/cancelar/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error cancelando reserva:', error);
    throw error;
  }
};

export const verificarReservasVencidas = async () => {
  try {
    const response = await fetch(`${API_URL}/reservas/verificar_vencidas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error verificando reservas vencidas:', error);
    throw error;
  }
};

export const consultarDisponibilidad = async (libroId) => {
  try {
    const response = await fetch(`${API_URL}/bibliotecario/${libroId}/disponibilidad/`);
    return await response.json();
  } catch (error) {
    console.error('Error consultando disponibilidad:', error);
    throw error;
  }
};

export const obtenerEstadisticas = async () => {
  try {
    const response = await fetch(`${API_URL}/bibliotecario/estadisticas/`);
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};
