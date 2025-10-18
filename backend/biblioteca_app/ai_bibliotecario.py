import google.generativeai as genai
from django.conf import settings
from .models import Libro, Categoria
import json
import re

class BibliotecarioIA:
    def __init__(self):
        # Configurar Gemini API
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')
    
    def procesar_consulta(self, consulta):
        try:
            libros = Libro.objects.all()
            categorias = Categoria.objects.all()
            
            # Crear contexto con información de la biblioteca
            contexto_libros = "\n".join([
                f"Libro: {libro.titulo}, Autor: {libro.autor}, Categoría: {libro.categoria.nombre if libro.categoria else 'Sin categoría'}"
                for libro in libros[:20] # Limitar a los primeros 20 libros para no exceder el límite de tokens
            ])
            
            contexto_categorias = ", ".join([cat.nombre for cat in categorias])
            
            prompt = f"""
            Eres el asistente de una biblioteca digital. Tu objetivo es ayudar a los usuarios a encontrar libros y recursos.
            
            Información de la biblioteca:
            Categorías disponibles: {contexto_categorias}
            
            Algunos libros disponibles:
            {contexto_libros}
            
            La consulta del usuario es: "{consulta}"
            
            Si la consulta parece ser una búsqueda de libros, responde con formato JSON que contenga:
            1. Una lista de libros recomendados basados en la consulta
            2. Una explicación amigable de tu respuesta
            3. Sugerencias relacionadas
            
            Formato del JSON:
            {{"tipo": "busqueda", "recomendaciones": ["título1", "título2"], "explicacion": "texto explicativo", "sugerencias": ["sugerencia1", "sugerencia2"]}}
            
            Si la consulta es una pregunta general sobre la biblioteca o cómo usarla, responde con formato JSON:
            {{"tipo": "informacion", "respuesta": "tu respuesta detallada aquí"}}
            
            IMPORTANTE: Responde únicamente con el JSON, sin formato markdown, sin backticks, y sin texto adicional.
            """
            
            # Enviar consulta a Gemini
            response = self.model.generate_content(prompt)

            print("Respuesta de Gemini:", response.text)  # Para depuración
            
            # Extraer el JSON de la respuesta
            json_response = response.text

            try:
                respuesta_json = json.loads(json_response)
                return respuesta_json
            except json.JSONDecodeError:
                return {
                    "tipo": "informacion",
                    "respuesta": "No pude procesar tu consulta. Por favor, intenta reformularla."
                }
                
        except Exception as e:
            return {
                "tipo": "error",
                "respuesta": f"Ocurrió un error: {str(e)}"
            }
    
    def buscar_libros(self, consulta):
        """Busca libros basados en la consulta en lenguaje natural"""
        resultado = self.procesar_consulta(f"Buscar libros sobre: {consulta}")
        
        if resultado.get("tipo") == "busqueda":
            recomendaciones = resultado.get("recomendaciones", [])
            libros_encontrados = []
            
            for titulo in recomendaciones:
                # Búsqueda aproximada por título
                libros = Libro.objects.filter(titulo__icontains=titulo)
                libros_encontrados.extend(libros)
            
            return {
                "libros": libros_encontrados,
                "explicacion": resultado.get("explicacion", ""),
                "sugerencias": resultado.get("sugerencias", [])
            }
        
        return {
            "libros": [],
            "explicacion": resultado.get("respuesta", "No se encontraron libros relevantes."),
            "sugerencias": []
        }
    
    def obtener_sugerencias(self, libro_id):
        """Genera sugerencias de libros relacionados"""
        try:
            libro = Libro.objects.get(id=libro_id)
            resultado = self.procesar_consulta(
                f"Recomienda libros similares a '{libro.titulo}' de {libro.autor}"
            )
            return resultado
        except Libro.DoesNotExist:
            return {"tipo": "error", "respuesta": "Libro no encontrado"}

