import google.generativeai as genai
from django.conf import settings
from .models import Libro, Categoria, Reserva
import json
import re
from django.utils import timezone

class BibliotecarioIA:
    def __init__(self):
        # Configurar Gemini API
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('models/gemini-2.5-flash')
    
    def procesar_consulta(self, consulta):
        try:
            libros = Libro.objects.all()
            categorias = Categoria.objects.all()
            reservas_activas = Reserva.objects.filter(estado='activa').select_related('libro')
            
            # Crear contexto con información de la biblioteca
            contexto_libros = "\n".join([
                f"Libro: {libro.titulo}, Autor: {libro.autor}, Categoría: {libro.categoria.nombre if libro.categoria else 'Sin categoría'}, " +
                f"Disponible: {'Sí' if libro.disponible else 'No'}, " +
                f"Estado de reserva: {'Reservado' if libro.reservas.filter(estado='activa').exists() else 'Libre'}, " +
                f"Fecha de ingreso: {libro.fecha_creacion.strftime('%Y-%m-%d')}"
                for libro in libros[:20]  # Limitar a los primeros 20 libros para no exceder el límite de tokens
            ])
            
            contexto_categorias = ", ".join([cat.nombre for cat in categorias])
            
            # Estadísticas de reservas
            total_reservas = reservas_activas.count()
            libros_reservados = reservas_activas.values_list('libro__titulo', flat=True)[:8]
            
            prompt = f"""
            Eres el asistente de una biblioteca digital. Tu objetivo es ayudar a los usuarios a encontrar libros y recursos, así como gestionar consultas sobre reservas.
            
            Información de la biblioteca:
            Categorías disponibles: {contexto_categorias}
            Total de reservas activas: {total_reservas}
            Libros más reservados recientemente: {', '.join(libros_reservados) if libros_reservados else 'Ninguno'}
            
            Algunos libros disponibles:
            {contexto_libros}
            
            La consulta del usuario es: "{consulta}"
            
            Puedes responder sobre:
            - Búsqueda de libros por título, autor, categoría o tema
            - Estado de disponibilidad de libros
            - Información sobre reservas (cuántos libros están reservados, cuáles están disponibles)
            - Recomendaciones de libros
            - Preguntas generales sobre el funcionamiento de la biblioteca
            
            Si la consulta parece ser una búsqueda de libros, responde con formato JSON que contenga:
            1. Una lista de libros recomendados basados en la consulta
            2. Una explicación amigable de tu respuesta
            3. Sugerencias relacionadas
            
            Formato del JSON para búsqueda:
            {{"tipo": "busqueda", "recomendaciones": ["título1", "título2"], "explicacion": "texto explicativo", "sugerencias": ["sugerencia1", "sugerencia2"]}}
            
            Si la consulta es sobre reservas o disponibilidad, responde con este formato:
            {{"tipo": "reservas", "respuesta": "información sobre reservas", "libros_disponibles": ["título1", "título2"], "libros_no_disponibles": ["título3", "título4"]}}
            
            IMPORTANTE para consultas de reservas:
            - Si el usuario pregunta por libros DISPONIBLES, incluye solo la lista "libros_disponibles"
            - Si el usuario pregunta por libros NO DISPONIBLES, RESERVADOS o PRESTADOS, incluye solo la lista "libros_no_disponibles"
            - Si el usuario pregunta por TODOS los libros o no especifica, incluye ambas listas
            - Incluye el título exacto de los libros tal como aparecen en la información proporcionada
            
            Si la consulta es una pregunta general sobre la biblioteca o cómo usarla, responde con formato JSON:
            {{"tipo": "informacion", "respuesta": "tu respuesta detallada aquí"}}
            
            Responde basándote únicamente en la información proporcionada arriba a menos que la consulta explícitamente pida otra cosa.
            
            IMPORTANTE: Responde únicamente con el JSON, sin formato markdown, sin backticks, y sin texto adicional.
            """
            
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
        
        # Manejar respuesta de tipo búsqueda
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
        
        # Manejar respuesta de tipo reservas
        elif resultado.get("tipo") == "reservas":
            libros_disponibles = resultado.get("libros_disponibles", [])
            libros_no_disponibles = resultado.get("libros_no_disponibles", [])
            libros_encontrados = []
            
            # Buscar libros disponibles
            for titulo in libros_disponibles:
                libros = Libro.objects.filter(titulo__iexact=titulo, disponible=True)
                if not libros.exists():
                    libros = Libro.objects.filter(titulo__icontains=titulo, disponible=True)
                libros_encontrados.extend(libros)
            
            # Buscar libros no disponibles
            for titulo in libros_no_disponibles:
                libros = Libro.objects.filter(titulo__iexact=titulo, disponible=False)
                if not libros.exists():
                    libros = Libro.objects.filter(titulo__icontains=titulo, disponible=False)
                libros_encontrados.extend(libros)
            
            # Si no se especificaron listas, buscar según el contexto de la consulta
            if not libros_disponibles and not libros_no_disponibles:
                # Analizar la consulta para determinar qué buscar
                consulta_lower = consulta.lower()
                if any(palabra in consulta_lower for palabra in ['reservado', 'prestado', 'no disponible', 'ocupado']):
                    # Usuario busca libros no disponibles
                    libros_encontrados = list(Libro.objects.filter(disponible=False))
                elif any(palabra in consulta_lower for palabra in ['disponible', 'libre', 'sin reservar']):
                    # Usuario busca libros disponibles
                    libros_encontrados = list(Libro.objects.filter(disponible=True))
                else:
                    # Si no está claro, mostrar todos los libros mencionados en la respuesta
                    libros_encontrados = []
            
            return {
                "libros": libros_encontrados,
                "explicacion": resultado.get("respuesta", ""),
                "sugerencias": []
            }
        
        # Manejar otros tipos de respuesta
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
    
    def consultar_disponibilidad(self, libro_id):
        """Consulta si un libro está disponible para reservar"""
        try:
            libro = Libro.objects.get(id=libro_id)
            reserva_activa = libro.reservas.filter(estado='activa').first()
            
            if libro.puede_reservarse():
                return {
                    "disponible": True,
                    "mensaje": f"El libro '{libro.titulo}' está disponible para reservar.",
                    "libro": {
                        "id": libro.id,
                        "titulo": libro.titulo,
                        "autor": libro.autor
                    }
                }
            else:
                mensaje = f"El libro '{libro.titulo}' no está disponible."
                if reserva_activa:
                    dias_restantes = (reserva_activa.fecha_vencimiento - timezone.now()).days
                    mensaje += f" Está reservado hasta {reserva_activa.fecha_vencimiento.strftime('%d/%m/%Y')} ({dias_restantes} días restantes)."
                
                return {
                    "disponible": False,
                    "mensaje": mensaje,
                    "reserva": {
                        "fecha_vencimiento": reserva_activa.fecha_vencimiento.isoformat() if reserva_activa else None
                    } if reserva_activa else None
                }
        except Libro.DoesNotExist:
            return {"error": "Libro no encontrado"}
    
    def obtener_estadisticas_reservas(self):
        """Genera estadísticas sobre las reservas"""
        try:
            total_libros = Libro.objects.count()
            libros_disponibles = Libro.objects.filter(disponible=True).count()
            reservas_activas = Reserva.objects.filter(estado='activa').count()
            reservas_vencidas = Reserva.objects.filter(estado='vencida').count()
            
            # Libros más reservados
            from django.db.models import Count
            libros_populares = Libro.objects.annotate(
                num_reservas=Count('reservas')
            ).filter(num_reservas__gt=0).order_by('-num_reservas')[:5]
            
            return {
                "tipo": "estadisticas",
                "datos": {
                    "total_libros": total_libros,
                    "libros_disponibles": libros_disponibles,
                    "libros_reservados": total_libros - libros_disponibles,
                    "reservas_activas": reservas_activas,
                    "reservas_vencidas": reservas_vencidas,
                    "libros_populares": [
                        {
                            "titulo": libro.titulo,
                            "autor": libro.autor,
                            "num_reservas": libro.num_reservas
                        }
                        for libro in libros_populares
                    ]
                }
            }
        except Exception as e:
            return {"tipo": "error", "respuesta": f"Error al obtener estadísticas: {str(e)}"}

