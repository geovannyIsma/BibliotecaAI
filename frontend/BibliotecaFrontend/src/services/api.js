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
