import React from 'react';
import { Trash2, Check, Clock, AlertTriangle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import type { Actividad } from '../services/gestionClient';

interface ActividadCardProps {
  actividad: Actividad;
  onToggleCompletada: (id: string, isCompleted: boolean) => Promise<void>;
  onEliminar: (id: string) => Promise<void>;
  isDarkMode?: boolean;
}

const PRIORIDAD_ESTILOS = {
  alta: {
    light: {
      container: 'border-l-4 border-l-red-500',
      badge: 'bg-red-100 text-red-800',
      icon: 'text-red-500'
    },
    dark: {
      container: 'border-l-4 border-l-red-500',
      badge: 'bg-red-900/50 text-red-300',
      icon: 'text-red-400'
    }
  },
  media: {
    light: {
      container: 'border-l-4 border-l-yellow-500',
      badge: 'bg-yellow-100 text-yellow-800',
      icon: 'text-yellow-500'
    },
    dark: {
      container: 'border-l-4 border-l-yellow-500',
      badge: 'bg-yellow-900/50 text-yellow-300',
      icon: 'text-yellow-400'
    }
  },
  baja: {
    light: {
      container: 'border-l-4 border-l-blue-500',
      badge: 'bg-blue-100 text-blue-800',
      icon: 'text-blue-500'
    },
    dark: {
      container: 'border-l-4 border-l-blue-500',
      badge: 'bg-blue-900/50 text-blue-300',
      icon: 'text-blue-400'
    }
  },
  null: {
    light: {
      container: 'border-l-4 border-l-gray-300',
      badge: 'bg-gray-100 text-gray-800',
      icon: 'text-gray-500'
    },
    dark: {
      container: 'border-l-4 border-l-gray-600',
      badge: 'bg-gray-800 text-gray-300',
      icon: 'text-gray-400'
    }
  }
};

const formatearHora = (timestamp: Timestamp | null | undefined): string => {
  if (!timestamp) return '';
  const fecha = timestamp.toDate();
  return fecha.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const ActividadCard: React.FC<ActividadCardProps> = ({
  actividad,
  onToggleCompletada,
  onEliminar,
  isDarkMode = false
}) => {
  const theme = isDarkMode ? 'dark' : 'light';
  const estilos = PRIORIDAD_ESTILOS[actividad.prioridad || 'null'][theme];

  return (
    <div 
      className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm mb-3 p-4 ${
        estilos.container
      } transform transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {actividad.prioridad && (
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${estilos.badge}`}>
                {actividad.prioridad.toUpperCase()}
              </span>
            )}
            {(actividad.horaInicio && actividad.horaFin) && (
              <div className={`flex items-center text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Clock className="w-4 h-4 mr-1" />
                <span>{formatearHora(actividad.horaInicio)} - {formatearHora(actividad.horaFin)}</span>
              </div>
            )}
          </div>
          
          <h3 className={`text-lg font-medium mb-1 ${
            actividad.isCompleted 
              ? 'line-through text-gray-500' 
              : isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {actividad.texto}
          </h3>
          
          {actividad.comentario && (
            <p className={`text-sm mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {actividad.comentario}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onToggleCompletada(actividad.id, actividad.isCompleted)}
              className={`inline-flex items-center px-2.5 py-1.5 border rounded-md text-sm font-medium transition-colors
                ${actividad.isCompleted 
                  ? isDarkMode
                    ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  : isDarkMode
                    ? 'border-green-600 text-green-400 hover:bg-gray-700'
                    : 'border-green-300 text-green-700 hover:bg-green-50'
                }`}
            >
              <Check className="w-4 h-4 mr-1" />
              {actividad.isCompleted ? 'Desmarcar' : 'Completar'}
            </button>
            
            <button
              onClick={() => onEliminar(actividad.id)}
              className={`inline-flex items-center px-2.5 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'border-red-800 text-red-400 hover:bg-gray-700'
                  : 'border-red-300 text-red-700 hover:bg-red-50'
              }`}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActividadCard; 