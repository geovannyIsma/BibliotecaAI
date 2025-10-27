from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Libro, Categoria, Consulta, Reserva
from .serializers import LibroSerializer, CategoriaSerializer, ConsultaSerializer, ReservaSerializer, LibroDetalleSerializer
from .ai_bibliotecario import BibliotecarioIA
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta

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

    def get_serializer_class(self):
        """Usa serializer con más detalle para retrieve"""
        if self.action == 'retrieve':
            return LibroDetalleSerializer
        return LibroSerializer

    def create(self, request, *args, **kwargs):
        """Permite crear uno o varios libros"""
        es_lista = isinstance(request.data, list)
        serializer = self.get_serializer(data=request.data, many=es_lista)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def get_queryset(self):
        """Permite búsquedas simples por título, autor, categoría, disponibilidad o fecha"""
        queryset = Libro.objects.all()
        query = self.request.query_params.get('q')
        categoria = self.request.query_params.get('categoria')
        disponible = self.request.query_params.get('disponible')
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        
        if query:
            queryset = queryset.filter(
                Q(titulo__icontains=query) | 
                Q(autor__icontains=query) |
                Q(sinopsis__icontains=query)
            )
            
        if categoria:
            queryset = queryset.filter(categoria__nombre__icontains=categoria)
            
        if disponible is not None:
            is_disponible = disponible.lower() == 'true'
            queryset = queryset.filter(disponible=is_disponible)
            
        if fecha_desde:
            queryset = queryset.filter(fecha_creacion__gte=fecha_desde)
            
        if fecha_hasta:
            queryset = queryset.filter(fecha_creacion__lte=fecha_hasta)
            
        return queryset
    
    @action(detail=True, methods=['post'])
    def reservar(self, request, pk=None):
        """Reserva un libro"""
        libro = self.get_object()
        
        if not libro.puede_reservarse():
            return Response(
                {"error": "El libro no está disponible para reserva"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        usuario_nombre = request.data.get('usuario_nombre')
        usuario_email = request.data.get('usuario_email')
        dias_prestamo = int(request.data.get('dias_prestamo', 14))
        
        if not usuario_nombre or not usuario_email:
            return Response(
                {"error": "Se requiere nombre y email del usuario"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        fecha_vencimiento = timezone.now() + timedelta(days=dias_prestamo)
        
        reserva = Reserva.objects.create(
            libro=libro,
            usuario_nombre=usuario_nombre,
            usuario_email=usuario_email,
            fecha_vencimiento=fecha_vencimiento,
            notas=request.data.get('notas', '')
        )
        
        libro.disponible = False
        libro.save()
        
        serializer = ReservaSerializer(reserva)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def devolver(self, request, pk=None):
        """Devuelve un libro (completa la reserva activa)"""
        libro = self.get_object()
        
        reserva = libro.reservas.filter(estado='activa').first()
        
        if not reserva:
            return Response(
                {"error": "No hay reserva activa para este libro"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if reserva.completar():
            serializer = ReservaSerializer(reserva)
            return Response(serializer.data)
        
        return Response(
            {"error": "No se pudo completar la devolución"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

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
    
    @action(detail=True, methods=['get'])
    def disponibilidad(self, request, pk=None):
        """Consulta la disponibilidad de un libro específico"""
        resultado = self.bibliotecario.consultar_disponibilidad(pk)
        return Response(resultado)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Obtiene estadísticas sobre reservas y libros"""
        resultado = self.bibliotecario.obtener_estadisticas_reservas()
        return Response(resultado)

class ConsultaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Consulta.objects.all().order_by('-fecha')
    serializer_class = ConsultaSerializer

class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer
    
    def get_queryset(self):
        """Permite filtrar reservas por estado, email, o libro"""
        queryset = Reserva.objects.all()
        estado = self.request.query_params.get('estado')
        email = self.request.query_params.get('email')
        libro_id = self.request.query_params.get('libro')
        
        if estado:
            queryset = queryset.filter(estado=estado)
        
        if email:
            queryset = queryset.filter(usuario_email=email)
        
        if libro_id:
            queryset = queryset.filter(libro_id=libro_id)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Cancela una reserva"""
        reserva = self.get_object()
        
        if reserva.cancelar():
            serializer = self.get_serializer(reserva)
            return Response(serializer.data)
        
        return Response(
            {"error": "No se pudo cancelar la reserva. Verifica que esté activa."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['post'])
    def verificar_vencidas(self, request):
        """Marca como vencidas las reservas que pasaron su fecha de vencimiento"""
        reservas_vencidas = Reserva.objects.filter(
            estado='activa',
            fecha_vencimiento__lt=timezone.now()
        )
        
        count = 0
        for reserva in reservas_vencidas:
            reserva.estado = 'vencida'
            reserva.save()
            count += 1
        
        return Response({"reservas_vencidas": count})
