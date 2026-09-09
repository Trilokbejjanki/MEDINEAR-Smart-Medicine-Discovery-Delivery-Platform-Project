from django.contrib import admin
from .models import Area, Category, MedicalStore, Medicine, Order, OrderItem, State

admin.site.register([State, Area, MedicalStore, Category, Medicine, Order, OrderItem])
