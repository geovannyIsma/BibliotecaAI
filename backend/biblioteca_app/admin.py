from django.contrib import admin
from .models import Libro, Categoria, Consulta

@admin.register(Libro)
class LibroAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'autor', 'isbn', 'categoria')
    search_fields = ('titulo', 'autor', 'isbn')
    list_filter = ('categoria',)

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')
    search_fields = ('nombre',)

@admin.register(Consulta)
class ConsultaAdmin(admin.ModelAdmin):
    list_display = ('texto', 'fecha')
    search_fields = ('texto',)
    readonly_fields = ('fecha',)
