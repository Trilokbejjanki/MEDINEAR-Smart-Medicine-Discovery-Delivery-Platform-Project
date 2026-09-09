from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Area, Cart, CartItem, Category, MedicalStore, Medicine, Order, OrderItem, State

class StateSerializer(serializers.ModelSerializer):
    class Meta: model = State; fields = ['id', 'name']
class AreaSerializer(serializers.ModelSerializer):
    class Meta: model = Area; fields = ['id', 'name', 'state']
class CategorySerializer(serializers.ModelSerializer):
    class Meta: model = Category; fields = ['id', 'name']
class StoreSerializer(serializers.ModelSerializer):
    area_name = serializers.CharField(source='area.name', read_only=True)
    class Meta: model = MedicalStore; fields = ['id', 'name', 'area', 'area_name', 'phone', 'address', 'rating', 'delivery_available', 'is_open', 'verified']
class MedicineSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta: model = Medicine; fields = ['id', 'name', 'brand', 'description', 'price', 'stock', 'expiry_date', 'prescription_required', 'image', 'is_available', 'store', 'store_name', 'category', 'category_name']
class OrderItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    class Meta: model = OrderItem; fields = ['id', 'medicine', 'medicine_name', 'quantity', 'unit_price']
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    class Meta: model = Order; fields = ['id', 'order_id', 'store', 'total_amount', 'delivery_charge', 'payment_method', 'payment_status', 'status', 'created_at', 'items']
class CartItemSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    brand = serializers.CharField(source='medicine.brand', read_only=True)
    price = serializers.DecimalField(source='medicine.price', max_digits=10, decimal_places=2, read_only=True)
    store_name = serializers.CharField(source='medicine.store.name', read_only=True)
    prescription_required = serializers.BooleanField(source='medicine.prescription_required', read_only=True)
    class Meta: model = CartItem; fields = ['id', 'medicine', 'medicine_name', 'brand', 'price', 'store_name', 'prescription_required', 'quantity']
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    class Meta: model = get_user_model(); fields = ['id', 'first_name', 'last_name', 'email', 'password']
    def create(self, validated_data):
        email = validated_data.pop('email').lower()
        return get_user_model().objects.create_user(username=email, email=email, **validated_data)

class EmailTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user_model = get_user_model()
        try:
            user = user_model.objects.get(email=attrs['email'].lower())
        except user_model.DoesNotExist:
            raise serializers.ValidationError({'detail': 'Invalid email or password.'})
        if not user.check_password(attrs['password']) or not user.is_active:
            raise serializers.ValidationError({'detail': 'Invalid email or password.'})
        refresh = RefreshToken.for_user(user)
        return {'refresh': str(refresh), 'access': str(refresh.access_token), 'user': {'id': user.id, 'email': user.email, 'name': user.get_full_name() or user.email, 'role': 'admin' if user.is_staff else 'customer'}}
