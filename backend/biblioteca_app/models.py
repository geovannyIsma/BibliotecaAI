from django.db import models


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

class Consulta(models.Model):
    texto = models.TextField()
    respuesta = models.TextField(blank=True)
    fecha = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.texto[:50]