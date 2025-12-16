import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Plus, Edit2, Trash2, Users, Calendar, CheckCircle, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:5000'; // Ajusta según tu configuración

// --- INTERFACES (Sin cambios, pero cruciales) ---

interface Horario {
  id: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  competencia: string;
}

interface Asignacion {
  id: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  competencia: string;
  tipo: 'instructor' | 'ficha';
  instructor_id?: string;
  instructor_nombre?: string;
  ficha_id?: string;
  ficha_numero?: string;
  programa_nombre?: string;
  ambiente_id: string;
  ambiente_nombre: string;
}

interface Instructor {
  id: string;
  nombre: string;
  especialidad?: string;
}

interface Ficha {
  id: string;
  numero: string;
  programa_nombre: string;
}

interface Ambiente {
  id: string;
  nombre: string;
  capacidad: number;
}

interface HorarioFormData {
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  competencia: string;
}

interface AsignacionFormData {
  horarioId: string;
  tipo: 'instructor' | 'ficha';
  instructorId: string;
  fichaId: string;
  ambienteId: string;
}

// --- UTILIDADES ---

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const getToken = () => localStorage.getItem('token');

// --- COMPONENTE DE FORMULARIO DE HORARIO (Extraído para limpieza) ---

interface HorarioFormProps {
    horarioForm: HorarioFormData;
    setHorarioForm: React.Dispatch<React.SetStateAction<HorarioFormData>>;
    editingHorario: Horario | null;
    handleCreateHorario: () => Promise<void>;
    handleUpdateHorario: () => Promise<void>;
    onClose: () => void;
}

