import { collection, addDoc } from 'firebase/firestore'; // ✅ Aquí va addDoc
import { db } from './firebaseClient.js'; // ✅ Asegúrate de que esta ruta sea correcta

async function guardarActividadDePrueba() {
  try {
    const nuevaActividad = {
      id: 'Comer',
      isCompleted: false,
      userId: 'usuario123'
    };

    const docRef = await addDoc(collection(db, 'actividad'), nuevaActividad);
    console.log('✅ Documento agregado con ID:', docRef.id);
  } catch (error) {
    console.error('❌ Error al guardar el documento en actividad:', error);
  }
}

guardarActividadDePrueba();
