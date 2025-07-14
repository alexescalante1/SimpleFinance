// // application/hooks/useGoogleAuth.ts
// import { useState } from 'react';
// import { Platform } from 'react-native';
// import { container } from 'tsyringe';
// import * as Google from 'expo-auth-session/providers/google';
// import * as WebBrowser from 'expo-web-browser';
// import { makeRedirectUri } from 'expo-auth-session';
// import { IAuthRepository } from '@/domain/repository/IAuthRepository';
// import { User } from '@/domain/models/User';

// // Configurar WebBrowser para Expo
// WebBrowser.maybeCompleteAuthSession();

// export const useGoogleAuth = () => {
//   const [loading, setLoading] = useState(false);
//   const authRepository = container.resolve<IAuthRepository>('IAuthRepository');

//   // ✅ Configuración con redirect URI explícito
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     webClientId: '496653184884-2cvcfr7qon54istpva1orhbqnccq92dd.apps.googleusercontent.com',
//     androidClientId: '496653184884-2cvcfr7qon54istpva1orhbqnccq92dd.apps.googleusercontent.com',
//     scopes: ['openid', 'profile', 'email'],
    
//     // 🔥 URI explícito que ya funciona
//     redirectUri: 'https://auth.expo.io/@axelone/MyFinanceApp',
//   });
  
//   // Debug: mostrar configuración
//   console.log('🔗 Redirect URI configurado:', request?.redirectUri);

//   const signInWithGoogle = async (): Promise<User> => {
//     try {
//       setLoading(true);
//       console.log('🎯 Iniciando Google Auth...');

//       if (!request) {
//         console.log('❌ Request no disponible');
//         throw new Error('Google Auth no configurado');
//       }

//       console.log('📋 Configuración request:', {
//         clientId: request.clientId ? 'OK' : 'NO',
//         redirectUri: request.redirectUri,
//       });

//       // ✅ Usar promptAsync correctamente (no startAsync)
//       const result = await promptAsync();
      
//       console.log('📱 Resultado tipo:', result.type);
//       console.log('📱 Resultado completo:', result);

//       if (result.type === 'cancel') {
//         console.log('❌ Usuario canceló');
//         throw new Error('Autenticación cancelada');
//       }

//       if (result.type === 'dismiss') {
//         console.log('❌ Ventana cerrada');
//         throw new Error('Ventana cerrada - verifica configuración');
//       }

//       if (result.type === 'error') {
//         console.log('❌ Error en auth:', result.error);
//         throw new Error(`Error de autenticación: ${result.error}`);
//       }

//       if (result.type !== 'success') {
//         console.log('❌ Tipo inesperado:', result.type);
//         console.log('❌ Resultado completo:', result);
//         throw new Error(`Error: ${result.type}`);
//       }

//       // Verificar parámetros obtenidos
//       console.log('📋 Parámetros disponibles:', Object.keys(result.params || {}));
//       console.log('📋 Params completos:', result.params);
      
//       // Obtener tokens de manera más simple
//       const { access_token, id_token } = result.params || {};
//       const token = access_token || id_token;

//       if (!token) {
//         console.log('❌ Sin token. Params:', result.params);
//         throw new Error('No se obtuvo token de autenticación');
//       }

//       console.log('✅ Token obtenido:', token.substring(0, 20) + '...');

//       // Obtener información del usuario de manera más simple
//       let googleUserInfo;
      
//       if (access_token) {
//         console.log('📞 Llamando a Google API con access token...');
//         try {
//           const userResponse = await fetch(
//             `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`
//           );

//           if (userResponse.ok) {
//             googleUserInfo = await userResponse.json();
//             console.log('👤 Usuario obtenido de Google:', {
//               name: googleUserInfo.name,
//               email: googleUserInfo.email,
//               id: googleUserInfo.id
//             });
//           } else {
//             throw new Error(`API error: ${userResponse.status}`);
//           }
//         } catch (apiError) {
//           console.error('❌ Error en Google API:', apiError);
//           // Fallback con datos mínimos
//           googleUserInfo = {
//             name: 'Usuario Google',
//             email: 'temp@gmail.com',
//             id: 'temp_id'
//           };
//         }
//       } else {
//         console.log('⚠️ Sin access_token, usando datos básicos');
//         googleUserInfo = {
//           name: 'Usuario Google',
//           email: 'temp@gmail.com',
//           id: 'temp_id'
//         };
//       }

//       // Autenticar con Firebase
//       console.log('🔥 Iniciando autenticación con Firebase...');
//       const user = await authRepository.loginWithGoogle(token, googleUserInfo);
//       console.log('✅ Login Firebase completado:', user.email);

//       return user;

//     } catch (error: any) {
//       console.error('❌ Error completo:', {
//         message: error.message,
//         stack: error.stack
//       });
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   return {
//     signInWithGoogle,
//     loading,
//     // Exponer para debugging
//     request: request ? 'Configurado' : 'No configurado',
//   };
// };