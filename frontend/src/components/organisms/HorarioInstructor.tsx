import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, BookOpen, RefreshCw, GraduationCap } from 'lucide-react';

const API_URL = 'http://localhost:5000'; // Ajusta según tu configuración

    interface HorarioInstructor {
    id: string;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    competencia: string;
    ficha_id?: string;
    ficha_numero?: string;
    programa_nombre?: string;
    ambiente_id: string;
    ambiente_nombre: string;
    }

    interface Props {
    instructorId: string;
    instructorNombre: string;
    }

    const HorarioInstructor: React.FC<Props> = ({ instructorId, instructorNombre }) => {
    const [horariosAsignados, setHorariosAsignados] = useState<HorarioInstructor[]>([]);
    const [loading, setLoading] = useState(false);

    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    useEffect(() => {
        loadHorariosInstructor();
    }, [instructorId]);

    const getToken = () => localStorage.getItem('token');

    const loadHorariosInstructor = async () => {
        setLoading(true);
        try {
        const response = await fetch(`${API_URL}/api/horarios/instructor/${instructorId}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            setHorariosAsignados(data.horarios || []);
        } else {
            console.error('Error cargando horarios:', data.message);
        }
        } catch (error) {
        console.error('Error cargando horarios del instructor:', error);
        setHorariosAsignados([]);
        } finally {
        setLoading(false);
        }
    };

    const agruparPorDia = () => {
        const agrupado: { [key: string]: HorarioInstructor[] } = {};
        
        diasSemana.forEach(dia => {
        agrupado[dia] = horariosAsignados.filter(
            item => item.dia_semana === dia
        );
        });

        return agrupado;
    };

    const horariosPorDia = agruparPorDia();
    
    const totalHoras = horariosAsignados.reduce((sum, item) => {
        const inicio = new Date(`2000-01-01T${item.hora_inicio}`);
        const fin = new Date(`2000-01-01T${item.hora_fin}`);
        return sum + (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    }, 0);

    const fichasUnicas = new Set(
        horariosAsignados
        .filter(item => item.ficha_numero)
        .map(item => `${item.ficha_numero} - ${item.programa_nombre}`)
    );

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-600" />
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Mis Horarios</h2>
                <p className="text-sm text-gray-600">Horarios asignados a {instructorNombre}</p>
            </div>
            </div>
            <button
            onClick={loadHorariosInstructor}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
            <RefreshCw className="w-5 h-5" />
            Actualizar
            </button>
        </div>

        {/* Información General */}
        <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{horariosAsignados.length}</div>
                <div className="text-sm text-gray-600 mt-1">Clases por Semana</div>
            </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalHoras.toFixed(1)}</div>
                <div className="text-sm text-gray-600 mt-1">Horas por Semana</div>
            </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
            <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{fichasUnicas.size}</div>
                <div className="text-sm text-gray-600 mt-1">Fichas Asignadas</div>
            </div>
            </div>
        </div>

        {loading ? (
            <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-gray-600">Cargando horarios...</p>
            </div>
        ) : horariosAsignados.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">No tienes horarios asignados</p>
            <p className="text-sm text-gray-500">Contacta al administrador para asignarte horarios</p>
            </div>
        ) : (
            <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tu Horario Semanal</h3>
            <div className="grid grid-cols-3 gap-4">
                {diasSemana.map(dia => (
                <div key={dia} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-green-600 text-white px-4 py-3 text-center font-bold">
                    {dia}
                    </div>
                    <div className="p-4">
                    {horariosPorDia[dia].length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                        Sin clases
                        </div>
                    ) : (
                        <div className="space-y-3">
                        {horariosPorDia[dia].map((item) => (
                            <div
                            key={item.id}
                            className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border-l-4 border-green-600"
                            >
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-green-600" />
                                <span className="font-bold text-gray-800">
                                {item.hora_inicio} - {item.hora_fin}
                                </span>
                            </div>
                            
                            <div className="space-y-1 text-sm">
                                {item.ficha_numero && (
                                <div className="flex items-start gap-2">
                                    <GraduationCap className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700 font-medium">
                                    Ficha {item.ficha_numero}
                                    </span>
                                </div>
                                )}
                                
                                <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{item.ambiente_nombre}</span>
                                </div>
                                
                                {item.competencia && (
                                <div className="flex items-start gap-2">
                                    <BookOpen className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{item.competencia}</span>
                                </div>
                                )}
                            </div>
                            </div>
                        ))}
                        </div>
                    )}
                    </div>
                </div>
                ))}
            </div>

            {/* Lista de Fichas Asignadas */}
            {fichasUnicas.size > 0 && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Tus Fichas Asignadas
                </h4>
                <div className="space-y-2">
                    {Array.from(fichasUnicas).map((ficha, index) => (
                    <div key={index} className="bg-white px-4 py-2 rounded-lg text-gray-800 font-medium">
                        {ficha}
                    </div>
                    ))}
                </div>
                </div>
            )}
            </div>
        )}
        </div>
    );
    };

export default HorarioInstructor;