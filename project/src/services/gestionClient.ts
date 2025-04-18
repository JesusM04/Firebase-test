import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  and,
  onSnapshot
} from 'firebase/firestore';
import { db, verificarConexionFirestore } from './firebaseClient';

export type PrioridadActividad = 'alta' | 'media' | 'baja' | null;

export interface Actividad {
  id: string;
  texto: string;
  isCompleted: boolean;
  userId: string;
  createdAt: Timestamp;
  comentario?: string;
  prioridad?: PrioridadActividad;
  horaInicio?: Timestamp;
  horaFin?: Timestamp;
  completedAt?: Timestamp | null;
}

// Verificar si hay conflicto de horarios
const verificarConflictoHorario = async (
  userId: string,
  horaInicio: Timestamp,
  horaFin: Timestamp,
  actividadId?: string
): Promise<boolean> => {
  try {
    const constraints = [
      where('userId', '==', userId),
      where('horaInicio', '!=', null),
      where('horaFin', '!=', null),
      where('isCompleted', '==', false)
    ];

    if (actividadId) {
      constraints.push(where('id', '!=', actividadId));
    }

    const q = query(
      collection(db, 'actividad'),
      and(...constraints)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.some(doc => {
      const actividad = doc.data();
      const inicio = actividad.horaInicio?.toDate();
      const fin = actividad.horaFin?.toDate();
      
      if (!inicio || !fin) return false;

      const nuevoInicio = horaInicio.toDate();
      const nuevoFin = horaFin.toDate();

      return (
        (nuevoInicio >= inicio && nuevoInicio < fin) ||
        (nuevoFin > inicio && nuevoFin <= fin) ||
        (nuevoInicio <= inicio && nuevoFin >= fin)
      );
    });
  } catch (error) {
    console.error('❌ Error al verificar conflicto de horarios:', error);
    return false;
  }
};

// Guardar una nueva actividad
export const guardarActividad = async (
  texto: string, 
  userId: string, 
  {
    comentario,
    prioridad,
    horaInicio,
    horaFin
  }: {
    comentario?: string;
    prioridad?: PrioridadActividad;
    horaInicio?: Date;
    horaFin?: Date;
  }
): Promise<Actividad> => {
  try {
    // Verificar conflicto de horarios si se especifican horas
    if (horaInicio && horaFin) {
      const horaInicioTimestamp = Timestamp.fromDate(horaInicio);
      const horaFinTimestamp = Timestamp.fromDate(horaFin);

      if (horaInicio >= horaFin) {
        throw new Error('La hora de inicio debe ser anterior a la hora de fin');
      }

      const hayConflicto = await verificarConflictoHorario(
        userId,
        horaInicioTimestamp,
        horaFinTimestamp
      );

      if (hayConflicto) {
        throw new Error('Ya existe una actividad programada para ese horario');
      }
    }

    const nuevaActividad = {
      texto: texto.trim(),
      isCompleted: false,
      userId,
      createdAt: Timestamp.now(),
      comentario: comentario?.trim(),
      prioridad: prioridad || null,
      horaInicio: horaInicio ? Timestamp.fromDate(horaInicio) : null,
      horaFin: horaFin ? Timestamp.fromDate(horaFin) : null,
      completedAt: null
    };

    const docRef = await addDoc(collection(db, 'actividad'), nuevaActividad);
    return {
      id: docRef.id,
      ...nuevaActividad,
    } as Actividad;
  } catch (error) {
    console.error('❌ Error al guardar actividad:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Error al guardar la actividad');
  }
};

// Obtener actividades de un usuario
export const obtenerActividades = async (userId: string): Promise<Actividad[]> => {
  try {
    if (!userId) {
      throw new Error('ID de usuario no proporcionado');
    }

    // Verificar conexión a Firestore
    const conexionExitosa = await verificarConexionFirestore();
    if (!conexionExitosa) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    console.log('🔍 Obteniendo actividades para el usuario:', userId);
    
    const actividadesRef = collection(db, 'actividad');
    const q = query(
      actividadesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('ℹ️ No se encontraron actividades para el usuario');
      return [];
    }

    const actividades = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        texto: data.texto || '',
        isCompleted: Boolean(data.isCompleted),
        userId: data.userId,
        createdAt: data.createdAt,
        comentario: data.comentario || '',
        prioridad: data.prioridad || null,
        horaInicio: data.horaInicio || null,
        horaFin: data.horaFin || null,
        completedAt: data.completedAt || null
      } as Actividad;
    });

    console.log(`✅ Se encontraron ${actividades.length} actividades`);
    return actividades;
  } catch (error) {
    console.error('❌ Error al obtener actividades:', error);
    if (error instanceof Error) {
      throw new Error(`Error al obtener actividades: ${error.message}`);
    }
    throw new Error('Error al obtener actividades');
  }
};

// Suscribirse a cambios en tiempo real
export const suscribirseAActividades = (
  userId: string,
  onActividadesActualizadas: (actividades: Actividad[]) => void,
  onError: (error: Error) => void
) => {
  if (!userId) {
    onError(new Error('ID de usuario no proporcionado'));
    return () => {};
  }

  const actividadesRef = collection(db, 'actividad');
  const q = query(
    actividadesRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const actividades = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          texto: data.texto || '',
          isCompleted: Boolean(data.isCompleted),
          userId: data.userId,
          createdAt: data.createdAt,
          comentario: data.comentario || '',
          prioridad: data.prioridad || null,
          horaInicio: data.horaInicio || null,
          horaFin: data.horaFin || null,
          completedAt: data.completedAt || null
        } as Actividad;
      });
      onActividadesActualizadas(actividades);
    },
    (error) => {
      console.error('❌ Error en la suscripción:', error);
      onError(new Error('Error al suscribirse a las actualizaciones'));
    }
  );
};

// Marcar actividad como completada
export const marcarComoCompletada = async (
  actividadId: string, 
  isCompleted: boolean
): Promise<void> => {
  try {
    const actividadRef = doc(db, 'actividad', actividadId);
    await updateDoc(actividadRef, { 
      isCompleted,
      completedAt: isCompleted ? Timestamp.now() : null
    });
  } catch (error) {
    console.error('❌ Error al actualizar actividad:', error);
    throw new Error('Error al actualizar el estado de la actividad');
  }
};

// Eliminar una actividad
export const eliminarActividad = async (actividadId: string): Promise<void> => {
  try {
    const actividadRef = doc(db, 'actividad', actividadId);
    await deleteDoc(actividadRef);
  } catch (error) {
    console.error('❌ Error al eliminar actividad:', error);
    throw new Error('Error al eliminar la actividad');
  }
};

// Función de prueba para guardar una actividad
export const guardarActividadDePrueba = async () => {
  try {
    const actividadPrueba = await guardarActividad(
      'Actividad de prueba',
      'usuario_prueba',
      {
        comentario: 'Este es un comentario de prueba',
        prioridad: 'alta',
        horaInicio: new Date('2024-05-01T10:00:00'),
        horaFin: new Date('2024-05-01T12:00:00')
      }
    );
    console.log('✅ Actividad de prueba guardada:', actividadPrueba);
  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
};

// Descomentar para probar:
// guardarActividadDePrueba(); 