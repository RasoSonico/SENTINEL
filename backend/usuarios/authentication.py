import jwt
import requests
from django.conf import settings
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
from .models import User

class AzureExternalIDAuthentication(authentication.BaseAuthentication):
    """
    Autenticación personalizada para validar tokens de Azure External ID
    """
    
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        
        try:
            # Verificar el token con la clave pública de Azure
            jwks_uri = f'https://login.microsoftonline.com/{settings.AZURE_TENANT_ID}/discovery/v2.0/keys'
            jwks_response = requests.get(jwks_uri)
            jwks = jwks_response.json()
            
            # Decodificar el token sin verificar para obtener el kid
            header = jwt.get_unverified_header(token)
            kid = header.get('kid')
            
            # Encontrar la clave correspondiente
            key = None
            for jwk in jwks['keys']:
                if jwk['kid'] == kid:
                    key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
                    break
            
            if not key:
                raise AuthenticationFailed('Invalid token signature')
            
            # Verificar el token
            payload = jwt.decode(
                token,
                key,
                algorithms=['RS256'],
                audience=settings.AZURE_CLIENT_ID,
                options={"verify_exp": True}
            )
            
            # Extraer información del usuario
            oid = payload.get('oid') or payload.get('sub')
            if not oid:
                raise AuthenticationFailed('Invalid token payload')
            
            # Buscar o crear el usuario en la base de datos
            user, created = User.objects.get_or_create(
                outter_id=oid,
                defaults={
                    'username': payload.get('email') or payload.get('preferred_username') or oid,
                    'email': payload.get('email') or '',
                    'first_name': payload.get('given_name') or '',
                    'last_name': payload.get('family_name') or '',
                    'azure_tenant': settings.AZURE_TENANT_ID
                }
            )
            
            # Si el usuario existe pero algunos datos han cambiado, actualizarlos
            if not created:
                update_fields = []
                if user.email != payload.get('email') and payload.get('email'):
                    user.email = payload.get('email')
                    update_fields.append('email')
                if user.first_name != payload.get('given_name') and payload.get('given_name'):
                    user.first_name = payload.get('given_name')
                    update_fields.append('first_name')
                if user.last_name != payload.get('family_name') and payload.get('family_name'):
                    user.last_name = payload.get('family_name')
                    update_fields.append('last_name')
                
                if update_fields:
                    user.save(update_fields=update_fields)
            
            # Asegurarse de que el usuario esté activo
            if not user.is_active:
                raise AuthenticationFailed('User is inactive')
            
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.DecodeError:
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')
    
    def authenticate_header(self, request):
        return 'Bearer'