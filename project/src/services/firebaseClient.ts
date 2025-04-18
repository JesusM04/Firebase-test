import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, enableIndexedDbPersistence } from 'firebase/firestore';

// 🔐 Reemplaza con tus credenciales reales
// Config de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD5p-cTzJdV7l6qGQtSj4G28KvJZJWNlXk",
    authDomain: "my-first-project-react-f62c9.firebaseapp.com",
    projectId: "my-first-project-react-f62c9",
    storageBucket: "my-first-project-react-f62c9.firebasestorage.app",
    messagingSenderId: "799437345963",
    appId: "1:799437345963:web:834530c339bfae56a853ee"
};

// Inicializa Firebase
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    console.error('Error al inicializar Firebase:', error);
    throw new Error('Error al inicializar la aplicación');
}

// Inicializa Firestore
const db = getFirestore(app);

// Habilitar persistencia offline
enableIndexedDbPersistence(db)
    .then(() => {
        console.log('✅ Persistencia offline habilitada');
    })
    .catch((err) => {
        console.error('❌ Error al habilitar persistencia:', err);
    });

// Función para verificar conexión
export async function verificarConexionFirestore() {
    try {
        const actividadesRef = collection(db, 'actividad');
        const snapshot = await getDocs(actividadesRef);
        console.log('✅ Conectado a Firestore. Colección actividad accesible.');
        return true;
    } catch (error) {
        console.error('❌ Error conectando a Firestore:', error);
        return false;
    }
}

verificarConexionFirestore();

// Exportar instancia de Firestore
export { db }; // ✅ ESTA ES LA LÍNEA CLAVE


