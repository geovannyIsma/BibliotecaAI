from rest_framework import serializers
from .models import Libro, Categoria, Consulta
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


