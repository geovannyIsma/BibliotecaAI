from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Libro, Categoria, Consulta
from .serializers import LibroSerializer, CategoriaSerializer, ConsultaSerializer
from .ai_bibliotecario import BibliotecarioIA
from django.db.models import Q

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

    def create(self, request, *args, **kwargs):
        es_lista = isinstance(request.data, list)
        serializer = self.get_serializer(data=request.data, many=es_lista)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
class LibroViewSet(viewsets.ModelViewSet):
    queryset = Libro.objects.all()
    serializer_class = LibroSerializer

    def create(self, request, *args, **kwargs):
        """Permite crear uno o varios libros"""
        es_lista = isinstance(request.data, list)
        serializer = self.get_serializer(data=request.data, many=es_lista)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def get_queryset(self):
        """Permite búsquedas simples por título, autor o categoría"""
        queryset = Libro.objects.all()
        query = self.request.query_params.get('q')
        categoria = self.request.query_params.get('categoria')
        
        if query:
            queryset = queryset.filter(
                Q(titulo__icontains=query) | 
                Q(autor__icontains=query) |
                Q(sinopsis__icontains=query)
            )
            
        if categoria:
            queryset = queryset.filter(categoria__nombre__icontains=categoria)
            
        return queryset

class BibliotecarioViewSet(viewsets.ViewSet):
    """ViewSet para interactuar con el asistente de IA"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.bibliotecario = BibliotecarioIA()
    
    @action(detail=False, methods=['post'])
    def consulta(self, request):
        texto_consulta = request.data.get('consulta', '')
        
        if not texto_consulta:
            return Response(
                {"error": "La consulta no puede estar vacía"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        consulta = Consulta(texto=texto_consulta)
        
        resultado = self.bibliotecario.procesar_consulta(texto_consulta)
        
        consulta.respuesta = str(resultado)
        consulta.save()
        
        return Response(resultado)
    
    @action(detail=False, methods=['post'])
    def buscar_libros(self, request):
        texto_consulta = request.data.get('consulta', '')
        
        if not texto_consulta:
            return Response(
                {"error": "La consulta no puede estar vacía"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        resultado = self.bibliotecario.buscar_libros(texto_consulta)
        
        libros_serializados = LibroSerializer(
            resultado["libros"], 
            many=True, 
            context={'request': request}
        ).data
        
        return Response({
            "libros": libros_serializados,
            "explicacion": resultado["explicacion"],
            "sugerencias": resultado["sugerencias"]
        })
    
    @action(detail=True, methods=['get'])
    def sugerencias(self, request, pk=None):
        resultado = self.bibliotecario.obtener_sugerencias(pk)
        return Response(resultado)

class ConsultaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Consulta.objects.all().order_by('-fecha')
    serializer_class = ConsultaSerializer
