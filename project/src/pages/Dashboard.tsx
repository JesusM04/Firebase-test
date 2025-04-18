import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Clock, AlertCircle, Sun, Moon } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import type { Actividad, PrioridadActividad } from '../services/gestionClient';
import { 
    guardarActividad, 
    obtenerActividades, 
    marcarComoCompletada, 
    eliminarActividad,
    suscribirseAActividades
} from '../services/gestionClient';
import ActividadCard from '../components/ActividadCard';

const Dashboard: React.FC = () => {
    const { currentUser, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    const [nuevaActividadTexto, setNuevaActividadTexto] = useState('');
    const [comentario, setComentario] = useState('');
    const [prioridad, setPrioridad] = useState<PrioridadActividad>(null);
    const [horaInicio, setHoraInicio] = useState<string>('');
    const [horaFin, setHoraFin] = useState<string>('');
    const [mensaje, setMensaje] = useState('');
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [errorCarga, setErrorCarga] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !currentUser) {
            navigate('/login');
        }
    }, [authLoading, currentUser, navigate]);

    useEffect(() => {
        if (authLoading || !currentUser) {
            return;
        }

        setCargando(true);
        setMensaje('');
        setErrorCarga(null);

        const cargarActividadesIniciales = async () => {
            try {
                console.log('🔍 Intentando cargar actividades para:', currentUser.uid);
                const actividadesData = await obtenerActividades(currentUser.uid);
                console.log('✅ Actividades cargadas exitosamente:', actividadesData.length);
                setActividades(actividadesData);
            } catch (error) {
                console.error('❌ Error en carga inicial:', error);
                setErrorCarga('No se pudieron cargar las actividades. Por favor, verifica tu conexión e intenta de nuevo.');
            } finally {
                setCargando(false);
            }
        };

        let unsubscribe: () => void;
        try {
            console.log('🔄 Configurando suscripción en tiempo real para:', currentUser.uid);
            unsubscribe = suscribirseAActividades(
                currentUser.uid,
                (actividadesActualizadas) => {
                    console.log('✨ Actualización en tiempo real recibida:', actividadesActualizadas.length);
                    setActividades(actividadesActualizadas);
                    setCargando(false);
                    setErrorCarga(null);
                },
                (error) => {
                    console.error('❌ Error en suscripción:', error);
                    setErrorCarga('Error al actualizar las actividades. Por favor, recarga la página.');
                    setCargando(false);
                }
            );
        } catch (error) {
            console.error('❌ Error al configurar suscripción:', error);
            setErrorCarga('Error al configurar las actualizaciones en tiempo real.');
            setCargando(false);
        }

        cargarActividadesIniciales();

        return () => {
            if (unsubscribe) {
                console.log('🧹 Limpiando suscripción');
                unsubscribe();
            }
        };
    }, [currentUser, authLoading]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    const handleGuardarActividad = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.uid) {
            setMensaje('❌ Debes estar logueado para guardar actividades.');
            return;
        }
        if (!nuevaActividadTexto.trim()) {
            setMensaje('❌ Ingresa el texto de la actividad.');
            return;
        }

        setMensaje('Guardando...');
        try {
            let horaInicioDate: Date | undefined;
            let horaFinDate: Date | undefined;

            if (horaInicio && horaFin) {
                const [horaInicioHH, horaInicioMM] = horaInicio.split(':');
                const [horaFinHH, horaFinMM] = horaFin.split(':');
                
                horaInicioDate = new Date();
                horaInicioDate.setHours(parseInt(horaInicioHH), parseInt(horaInicioMM), 0);
                
                horaFinDate = new Date();
                horaFinDate.setHours(parseInt(horaFinHH), parseInt(horaFinMM), 0);

                if (horaFinDate <= horaInicioDate) {
                    horaFinDate.setDate(horaFinDate.getDate() + 1);
                }
            }

            const nuevaActividad = await guardarActividad(
                nuevaActividadTexto,
                currentUser.uid,
                {
                    comentario,
                    prioridad,
                    horaInicio: horaInicioDate,
                    horaFin: horaFinDate
                }
            );
            
            setActividades(prev => [nuevaActividad, ...prev]);
            setMensaje('✅ Actividad guardada.');
            setNuevaActividadTexto('');
            setComentario('');
            setPrioridad(null);
            setHoraInicio('');
            setHoraFin('');
            setMostrarFormulario(false);
        } catch (error) {
            if (error instanceof Error) {
                setMensaje(`❌ ${error.message}`);
            } else {
                setMensaje('❌ Error al guardar la actividad.');
            }
        }
    };

    const handleToggleCompletada = async (id: string, isCompleted: boolean) => {
        try {
            await marcarComoCompletada(id, !isCompleted);
            setActividades(prev =>
                prev.map(act =>
                    act.id === id ? { ...act, isCompleted: !isCompleted } : act
                )
            );
            setMensaje(`✅ Actividad ${!isCompleted ? 'completada' : 'pendiente'}`);
        } catch (error) {
            setMensaje('❌ Error al actualizar la actividad.');
        }
    };

    const handleEliminarActividad = async (id: string) => {
        try {
            await eliminarActividad(id);
            setActividades(prev => prev.filter(act => act.id !== id));
            setMensaje('✅ Actividad eliminada.');
        } catch (error) {
            setMensaje('❌ Error al eliminar la actividad.');
        }
    };

    useEffect(() => {
        if (mensaje) {
            const timer = setTimeout(() => setMensaje(''), 4000);
            return () => clearTimeout(timer);
        }
    }, [mensaje]);

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            {/* Navbar */}
            <nav className={`${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } shadow-sm border-b transition-colors duration-200`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Mis Tareas
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`p-2 rounded-lg transition-colors duration-200 ${
                                    isDarkMode 
                                        ? 'text-yellow-400 hover:bg-gray-700' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                            {currentUser && (
                                <span className={`text-sm hidden sm:block ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                    {currentUser.email}
                                </span>
                            )}
                            <Button 
                                variant={isDarkMode ? "secondary-dark" : "secondary"}
                                onClick={handleLogout}
                                className="flex items-center"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Salir
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Contenido Principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Mensaje de estado */}
                {(mensaje || errorCarga) && (
                    <div className={`mb-4 p-4 rounded-lg text-sm font-medium ${
                        mensaje?.includes('❌') || errorCarga
                            ? isDarkMode 
                                ? 'bg-red-900/50 text-red-200 border-red-800'
                                : 'bg-red-50 text-red-800 border border-red-200'
                            : isDarkMode
                                ? 'bg-green-900/50 text-green-200 border-green-800'
                                : 'bg-green-50 text-green-800 border border-green-200'
                    }`}>
                        {errorCarga || mensaje}
                    </div>
                )}

                {/* Botón para mostrar/ocultar formulario */}
                <div className="mb-6">
                    <Button
                        variant={isDarkMode ? "primary-dark" : "primary"}
                        onClick={() => setMostrarFormulario(!mostrarFormulario)}
                        className="flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {mostrarFormulario ? 'Cancelar' : 'Nueva Actividad'}
                    </Button>
                </div>

                {/* Formulario de nueva actividad */}
                {mostrarFormulario && (
                    <form onSubmit={handleGuardarActividad} className={`${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } rounded-xl shadow-lg p-8 mb-8 transition-colors duration-200`}>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="texto" className="block text-lg font-semibold text-gray-800 mb-2">
                                    Actividad *
                                </label>
                                <input
                                    type="text"
                                    id="texto"
                                    value={nuevaActividadTexto}
                                    onChange={(e) => setNuevaActividadTexto(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base
                                             shadow-sm transition-colors duration-200
                                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                                    placeholder="¿Qué necesitas hacer?"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="comentario" className="block text-lg font-semibold text-gray-800 mb-2">
                                    Comentario
                                </label>
                                <textarea
                                    id="comentario"
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base
                                             shadow-sm transition-colors duration-200
                                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                                    rows={3}
                                    placeholder="Agrega detalles adicionales..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="prioridad" className="block text-lg font-semibold text-gray-800">
                                        Prioridad
                                    </label>
                                    <select
                                        id="prioridad"
                                        value={prioridad || ''}
                                        onChange={(e) => setPrioridad(e.target.value as PrioridadActividad)}
                                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base
                                                 shadow-sm transition-colors duration-200
                                                 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                                    >
                                        <option value="">Sin prioridad</option>
                                        <option value="alta">Alta</option>
                                        <option value="media">Media</option>
                                        <option value="baja">Baja</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="horaInicio" className="block text-lg font-semibold text-gray-800">
                                        Hora de inicio
                                    </label>
                                    <input
                                        type="time"
                                        id="horaInicio"
                                        value={horaInicio}
                                        onChange={(e) => setHoraInicio(e.target.value)}
                                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base
                                                 shadow-sm transition-colors duration-200
                                                 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="horaFin" className="block text-lg font-semibold text-gray-800">
                                        Hora de fin
                                    </label>
                                    <input
                                        type="time"
                                        id="horaFin"
                                        value={horaFin}
                                        onChange={(e) => setHoraFin(e.target.value)}
                                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-base
                                                 shadow-sm transition-colors duration-200
                                                 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setMostrarFormulario(false)}
                                    className="px-6 py-3 text-base"
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="primary"
                                    className="px-6 py-3 text-base"
                                >
                                    Guardar Actividad
                                </Button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Lista de actividades */}
                <div className="space-y-4">
                    {cargando ? (
                        <div className="text-center py-12">
                            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
                                isDarkMode ? 'border-indigo-400' : 'border-indigo-600'
                            } mx-auto`}></div>
                            <p className={`mt-4 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>Cargando actividades...</p>
                        </div>
                    ) : errorCarga ? (
                        <div className={`text-center py-12 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } rounded-lg shadow-sm transition-colors duration-200`}>
                            <AlertCircle className={`h-12 w-12 ${
                                isDarkMode ? 'text-red-400' : 'text-red-400'
                            } mx-auto mb-4`} />
                            <h3 className={`text-lg font-medium mb-2 ${
                                isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>Error al cargar actividades</h3>
                            <p className={`${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            } mb-4`}>{errorCarga}</p>
                            <div className="flex justify-center">
                                <Button
                                    variant={isDarkMode ? "primary-dark" : "primary"}
                                    onClick={() => window.location.reload()}
                                >
                                    Intentar de nuevo
                                </Button>
                            </div>
                        </div>
                    ) : actividades.length === 0 ? (
                        <div className={`text-center py-12 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } rounded-lg shadow-sm transition-colors duration-200`}>
                            <AlertCircle className={`h-12 w-12 ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            } mx-auto mb-4`} />
                            <h3 className={`text-lg font-medium mb-2 ${
                                isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>No hay actividades</h3>
                            <p className={`${
                                isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                                Comienza agregando una nueva actividad usando el botón de arriba.
                            </p>
                        </div>
                    ) : (
                        <div>
                            {actividades.map((actividad) => (
                                <ActividadCard
                                    key={actividad.id}
                                    actividad={actividad}
                                    onToggleCompletada={handleToggleCompletada}
                                    onEliminar={handleEliminarActividad}
                                    isDarkMode={isDarkMode}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