const HorarioForm: React.FC<HorarioFormProps> = ({
    horarioForm,
    setHorarioForm,
    editingHorario,
    handleCreateHorario,
    handleUpdateHorario,
    onClose
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">
                        {editingHorario ? 'Editar Horario' : 'Crear Nuevo Horario'}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Día de la Semana *
                            </label>
                            <select
                                value={horarioForm.diaSemana}
                                onChange={(e) => setHorarioForm({ ...horarioForm, diaSemana: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Seleccionar día</option>
                                {diasSemana.map((dia) => (
                                    <option key={dia} value={dia}>{dia}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio *</label>
                                <input
                                    type="time"
                                    value={horarioForm.horaInicio}
                                    onChange={(e) => setHorarioForm({ ...horarioForm, horaInicio: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin *</label>
                                <input
                                    type="time"
                                    value={horarioForm.horaFin}
                                    onChange={(e) => setHorarioForm({ ...horarioForm, horaFin: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Competencia (opcional)</label>
                            <input
                                type="text"
                                value={horarioForm.competencia}
                                onChange={(e) => setHorarioForm({ ...horarioForm, competencia: e.target.value })}
                                placeholder="Ej: Fundamentos de Programación"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={editingHorario ? handleUpdateHorario : handleCreateHorario}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            {editingHorario ? 'Actualizar' : 'Crear Horario'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE DE FORMULARIO DE ASIGNACIÓN (Extraído y CORREGIDO) ---

interface AsignacionFormProps {
    asignacionForm: AsignacionFormData;
    setAsignacionForm: React.Dispatch<React.SetStateAction<AsignacionFormData>>;
    horarios: Horario[];
    instructores: Instructor[];
    fichas: Ficha[];
    ambientes: Ambiente[];
    handleAsignarHorario: () => Promise<void>;
    onClose: () => void;
}

const AsignacionForm: React.FC<AsignacionFormProps> = ({
    asignacionForm,
    setAsignacionForm,
    horarios,
    instructores,
    fichas,
    ambientes,
    handleAsignarHorario,
    onClose
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Nueva Asignación</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Horario *</label>
                            <select
                                value={asignacionForm.horarioId}
                                onChange={(e) => setAsignacionForm({ ...asignacionForm, horarioId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Seleccionar horario</option>
                                {horarios.map((horario) => (
                                    <option key={horario.id} value={horario.id}>
                                        {horario.dia_semana} - {horario.hora_inicio} a {horario.hora_fin}
                                        {horario.competencia ? ` (${horario.competencia})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Asignación *</label>
                            <select
                                value={asignacionForm.tipo}
                                onChange={(e) =>
                                    setAsignacionForm({
                                        ...asignacionForm,
                                        tipo: e.target.value as 'instructor' | 'ficha',
                                        instructorId: '',
                                        fichaId: ''
                                    })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="instructor">Asignar a Instructor</option>
                                <option value="ficha">Asignar a Ficha</option>
                            </select>
                        </div>

                        {asignacionForm.tipo === 'instructor' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Seleccionar Instructor *
                                </label>
                                <select
                                    value={asignacionForm.instructorId}
                                    onChange={(e) =>
                                        setAsignacionForm({ ...asignacionForm, instructorId: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar instructor</option>
                                    {instructores.map((instructor) => (
                                        <option key={instructor.id} value={instructor.id}>
                                            {instructor.nombre}
                                            {instructor.especialidad && ` - ${instructor.especialidad}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            // ESTE ES EL BLOQUE CORREGIDO (anteriormente estaba duplicado y mal fuera del ternario)
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Seleccionar Ficha *
                                </label>
                                <select
                                    value={asignacionForm.fichaId}
                                    onChange={(e) =>
                                        setAsignacionForm({ ...asignacionForm, fichaId: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar ficha</option>
                                    {fichas.map((ficha) => (
                                        <option key={ficha.id} value={ficha.id}>
                                            {ficha.numero} - {ficha.programa_nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Ambiente *</label>
                            <select
                                value={asignacionForm.ambienteId}
                                onChange={(e) =>
                                    setAsignacionForm({ ...asignacionForm, ambienteId: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Seleccionar ambiente</option>
                                {ambientes.map((ambiente) => (
                                    <option key={ambiente.id} value={ambiente.id}>
                                        {ambiente.nombre} (Capacidad: {ambiente.capacidad})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAsignarHorario}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Asignar Horario
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL ---

const HorariosManagement: React.FC = () => {
    // --- ESTADOS (Mantenidos) ---
    const [horarios, setHorarios] = useState<Horario[]>([]);
    const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
    const [instructores, setInstructores] = useState<Instructor[]>([]);
    const [fichas, setFichas] = useState<Ficha[]>([]);
    const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
    
    const [showHorarioForm, setShowHorarioForm] = useState(false);
    const [showAsignacionForm, setShowAsignacionForm] = useState(false);
    const [editingHorario, setEditingHorario] = useState<Horario | null>(null);
    const [vistaActiva, setVistaActiva] = useState<'horarios' | 'asignaciones'>('horarios');
    const [loading, setLoading] = useState(false);

    const [horarioForm, setHorarioForm] = useState<HorarioFormData>({
        diaSemana: '',
        horaInicio: '',
        horaFin: '',
        competencia: ''
    });

    const [asignacionForm, setAsignacionForm] = useState<AsignacionFormData>({
        horarioId: '',
        tipo: 'instructor',
        instructorId: '',
        fichaId: '',
        ambienteId: ''
    });

    // --- CARGA DE DATOS (Usando useCallback para optimización y dependencias) ---
    const loadHorarios = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/horarios/base`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await response.json();
            if (data.success) {
                setHorarios(data.horarios || []);
            }
        } catch (error) {
            console.error('Error cargando horarios:', error);
        }
    }, []);

    const loadAsignaciones = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/horarios/asignaciones`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await response.json();
            if (data.success) {
                setAsignaciones(data.asignaciones || []);
            }
        } catch (error) {
            console.error('Error cargando asignaciones:', error);
        }
    }, []);

    const loadInstructores = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/instructores`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await response.json();
            if (data.success) {
                setInstructores(data.instructores || []);
            }
        } catch (error) {
            console.error('Error cargando instructores:', error);
        }
    }, []);

    const loadFichas = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/fichas`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await response.json();
            if (data.success) {
                setFichas(data.fichas || []);
            }
        } catch (error) {
            console.error('Error cargando fichas:', error);
        }
    }, []);

    const loadAmbientes = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/ambientes`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await response.json();
            if (data.success) {
                setAmbientes(data.ambientes || []);
            }
        } catch (error) {
            console.error('Error cargando ambientes:', error);
        }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        await Promise.all([
            loadHorarios(),
            loadAsignaciones(),
            loadInstructores(),
            loadFichas(),
            loadAmbientes()
        ]);
        setLoading(false);
    }, [loadHorarios, loadAsignaciones, loadInstructores, loadFichas, loadAmbientes]);

    useEffect(() => {
        loadData();
    }, [loadData]); // Dependencia loadData

    // --- MANEJADORES DE HORARIO ---

    const resetHorarioForm = () => {
        setShowHorarioForm(false);
        setEditingHorario(null);
        setHorarioForm({
            diaSemana: '',
            horaInicio: '',
            horaFin: '',
            competencia: ''
        });
    };

    const handleCreateOrUpdateHorario = async (method: 'POST' | 'PUT', url: string, successMessage: string) => {
        if (!horarioForm.diaSemana || !horarioForm.horaInicio || !horarioForm.horaFin) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(horarioForm)
            });

            const data = await response.json();
            
            if (data.success) {
                alert(successMessage);
                await loadHorarios();
                resetHorarioForm();
            } else {
                alert(data.message || `Error al ${method === 'POST' ? 'crear' : 'actualizar'} horario`);
            }
        } catch (error) {
            console.error(`Error ${method === 'POST' ? 'creando' : 'actualizando'} horario:`, error);
            alert('Error de conexión');
        }
    };

    const handleCreateHorario = () => handleCreateOrUpdateHorario('POST', `${API_URL}/api/horarios`, 'Horario creado exitosamente');
    const handleUpdateHorario = () => handleCreateOrUpdateHorario('PUT', `${API_URL}/api/horarios/${editingHorario!.id}`, 'Horario actualizado exitosamente');

    const handleDeleteHorario = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar este horario?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/horarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Horario eliminado exitosamente');
                await loadHorarios();
            } else {
                alert(data.message || 'Error al eliminar horario');
            }
        } catch (error) {
            console.error('Error eliminando horario:', error);
            alert('Error de conexión');
        }
    };

    const startEditHorario = (horario: Horario) => {
        setEditingHorario(horario);
        setHorarioForm({
            diaSemana: horario.dia_semana,
            horaInicio: horario.hora_inicio,
            horaFin: horario.hora_fin,
            competencia: horario.competencia
        });
    };

    // --- MANEJADORES DE ASIGNACIÓN ---

    const resetAsignacionForm = () => {
        setShowAsignacionForm(false);
        setAsignacionForm({
            horarioId: '',
            tipo: 'instructor',
            instructorId: '',
            fichaId: '',
            ambienteId: ''
        });
    };

    const handleAsignarHorario = async () => {
        if (!asignacionForm.horarioId || !asignacionForm.ambienteId) {
            alert('Por favor selecciona un Horario y un Ambiente.');
            return;
        }

        if (asignacionForm.tipo === 'instructor' && !asignacionForm.instructorId) {
            alert('Por favor selecciona un instructor.');
            return;
        }

        if (asignacionForm.tipo === 'ficha' && !asignacionForm.fichaId) {
            alert('Por favor selecciona una ficha.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/horarios/asignar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(asignacionForm)
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Horario asignado exitosamente');
                await loadAsignaciones();
                resetAsignacionForm();
            } else {
                alert(data.message || 'Error al asignar horario');
            }
        } catch (error) {
            console.error('Error asignando horario:', error);
            alert('Error de conexión');
        }
    };

    const handleDeleteAsignacion = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar esta asignación?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/horarios/asignacion/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Asignación eliminada exitosamente');
                await loadAsignaciones();
            } else {
                alert(data.message || 'Error al eliminar asignación');
            }
        } catch (error) {
            console.error('Error eliminando asignación:', error);
            alert('Error de conexión');
        }
    };

    // --- RENDERIZADO PRINCIPAL ---

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-green-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Gestión de Horarios</h2>
                        <p className="text-sm text-gray-600">Administra horarios y asignaciones</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={loadData}
                        className="px-3 py-2 text-gray-600 hover:text-green-600 transition-colors"
                        title="Actualizar"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <div className="text-sm text-gray-600 text-right">
                        <div><span className="font-bold text-gray-800">{horarios.length}</span> horarios</div>
                        <div><span className="font-bold text-gray-800">{asignaciones.length}</span> asignaciones</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setVistaActiva('horarios')}
                    className={`px-6 py-3 font-semibold transition-colors ${
                        vistaActiva === 'horarios'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    <Calendar className="w-5 h-5 inline mr-2" />
                    Horarios
                </button>
                <button
                    onClick={() => setVistaActiva('asignaciones')}
                    className={`px-6 py-3 font-semibold transition-colors ${
                        vistaActiva === 'asignaciones'
                            ? 'text-green-600 border-b-2 border-green-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    <Users className="w-5 h-5 inline mr-2" />
                    Asignaciones
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-spin" />
                    <p className="text-gray-600">Cargando...</p>
                </div>
            ) : (
                <>
                    {/* Contenido de la Vista Activa */}
                    {vistaActiva === 'horarios' && (
                        <>
                            <div className="mb-6">
                                <button
                                    onClick={() => setShowHorarioForm(true)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Crear Horario
                                </button>
                            </div>

                            {/* Lista de Horarios */}
                            <div className="space-y-3">
                                {horarios.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                        <p className="text-gray-600 mb-2">No hay horarios registrados</p>
                                        <p className="text-sm text-gray-500">Crea tu primer horario para comenzar</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-green-600 text-white">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold">DÍA</th>
                                                    <th className="px-4 py-3 text-left font-semibold">HORA INICIO</th>
                                                    <th className="px-4 py-3 text-left font-semibold">HORA FIN</th>
                                                    <th className="px-4 py-3 text-left font-semibold">COMPETENCIA</th>
                                                    <th className="px-4 py-3 text-center font-semibold">ACCIONES</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {horarios.map((horario, index) => (
                                                    <tr
                                                        key={horario.id}
                                                        className={`border-b border-gray-200 hover:bg-gray-50 ${
                                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                                        }`}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                                                {horario.dia_semana}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 font-medium">{horario.hora_inicio}</td>
                                                        <td className="px-4 py-3 font-medium">{horario.hora_fin}</td>
                                                        <td className="px-4 py-3 text-gray-700">{horario.competencia || 'Sin especificar'}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => startEditHorario(horario)}
                                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteHorario(horario.id)}
                                                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Vista de Asignaciones */}
                    {vistaActiva === 'asignaciones' && (
                        <>
                            <div className="mb-6">
                                <button
                                    onClick={() => setShowAsignacionForm(true)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Nueva Asignación
                                </button>
                            </div>

                            {/* Lista de Asignaciones */}
                            <div className="space-y-3">
                                {asignaciones.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                        <p className="text-gray-600 mb-2">No hay asignaciones registradas</p>
                                        <p className="text-sm text-gray-500">Asigna horarios a instructores o fichas</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {asignaciones.map((asignacion) => (
                                            <div
                                                key={asignacion.id}
                                                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-bold">
                                                                {asignacion.dia_semana}
                                                            </span>
                                                            <span className="text-gray-700 font-medium">
                                                                {asignacion.hora_inicio} - {asignacion.hora_fin}
                                                            </span>
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                                {asignacion.tipo === 'instructor' ? 'INSTRUCTOR' : 'FICHA'}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-gray-600 block mb-1">Asignado a:</span>
                                                                <p className="font-bold text-gray-800">
                                                                    {asignacion.tipo === 'instructor'
                                                                        ? asignacion.instructor_nombre
                                                                        : `${asignacion.ficha_numero} - ${asignacion.programa_nombre}`}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600 block mb-1">Ambiente:</span>
                                                                <p className="font-medium text-gray-800">{asignacion.ambiente_nombre}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-600 block mb-1">Competencia:</span>
                                                                <p className="font-medium text-gray-800">
                                                                    {asignacion.competencia || 'Sin especificar'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleDeleteAsignacion(asignacion.id)}
                                                        className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Modal: Formulario de Horario (Usando el nuevo componente) */}
            {(showHorarioForm || editingHorario) && (
                <HorarioForm 
                    horarioForm={horarioForm}
                    setHorarioForm={setHorarioForm}
                    editingHorario={editingHorario}
                    handleCreateHorario={handleCreateHorario}
                    handleUpdateHorario={handleUpdateHorario}
                    onClose={resetHorarioForm}
                />
            )}

            {/* Modal: Formulario de Asignación (Usando el nuevo componente CORREGIDO) */}
            {showAsignacionForm && (
                <AsignacionForm 
                    asignacionForm={asignacionForm}
                    setAsignacionForm={setAsignacionForm}
                    horarios={horarios}
                    instructores={instructores}
                    fichas={fichas}
                    ambientes={ambientes}
                    handleAsignarHorario={handleAsignarHorario}
                    onClose={resetAsignacionForm}
                />
            )}
        </div>
    );
};

export default HorariosManagement;