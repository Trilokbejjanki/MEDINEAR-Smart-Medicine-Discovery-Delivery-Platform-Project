from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import CartView, CategoryViewSet, EmailLoginView, LogoutView, MedicineViewSet, OrderViewSet, StateViewSet, StoreViewSet, areas, health, register

router = DefaultRouter()
router.register('states', StateViewSet, basename='state')
router.register('categories', CategoryViewSet, basename='category')
router.register('stores', StoreViewSet, basename='store')
router.register('medicines', MedicineViewSet, basename='medicine')
router.register('orders', OrderViewSet, basename='order')
urlpatterns = [path('health/', health), path('register/', register), path('login/', EmailLoginView.as_view()), path('logout/', LogoutView.as_view()), path('cart/', CartView.as_view()), path('token/refresh/', TokenRefreshView.as_view()), path('states/<int:state_id>/areas/', areas), path('', include(router.urls))]
