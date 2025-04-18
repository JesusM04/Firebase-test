import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseClient.ts'; // Asegúrate de que la ruta sea correcta

async function completarActividad(id: string) {
  try {
    // Referencia del documento a actualizar
    const actividadRef = doc(db, 'actividad', id);

    // Actualizamos el estado de la actividad
    await updateDoc(actividadRef, { isCompleted: true });

    console.log('✅ Actividad completada con éxito!');
  } catch (error) {
    console.error('❌ Error al completar la actividad:', error);
  }
}

// Exportamos la función para usarla en otros lugares
export { completarActividad };
