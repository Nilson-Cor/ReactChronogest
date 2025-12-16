import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, ChevronDown, ChevronRight, Users, Calendar, Clock, BookOpen, Filter, Search } from 'lucide-react';

interface Ficha {
  id: string;
  codigo: string;
  programaId: string;
  programaNombre: string;
  areaId: string;
  areaNombre: string;
  centroId: string;
  centroNombre: string;
  fase: 'Lectiva' | 'Productiva';
  jornada: 'Diurna' | 'Nocturna' | 'Mixta' | 'Fin de Semana';
  fechaInicio: string;
  fechaFin: string;
  cantidadAprendices: number;
  estado: 'Activa' | 'En Formación' | 'Finalizada';
  instructoresAsignados: string[];
  createdAt: string;
}

interface FichaFormData {
  codigo: string;
  centroId: string;
  areaId: string;
  programaId: string;
  fase: string;
  jornada: string;
  fechaInicio: string;
  fechaFin: string;
  cantidadAprendices: string;
  estado: string;
}

const FichasManagement: React.FC = () => {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [centros, setCentros] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [programas, setProgramas] = useState<any[]>([]);
  const [filteredProgramas, setFilteredProgramas] = useState<any[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<any[]>([]);
  
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingFicha, setEditingFicha] = useState<Ficha | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCentro, setFilterCentro] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterPrograma, setFilterPrograma] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterJornada, setFilterJornada] = useState('');

  const [fichaForm, setFichaForm] = useState<FichaFormData>({
    codigo: '',
    centroId: '',
    areaId: '',
    programaId: '',
    fase: 'Lectiva',
    jornada: 'Diurna',
    fechaInicio: '',
    fechaFin: '',
    cantidadAprendices: '',
    estado: 'Activa'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (fichaForm.centroId) {
      const areasDelCentro = areas.filter(a => a.centroId === fichaForm.centroId);
      setFilteredAreas(areasDelCentro);
      setFichaForm(prev => ({ ...prev, areaId: '', programaId: '' }));
      setFilteredProgramas([]);
    }
  }, [fichaForm.centroId]);

  useEffect(() => {
    if (fichaForm.areaId) {
      const programasDelArea = programas.filter(p => p.areaId === fichaForm.areaId);
      setFilteredProgramas(programasDelArea);
      setFichaForm(prev => ({ ...prev, programaId: '' }));
    }
  }, [fichaForm.areaId]);

  const loadData = () => {
    try {
      // Cargar fichas
      const fichasKeys = Object.keys(localStorage).filter(key => key.startsWith('ficha:'));
      const fichasData = fichasKeys.map(key => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }).filter((f): f is Ficha => f !== null);
      setFichas(fichasData);

      // Cargar centros
      const centrosKeys = Object.keys(localStorage).filter(key => key.startsWith('centro:'));
      const centrosData = centrosKeys.map(key => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }).filter(c => c !== null);
      setCentros(centrosData);

      // Cargar áreas
      const areasKeys = Object.keys(localStorage).filter(key => key.startsWith('area:'));
      const areasData = areasKeys.map(key => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }).filter(a => a !== null);
      setAreas(areasData);

      // Cargar programas
      const programasKeys = Object.keys(localStorage).filter(key => key.startsWith('programa:'));
      const programasData = programasKeys.map(key => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }).filter(p => p !== null);
      setProgramas(programasData);
    } catch (error) {
      console.error('Error cargando datos', error);
    }
  };

  const saveFicha = (ficha: Ficha) => {
    localStorage.setItem(`ficha:${ficha.id}`, JSON.stringify(ficha));
  };

  const handleCreateFicha = () => {
    if (!fichaForm.codigo || !fichaForm.programaId || !fichaForm.fechaInicio || 
        !fichaForm.fechaFin || !fichaForm.cantidadAprendices) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const programa = programas.find(p => p.id === fichaForm.programaId);
    const area = areas.find(a => a.id === fichaForm.areaId);
    const centro = centros.find(c => c.id === fichaForm.centroId);

    if (!programa || !area || !centro) {
      alert('Error: No se encontró el programa, área o centro seleccionado');
      return;
    }

    const newFicha: Ficha = {
      id: Date.now().toString(),
      codigo: fichaForm.codigo,
      programaId: fichaForm.programaId,
      programaNombre: programa.nombre,
      areaId: fichaForm.areaId,
      areaNombre: area.nombre,
      centroId: fichaForm.centroId,
      centroNombre: centro.nombre,
      fase: fichaForm.fase as any,
      jornada: fichaForm.jornada as any,
      fechaInicio: fichaForm.fechaInicio,
      fechaFin: fichaForm.fechaFin,
      cantidadAprendices: parseInt(fichaForm.cantidadAprendices),
      estado: fichaForm.estado as any,
      instructoresAsignados: [],
      createdAt: new Date().toISOString()
    };

    saveFicha(newFicha);
    loadData();
    setShowForm(false);
    resetForm();
  };

  const handleUpdateFicha = () => {
    if (!editingFicha) return;

    if (!fichaForm.codigo || !fichaForm.programaId || !fichaForm.fechaInicio || 
        !fichaForm.fechaFin || !fichaForm.cantidadAprendices) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const programa = programas.find(p => p.id === fichaForm.programaId);
    const area = areas.find(a => a.id === fichaForm.areaId);
    const centro = centros.find(c => c.id === fichaForm.centroId);

    if (!programa || !area || !centro) {
      alert('Error: No se encontró el programa, área o centro seleccionado');
      return;
    }

    const updatedFicha: Ficha = {
      ...editingFicha,
      codigo: fichaForm.codigo,
      programaId: fichaForm.programaId,
      programaNombre: programa.nombre,
      areaId: fichaForm.areaId,
      areaNombre: area.nombre,
      centroId: fichaForm.centroId,
      centroNombre: centro.nombre,
      fase: fichaForm.fase as any,
      jornada: fichaForm.jornada as any,
      fechaInicio: fichaForm.fechaInicio,
      fechaFin: fichaForm.fechaFin,
      cantidadAprendices: parseInt(fichaForm.cantidadAprendices),
      estado: fichaForm.estado as any
    };

    saveFicha(updatedFicha);
    loadData();
    setEditingFicha(null);
    resetForm();
  };

  const handleDeleteFicha = (fichaId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta ficha?')) return;
    localStorage.removeItem(`ficha:${fichaId}`);
    loadData();
  };

  const startEditFicha = (ficha: Ficha) => {
    setEditingFicha(ficha);
    
    // Establecer centro primero
    setFichaForm({
      codigo: ficha.codigo,
      centroId: ficha.centroId,
      areaId: ficha.areaId,
      programaId: ficha.programaId,
      fase: ficha.fase,
      jornada: ficha.jornada,
      fechaInicio: ficha.fechaInicio,
      fechaFin: ficha.fechaFin,
      cantidadAprendices: ficha.cantidadAprendices.toString(),
      estado: ficha.estado
    });

    // Cargar las áreas del centro
    const areasDelCentro = areas.filter(a => a.centroId === ficha.centroId);
    setFilteredAreas(areasDelCentro);

    // Cargar los programas del área
    const programasDelArea = programas.filter(p => p.areaId === ficha.areaId);
    setFilteredProgramas(programasDelArea);
  };

  const resetForm = () => {
    setFichaForm({
      codigo: '',
      centroId: '',
      areaId: '',
      programaId: '',
      fase: 'Lectiva',
      jornada: 'Diurna',
      fechaInicio: '',
      fechaFin: '',
      cantidadAprendices: '',
      estado: 'Activa'
    });
    setFilteredAreas([]);
    setFilteredProgramas([]);
  };

  const toggleProgram = (programId: string) => {
    const newExpanded = new Set(expandedPrograms);
    if (newExpanded.has(programId)) {
      newExpanded.delete(programId);
    } else {
      newExpanded.add(programId);
    }
    setExpandedPrograms(newExpanded);
  };

  // Filtrar fichas
  const filteredFichas = fichas.filter(ficha => {
    const matchSearch = ficha.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ficha.programaNombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCentro = !filterCentro || ficha.centroId === filterCentro;
    const matchArea = !filterArea || ficha.areaId === filterArea;
    const matchPrograma = !filterPrograma || ficha.programaId === filterPrograma;
    const matchEstado = !filterEstado || ficha.estado === filterEstado;
    const matchJornada = !filterJornada || ficha.jornada === filterJornada;

    return matchSearch && matchCentro && matchArea && matchPrograma && matchEstado && matchJornada;
  });

  const filteredFichasByProgram = filteredFichas.reduce((acc, ficha) => {
    if (!acc[ficha.programaId]) {
      acc[ficha.programaId] = [];
    }
    acc[ficha.programaId].push(ficha);
    return acc;
  }, {} as Record<string, Ficha[]>);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activa':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'En Formación':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Finalizada':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getJornadaColor = (jornada: string) => {
    switch (jornada) {
      case 'Diurna':
        return 'bg-yellow-100 text-yellow-800';
      case 'Nocturna':
        return 'bg-indigo-100 text-indigo-800';
      case 'Mixta':
        return 'bg-purple-100 text-purple-800';
      case 'Fin de Semana':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Fichas</h2>
                <p className="text-sm text-gray-600">Administra las fichas de formación por programa</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 text-right">
                <div><span className="font-bold text-gray-800">{fichas.length}</span> fichas registradas</div>
                <div><span className="font-bold text-green-600">{fichas.filter(f => f.estado === 'Activa').length}</span> activas</div>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
              >
                🔄 Recargar
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nueva Ficha
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-800">Filtros</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select
                value={filterCentro}
                onChange={(e) => setFilterCentro(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos los centros</option>
                {centros.map(centro => (
                  <option key={centro.id} value={centro.id}>{centro.nombre}</option>
                ))}
              </select>
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todas las áreas</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>{area.nombre}</option>
                ))}
              </select>
              <select
                value={filterPrograma}
                onChange={(e) => setFilterPrograma(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos los programas</option>
                {programas.map(programa => (
                  <option key={programa.id} value={programa.id}>{programa.nombre}</option>
                ))}
              </select>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todos los estados</option>
                <option value="Activa">Activa</option>
                <option value="En Formación">En Formación</option>
                <option value="Finalizada">Finalizada</option>
              </select>
              <select
                value={filterJornada}
                onChange={(e) => setFilterJornada(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Todas las jornadas</option>
                <option value="Diurna">Diurna</option>
                <option value="Nocturna">Nocturna</option>
                <option value="Mixta">Mixta</option>
                <option value="Fin de Semana">Fin de Semana</option>
              </select>
            </div>
          </div>

          {/* Lista de fichas agrupadas por programa */}
          <div className="space-y-4">
            {programas.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">No hay programas registrados</p>
                <p className="text-sm text-gray-500">Crea programas primero para poder agregar fichas</p>
              </div>
            ) : Object.keys(filteredFichasByProgram).length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">No hay fichas que coincidan con los filtros</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCentro('');
                    setFilterArea('');
                    setFilterPrograma('');
                    setFilterEstado('');
                    setFilterJornada('');
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            ) : (
              Object.entries(filteredFichasByProgram).map(([programaId, fichasDelPrograma]) => {
                const programa = programas.find(p => p.id === programaId);
                if (!programa) return null;

                return (
                  <div key={programaId} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => toggleProgram(programaId)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {expandedPrograms.has(programaId) ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                          <BookOpen className="w-6 h-6 text-purple-600" />
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{programa.nombre}</h3>
                            <p className="text-sm text-gray-600">
                              {fichasDelPrograma.length} ficha(s) | {programa.tipo} | {programa.nivel}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-gray-600">
                            <span className="font-bold text-purple-600">
                              {fichasDelPrograma.reduce((sum, f) => sum + f.cantidadAprendices, 0)}
                            </span> aprendices
                          </div>
                        </div>
                      </div>
                    </div>

                    {expandedPrograms.has(programaId) && (
                      <div className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {fichasDelPrograma.map(ficha => (
                            <div
                              key={ficha.id}
                              className="bg-gradient-to-br from-white to-purple-50 p-4 rounded-lg border-2 border-purple-200 hover:shadow-lg transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <GraduationCap className="w-5 h-5 text-purple-600" />
                                    <h4 className="font-bold text-gray-800">Ficha {ficha.codigo}</h4>
                                  </div>
                                  <p className="text-xs text-gray-600">{ficha.centroNombre}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => startEditFicha(ficha)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFicha(ficha.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`px-2 py-1 rounded-full border font-medium ${getEstadoColor(ficha.estado)}`}>
                                    {ficha.estado}
                                  </span>
                                  <span className={`px-2 py-1 rounded font-medium ${getJornadaColor(ficha.jornada)}`}>
                                    {ficha.jornada}
                                  </span>
                                </div>

                                <div className="bg-orange-50 px-2 py-1 rounded border border-orange-200">
                                  <span className="text-orange-800 font-medium">Fase: {ficha.fase}</span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-700">
                                  <Users className="w-3.5 h-3.5" />
                                  <span><strong>{ficha.cantidadAprendices}</strong> aprendices</span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-700">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span className="text-[10px]">
                                    {new Date(ficha.fechaInicio).toLocaleDateString()} - {new Date(ficha.fechaFin).toLocaleDateString()}
                                  </span>
                                </div>

                                {ficha.instructoresAsignados.length > 0 && (
                                  <div className="bg-blue-50 p-2 rounded border border-blue-200">
                                    <span className="text-blue-800 font-medium">
                                      {ficha.instructoresAsignados.length} instructor(es)
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Formulario Modal */}
          {(showForm || editingFicha) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    {editingFicha ? 'Editar Ficha' : 'Nueva Ficha'}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Código de Ficha *
                        </label>
                        <input
                          type="text"
                          value={fichaForm.codigo}
                          onChange={(e) => setFichaForm({ ...fichaForm, codigo: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="2558346"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado *
                        </label>
                        <select
                          value={fichaForm.estado}
                          onChange={(e) => setFichaForm({ ...fichaForm, estado: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Activa">Activa</option>
                          <option value="En Formación">En Formación</option>
                          <option value="Finalizada">Finalizada</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Centro *
                        </label>
                        <select
                          value={fichaForm.centroId}
                          onChange={(e) => setFichaForm({ ...fichaForm, centroId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Seleccionar</option>
                          {filteredAreas.map(area => (
                            <option key={area.id} value={area.id}>{area.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Programa *
                        </label>
                        <select
                          value={fichaForm.programaId}
                          onChange={(e) => setFichaForm({ ...fichaForm, programaId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          disabled={!fichaForm.areaId}
                        >
                          <option value="">Seleccionar</option>
                          {filteredProgramas.map(programa => (
                            <option key={programa.id} value={programa.id}>{programa.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fase *
                        </label>
                        <select
                          value={fichaForm.fase}
                          onChange={(e) => setFichaForm({ ...fichaForm, fase: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Lectiva">Lectiva</option>
                          <option value="Productiva">Productiva</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jornada *
                        </label>
                        <select
                          value={fichaForm.jornada}
                          onChange={(e) => setFichaForm({ ...fichaForm, jornada: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Diurna">Diurna</option>
                          <option value="Nocturna">Nocturna</option>
                          <option value="Mixta">Mixta</option>
                          <option value="Fin de Semana">Fin de Semana</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad de Aprendices *
                        </label>
                        <input
                          type="number"
                          value={fichaForm.cantidadAprendices}
                          onChange={(e) => setFichaForm({ ...fichaForm, cantidadAprendices: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="30"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Inicio *
                        </label>
                        <input
                          type="date"
                          value={fichaForm.fechaInicio}
                          onChange={(e) => setFichaForm({ ...fichaForm, fechaInicio: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Finalización *
                        </label>
                        <input
                          type="date"
                          value={fichaForm.fechaFin}
                          onChange={(e) => setFichaForm({ ...fichaForm, fechaFin: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingFicha(null);
                        resetForm();
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={editingFicha ? handleUpdateFicha : handleCreateFicha}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      {editingFicha ? 'Actualizar Ficha' : 'Crear Ficha'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FichasManagement;
                          