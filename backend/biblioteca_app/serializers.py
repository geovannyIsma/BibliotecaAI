from rest_framework import serializers
from .models import Libro, Categoria, Consulta, Reserva
from django.contrib.auth.models import User

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class LibroSerializer(serializers.ModelSerializer):
    nombre_categoria = serializers.SerializerMethodField()
    
    class Meta:
        model = Libro
        fields = '__all__'
    
    def get_nombre_categoria(self, obj):
        return obj.categoria.nombre if obj.categoria else None

class ConsultaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consulta
        fields = '__all__'
        read_only_fields = ('respuesta', 'fecha')

class ReservaSerializer(serializers.ModelSerializer):
    libro_titulo = serializers.CharField(source='libro.titulo', read_only=True)
    libro_autor = serializers.CharField(source='libro.autor', read_only=True)
    dias_restantes = serializers.SerializerMethodField()
    
    class Meta:
        model = Reserva
        fields = '__all__'
        read_only_fields = ('fecha_reserva', 'fecha_devolucion', 'estado')
    
    def get_dias_restantes(self, obj):
        if obj.estado == 'activa':
            from django.utils import timezone
            delta = obj.fecha_vencimiento - timezone.now()
            return delta.days if delta.days > 0 else 0
        return None
    
    def validate(self, data):
        """Valida que el libro esté disponible antes de crear la reserva"""
        libro = data.get('libro')
        if not libro.puede_reservarse():
            raise serializers.ValidationError("El libro no está disponible para reserva")
        return data

class LibroDetalleSerializer(serializers.ModelSerializer):
    """Serializer extendido con información de reservas"""
    nombre_categoria = serializers.SerializerMethodField()
    reserva_activa = serializers.SerializerMethodField()
    class Meta:
        model = Libro
        fields = '__all__'
    
    def get_nombre_categoria(self, obj):
        return obj.categoria.nombre if obj.categoria else None
    
    def get_reserva_activa(self, obj):
        reserva = obj.reservas.filter(estado='activa').first()
        if reserva:
            return ReservaSerializer(reserva).data
        return None


