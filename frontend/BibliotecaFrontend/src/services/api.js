const API_URL = import.meta.env.VITE_API_URL;

export const fetchLibros = async (query = '') => {
  try {
    const url = query 
      ? `${API_URL}/libros/?q=${encodeURIComponent(query)}`
      : `${API_URL}/libros/`;
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
