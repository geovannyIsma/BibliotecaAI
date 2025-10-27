from django.contrib import admin
from .models import Libro, Categoria, Consulta, Reserva

@admin.register(Libro)
class LibroAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'autor', 'isbn', 'categoria', 'disponible', 'fecha_creacion')
    search_fields = ('titulo', 'autor', 'isbn')
    list_filter = ('categoria', 'disponible', 'fecha_creacion')

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')
    search_fields = ('nombre',)

@admin.register(Consulta)
class ConsultaAdmin(admin.ModelAdmin):
    list_display = ('texto', 'fecha')
    search_fields = ('texto',)
    readonly_fields = ('fecha',)

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ('libro', 'usuario_nombre', 'usuario_email', 'estado', 'fecha_reserva', 'fecha_vencimiento')
    search_fields = ('libro__titulo', 'usuario_nombre', 'usuario_email')
    list_filter = ('estado', 'fecha_reserva')
    readonly_fields = ('fecha_reserva', 'fecha_devolucion')
    actions = ['cancelar_reservas', 'completar_reservas']
    
    def cancelar_reservas(self, request, queryset):
        for reserva in queryset:
            reserva.cancelar()
        self.message_user(request, f"{queryset.count()} reservas canceladas")
    cancelar_reservas.short_description = "Cancelar reservas seleccionadas"
    
    def completar_reservas(self, request, queryset):
        for reserva in queryset:
            reserva.completar()
        self.message_user(request, f"{queryset.count()} reservas completadas")
    completar_reservas.short_description = "Completar reservas seleccionadas"
