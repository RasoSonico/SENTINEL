
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import authenticate
from .models import User, UserRole
from .serializers import UserSerializer, UserRoleSerializer
from .permissions import HasRole, IsSameUserOrAdmin
from core import settings

if settings.DEBUG:
    from core.permissions_dev import AllowAnyInDev
    PermissionClass = AllowAnyInDev
    AdminPermissionClass = AllowAnyInDev
else:
    from .permissions import IsSameUserOrAdmin
    PermissionClass = IsSameUserOrAdmin
    AdminPermissionClass = IsAdminUser

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [PermissionClass] #Pruebas
    # permission_classes = [IsSameUserOrAdmin] Desarrollo
    
    def get_permissions(self):
        if settings.DEBUG:
            return [AllowAnyInDev()]
        
        if self.action == 'create':
            return [IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {"error": "Se requieren nombre de usuario y contraseña"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user = authenticate(username=username, password=password)
        
        if not user:
            return Response(
                {"error": "Credenciales inválidas"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        if not user.is_active:
            return Response(
                {"error": "Usuario desactivado"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        # Aquí generarías un token JWT o similar
        # Por ahora devolvemos datos básicos
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "roles": [role.role for role in user.roles.all()]
        })

class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [AdminPermissionClass]
