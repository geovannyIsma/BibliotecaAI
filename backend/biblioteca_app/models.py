from django.db import models
from django.contrib.auth.models import User


# Create your models here.

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.nombre

class Libro(models.Model):
    titulo = models.CharField(max_length=200)
    autor = models.CharField(max_length=100)
    fecha_publicacion = models.DateField()
    isbn = models.CharField(max_length=13, unique=True)
    sinopsis = models.TextField()
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    portada_url = models.URLField(blank=True, null=True)
    paginas = models.IntegerField(default=0)
    idioma = models.CharField(max_length=50, default='Español')
    disponible = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.titulo
    
    def puede_reservarse(self):
        """Verifica si el libro está disponible para reserva"""
        return self.disponible and not self.reservas.filter(estado='activa').exists()

class Consulta(models.Model):
    texto = models.TextField()
    respuesta = models.TextField(blank=True)
    fecha = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.texto[:50]

class Reserva(models.Model):
    ESTADO_CHOICES = [
        ('activa', 'Activa'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
        ('vencida', 'Vencida'),
    ]
    
    libro = models.ForeignKey(Libro, on_delete=models.CASCADE, related_name='reservas')
    usuario_nombre = models.CharField(max_length=100)
    usuario_email = models.EmailField()
    fecha_reserva = models.DateTimeField(auto_now_add=True)
    fecha_vencimiento = models.DateTimeField()
    fecha_devolucion = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activa')
    notas = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-fecha_reserva']
    
    def __str__(self):
        return f"{self.libro.titulo} - {self.usuario_nombre} ({self.estado})"
    
    def cancelar(self):
        """Cancela la reserva y marca el libro como disponible"""
        if self.estado == 'activa':
            self.estado = 'cancelada'
            self.libro.disponible = True
            self.libro.save()
            self.save()
            return True
        return False
    
    def completar(self):
        """Completa la reserva (libro devuelto)"""
        if self.estado == 'activa':
            from django.utils import timezone
            self.estado = 'completada'
            self.fecha_devolucion = timezone.now()
            self.libro.disponible = True
            self.libro.save()
            self.save()
            return True
        return False