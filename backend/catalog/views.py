from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from decimal import Decimal
from uuid import uuid4
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Area, Cart, CartItem, Category, MedicalStore, Medicine, Order, OrderItem, State
from .serializers import AreaSerializer, CartItemSerializer, CategorySerializer, EmailTokenObtainPairSerializer, MedicineSerializer, OrderSerializer, RegisterSerializer, StateSerializer, StoreSerializer

class ReadOnlyModelViewSet(viewsets.ReadOnlyModelViewSet): pass
class StateViewSet(ReadOnlyModelViewSet): queryset = State.objects.all().order_by('name'); serializer_class = StateSerializer
class CategoryViewSet(ReadOnlyModelViewSet): queryset = Category.objects.all().order_by('name'); serializer_class = CategorySerializer
class StoreViewSet(ReadOnlyModelViewSet):
    serializer_class = StoreSerializer
    def get_queryset(self):
        queryset = MedicalStore.objects.select_related('area').filter(verified=True)
        area = self.request.query_params.get('area')
        return queryset.filter(area__name__iexact=area) if area else queryset
class MedicineViewSet(ReadOnlyModelViewSet):
    serializer_class = MedicineSerializer
    def get_queryset(self):
        queryset = Medicine.objects.select_related('store', 'category').filter(is_available=True, stock__gt=0)
        query = self.request.query_params.get('q')
        category = self.request.query_params.get('category')
        if query: queryset = queryset.filter(Q(name__icontains=query) | Q(brand__icontains=query) | Q(store__name__icontains=query))
        if category: queryset = queryset.filter(category__name__iexact=category)
        return queryset.order_by('name')
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self): return Order.objects.filter(customer=self.request.user).prefetch_related('items__medicine').order_by('-created_at')
    def create(self, request, *args, **kwargs):
        items = request.data.get('items', [])
        if not items: return Response({'detail': 'At least one medicine is required.'}, status=400)
        with transaction.atomic():
            first = Medicine.objects.select_related('store').select_for_update().get(pk=items[0]['medicine'])
            delivery_charge = Decimal(str(request.data.get('delivery_charge', 30)))
            subtotal = Decimal('0')
            validated_items = []
            for item in items:
                quantity = int(item.get('quantity', 1))
                medicine = Medicine.objects.select_for_update().get(pk=item['medicine'])
                if quantity < 1 or medicine.stock < quantity or not medicine.is_available:
                    return Response({'detail': f'{medicine.name} is unavailable in the requested quantity.'}, status=400)
                if medicine.store_id != first.store_id:
                    return Response({'detail': 'All items in an order must come from the same store.'}, status=400)
                subtotal += medicine.price * quantity
                validated_items.append((medicine, quantity))
            order = Order.objects.create(customer=request.user, store=first.store, order_id=f'MED-{uuid4().hex[:10].upper()}', total_amount=subtotal + delivery_charge, delivery_charge=delivery_charge, payment_method=request.data.get('payment_method', 'COD'))
            for medicine, quantity in validated_items:
                OrderItem.objects.create(order=order, medicine=medicine, quantity=quantity, unit_price=medicine.price)
                medicine.stock -= quantity
                medicine.save(update_fields=['stock'])
        return Response(self.get_serializer(order).data, status=status.HTTP_201_CREATED)

class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        return Response(CartItemSerializer(cart.items.select_related('medicine__store'), many=True).data)

    def put(self, request):
        cart, _ = Cart.objects.get_or_create(customer=request.user)
        incoming = request.data.get('items', [])
        with transaction.atomic():
            cart.items.all().delete()
            for item in incoming:
                medicine = Medicine.objects.get(pk=item['medicine'])
                quantity = int(item.get('quantity', 1))
                if quantity > 0 and medicine.is_available and medicine.stock >= quantity:
                    CartItem.objects.create(cart=cart, medicine=medicine, quantity=quantity)
        return Response(CartItemSerializer(cart.items.select_related('medicine__store'), many=True).data)

class EmailLoginView(APIView):
    serializer_class = EmailTokenObtainPairSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({'detail': 'Logged out successfully.'})

@api_view(['GET'])
@permission_classes([AllowAny])
def health(request): return Response({'status': 'ok', 'service': 'medinear-api'})
@api_view(['GET'])
@permission_classes([AllowAny])
def areas(request, state_id): return Response(AreaSerializer(Area.objects.filter(state_id=state_id).order_by('name'), many=True).data)
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    return Response({'user': {'id': user.id, 'email': user.email, 'name': user.get_full_name() or user.email, 'role': 'customer'}, 'access': str(refresh.access_token), 'refresh': str(refresh)}, status=201)
