// 'use client';

// import { useEffect } from 'react';
// import { useSearchParams } from 'next/navigation';
// export default function CallbackPage() {
//   const searchParams = useSearchParams();
//   const token = searchParams.get('token');
  
//   useEffect(() => {
//     if (token) {
//       console.log('Token recibido en CallbackPage:', token);
//       // Puedes almacenar el token en localStorage o hacer lo que necesites
//       // localStorage.setItem('auth_token', token);
//     } else {
//       console.error('No se recibió token en la URL de callback');
//     }
//   }, [token]);

//   return (
//     <div style={{ 
//       padding: '2rem', 
//       textAlign: 'center',
//       maxWidth: '800px',
//       margin: '0 auto',
//       fontFamily: 'system-ui, sans-serif'
//     }}>
//       <h1 style={{ color: '#2563eb' }}>Callback Recibido</h1>
//       {token ? (
//         <div style={{ 
//           backgroundColor: '#f0f9ff', 
//           padding: '1.5rem', 
//           borderRadius: '0.5rem',
//           border: '1px solid #bae6fd',
//           marginTop: '1.5rem'
//         }}>
//           <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0369a1' }}>
//             ✅ Token recibido correctamente:
//           </p>
//           <div style={{ 
//             backgroundColor: '#ecfeff', 
//             padding: '1rem', 
//             borderRadius: '0.375rem',
//             overflowX: 'auto',
//             margin: '1rem 0'
//           }}>
//             <code style={{ 
//               wordBreak: 'break-all',
//               color: '#0e7490',
//               fontSize: '0.9rem',
//               lineHeight: '1.5'
//             }}>{token}</code>
//           </div>
//           <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
//             <button 
//               onClick={() => console.log('Token:', token)}
//               style={{
//                 backgroundColor: '#0ea5e9',
//                 color: 'white',
//                 border: 'none',
//                 padding: '0.5rem 1rem',
//                 borderRadius: '0.375rem',
//                 cursor: 'pointer',
//                 fontWeight: 'bold'
//               }}
//             >
//               Mostrar en consola
//             </button>
//             <button 
//               onClick={() => {
//                 navigator.clipboard.writeText(token)
//                   .then(() => alert('Token copiado al portapapeles'))
//                   .catch(err => console.error('Error al copiar:', err));
//               }}
//               style={{
//                 backgroundColor: '#f0f9ff',
//                 color: '#0ea5e9',
//                 border: '1px solid #0ea5e9',
//                 padding: '0.5rem 1rem',
//                 borderRadius: '0.375rem',
//                 cursor: 'pointer',
//                 fontWeight: 'bold'
//               }}
//             >
//               Copiar token
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div style={{ 
//           backgroundColor: '#fff1f2', 
//           padding: '1.5rem', 
//           borderRadius: '0.5rem',
//           border: '1px solid #fecdd3',
//           marginTop: '1.5rem'
//         }}>
//           <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#be123c' }}>
//             ❌ No se recibió token en la URL.
//           </p>
//           <p style={{ marginTop: '0.5rem', color: '#9f1239' }}>
//             Verifica que la redirección incluya el parámetro token correctamente.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }