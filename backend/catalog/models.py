from django.conf import settings
from django.db import models

class State(models.Model):
    name = models.CharField(max_length=80, unique=True)
    def __str__(self): return self.name

class Area(models.Model):
    state = models.ForeignKey(State, related_name='areas', on_delete=models.CASCADE)
    name = models.CharField(max_length=80)
    class Meta: constraints = [models.UniqueConstraint(fields=['state', 'name'], name='unique_state_area')]
    def __str__(self): return f'{self.name}, {self.state.name}'

class MedicalStore(models.Model):
    name = models.CharField(max_length=160)
    area = models.ForeignKey(Area, related_name='stores', on_delete=models.PROTECT)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=240)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.5)
    delivery_available = models.BooleanField(default=True)
    is_open = models.BooleanField(default=True)
    verified = models.BooleanField(default=False)
    def __str__(self): return self.name

class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    def __str__(self): return self.name

class Medicine(models.Model):
    store = models.ForeignKey(MedicalStore, related_name='medicines', on_delete=models.CASCADE)
    category = models.ForeignKey(Category, related_name='medicines', on_delete=models.PROTECT)
    name = models.CharField(max_length=160)
    brand = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    expiry_date = models.DateField(null=True, blank=True)
    prescription_required = models.BooleanField(default=False)
    image = models.ImageField(upload_to='medicines/', blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.name

class Order(models.Model):
    STATUS_CHOICES = [('PLACED', 'Placed'), ('CONFIRMED', 'Confirmed'), ('PREPARING', 'Preparing'), ('OUT_FOR_DELIVERY', 'Out for delivery'), ('DELIVERED', 'Delivered'), ('CANCELLED', 'Cancelled')]
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='orders', on_delete=models.PROTECT)
    store = models.ForeignKey(MedicalStore, related_name='orders', on_delete=models.PROTECT)
    order_id = models.CharField(max_length=20, unique=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=20, default='COD')
    payment_status = models.CharField(max_length=20, default='PENDING')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PLACED')
    created_at = models.DateTimeField(auto_now_add=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    medicine = models.ForeignKey(Medicine, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

class Cart(models.Model):
    customer = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='cart', on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    class Meta: constraints = [models.UniqueConstraint(fields=['cart', 'medicine'], name='unique_cart_medicine')]
