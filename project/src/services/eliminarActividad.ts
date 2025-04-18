import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseClient.ts'; // Asegúrate de que la ruta sea correcta

async function eliminarActividad(id: string) {
  try {
    // Referencia del documento a eliminar
    const actividadRef = doc(db, 'actividad', id);

    // Eliminar el documento
    await deleteDoc(actividadRef);

    console.log('✅ Actividad eliminada con éxito!');
  } catch (error) {
    console.error('❌ Error al eliminar la actividad:', error);
  }
}

// Exportamos la función para usarla en otros lugares
export { eliminarActividad };
