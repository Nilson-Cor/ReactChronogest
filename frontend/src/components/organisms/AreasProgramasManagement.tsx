import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, ChevronDown, ChevronRight, FolderOpen, GraduationCap } from 'lucide-react';

interface Programa {
  id: string;
  nombre: string;
  codigo: string;
  duracion: string;
  nivel: string;
  descripcion: string;
  createdAt: string;
}

interface Area {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string;
  coordinador: string;
  email: string;
  telefono: string;
  programas: Programa[];
  createdAt: string;
}

interface AreaFormData {
  nombre: string;
  codigo: string;
  descripcion: string;
  coordinador: string;
  email: string;
  telefono: string;
}

interface ProgramaFormData {
  nombre: string;
  codigo: string;
  duracion: string;
  nivel: string;
  descripcion: string;
}

const AreasProgramasManagement: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [showProgramaForm, setShowProgramaForm] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [editingPrograma, setEditingPrograma] = useState<Programa | null>(null);

  const [areaForm, setAreaForm] = useState<AreaFormData>({
    nombre: '',
    codigo: '',
    descripcion: '',
    coordinador: '',
    email: '',
    telefono: ''
  });

  const [programaForm, setProgramaForm] = useState<ProgramaFormData>({
    nombre: '',
    codigo: '',
    duracion: '',
    nivel: '',
    descripcion: ''
  });

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = () => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('area:'));
      const areasData = keys.map(key => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }).filter(Boolean);
      setAreas(areasData);
    } catch (error) {
      console.log('No hay áreas guardadas aún');
      setAreas([]);
    }
  };

  const saveArea = (area: Area) => {
    localStorage.setItem(`area:${area.id}`, JSON.stringify(area));
  };

  const deleteArea = (id: string) => {
    localStorage.removeItem(`area:${id}`);
  };

  const toggleArea = (id: string) => {
    const newExpanded = new Set(expandedAreas);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedAreas(newExpanded);
  };

  const handleCreateArea = () => {
    if (!areaForm.nombre || !areaForm.codigo || !areaForm.descripcion || 
        !areaForm.coordinador || !areaForm.email || !areaForm.telefono) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    const newArea: Area = {
      id: Date.now().toString(),
      ...areaForm,
      programas: [],
      createdAt: new Date().toISOString()
    };

    saveArea(newArea);
    loadAreas();
    
    setShowAreaForm(false);
    setAreaForm({
      nombre: '',
      codigo: '',
      descripcion: '',
      coordinador: '',
      email: '',
      telefono: ''
    });
  };

  const handleUpdateArea = () => {
    if (!editingArea) return;

    if (!areaForm.nombre || !areaForm.codigo || !areaForm.descripcion || 
        !areaForm.coordinador || !areaForm.email || !areaForm.telefono) {
      alert('Por favor completa todos los campos');
      return;
    }

    const updatedArea: Area = {
      ...editingArea,
      ...areaForm
    };

    saveArea(updatedArea);
    loadAreas();
    
    setEditingArea(null);
    setAreaForm({
      nombre: '',
      codigo: '',
      descripcion: '',
      coordinador: '',
      email: '',
      telefono: ''
    });
  };

  const handleDeleteArea = (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta área? Se eliminarán también todos sus programas.')) {
      return;
    }

    deleteArea(id);
    loadAreas();
  };

  const handleCreatePrograma = () => {
    if (!selectedArea) return;

    if (!programaForm.nombre || !programaForm.codigo || !programaForm.duracion || 
        !programaForm.nivel || !programaForm.descripcion) {
      alert('Por favor completa todos los campos');
      return;
    }

    const area = areas.find(a => a.id === selectedArea);
    if (!area) return;

    const newPrograma: Programa = {
      id: Date.now().toString(),
      ...programaForm,
      createdAt: new Date().toISOString()
    };

    const updatedArea = {
      ...area,
      programas: [...area.programas, newPrograma]
    };

    saveArea(updatedArea);
    loadAreas();
    
    setShowProgramaForm(false);
    setSelectedArea(null);
    setProgramaForm({
      nombre: '',
      codigo: '',
      duracion: '',
      nivel: '',
      descripcion: ''
    });
  };

  const handleUpdatePrograma = () => {
    if (!editingPrograma || !selectedArea) return;

    if (!programaForm.nombre || !programaForm.codigo || !programaForm.duracion || 
        !programaForm.nivel || !programaForm.descripcion) {
      alert('Por favor completa todos los campos');
      return;
    }

    const area = areas.find(a => a.id === selectedArea);
    if (!area) return;

    const updatedProgramas = area.programas.map(p =>
      p.id === editingPrograma.id ? { ...p, ...programaForm } : p
    );

    const updatedArea = {
      ...area,
      programas: updatedProgramas
    };

    saveArea(updatedArea);
    loadAreas();
    
    setEditingPrograma(null);
    setSelectedArea(null);
    setProgramaForm({
      nombre: '',
      codigo: '',
      duracion: '',
      nivel: '',
      descripcion: ''
    });
  };

  const handleDeletePrograma = (areaId: string, programaId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este programa?')) {
      return;
    }

    const area = areas.find(a => a.id === areaId);
    if (!area) return;

    const updatedArea = {
      ...area,
      programas: area.programas.filter(p => p.id !== programaId)
    };

    saveArea(updatedArea);
    loadAreas();
  };

  const startEditArea = (area: Area) => {
    setEditingArea(area);
    setAreaForm({
      nombre: area.nombre,
      codigo: area.codigo,
      descripcion: area.descripcion,
      coordinador: area.coordinador,
      email: area.email,
      telefono: area.telefono
    });
  };

  const startEditPrograma = (areaId: string, programa: Programa) => {
    setSelectedArea(areaId);
    setEditingPrograma(programa);
    setProgramaForm({
      nombre: programa.nombre,
      codigo: programa.codigo,
      duracion: programa.duracion,
      nivel: programa.nivel,
      descripcion: programa.descripcion
    });
  };

  const totalProgramas = areas.reduce((sum, area) => sum + area.programas.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Áreas y Programas</h2>
                <p className="text-sm text-gray-600">Organiza las áreas de formación y sus programas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 text-right">
                <div><span className="font-bold text-gray-800">{areas.length}</span> áreas</div>
                <div><span className="font-bold text-gray-800">{totalProgramas}</span> programas</div>
              </div>
              <button
                onClick={() => setShowAreaForm(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nueva Área
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {areas.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">No hay áreas registradas</p>
                <p className="text-sm text-gray-500">Crea tu primera área de formación para comenzar</p>
              </div>
            ) : (
              areas.map(area => (
                <div key={area.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleArea(area.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expandedAreas.has(area.id) ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                        <FolderOpen className="w-6 h-6 text-blue-600" />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{area.nombre}</h3>
                          <p className="text-sm text-gray-600">
                            Código: {area.codigo} | {area.programas.length} programa(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedArea(area.id);
                            setShowProgramaForm(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium transition-colors"
                        >
                          + Programa
                        </button>
                        <button
                          onClick={() => startEditArea(area)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArea(area.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedAreas.has(area.id) && (
                    <div className="p-4 bg-white">
                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm bg-gray-50 p-3 rounded-lg">
                        <div>
                          <span className="text-gray-600">Coordinador:</span>
                          <p className="font-medium">{area.coordinador}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <p className="font-medium">{area.email}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Teléfono:</span>
                          <p className="font-medium">{area.telefono}</p>
                        </div>
                        <div className="col-span-3">
                          <span className="text-gray-600">Descripción:</span>
                          <p className="font-medium">{area.descripcion}</p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" />
                          Programas de Formación ({area.programas.length})
                        </h4>
                        {area.programas.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No hay programas registrados en esta área</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {area.programas.map(programa => (
                              <div
                                key={programa.id}
                                className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-bold text-gray-800">{programa.nombre}</h5>
                                    <p className="text-xs text-gray-600">Código: {programa.codigo}</p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => startEditPrograma(area.id, programa)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeletePrograma(area.id, programa.id)}
                                      className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-green-600 text-white px-2 py-0.5 rounded font-medium">
                                      {programa.nivel}
                                    </span>
                                    <span className="text-gray-600">⏱ {programa.duracion}</span>
                                  </div>
                                  <p className="text-gray-600 mt-2">{programa.descripcion}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {(showAreaForm || editingArea) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    {editingArea ? 'Editar Área' : 'Nueva Área'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Área *
                      </label>
                      <input
                        type="text"
                        value={areaForm.nombre}
                        onChange={(e) => setAreaForm({ ...areaForm, nombre: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Tecnologías de la Información y Comunicación (TIC)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Código *
                        </label>
                        <input
                          type="text"
                          value={areaForm.codigo}
                          onChange={(e) => setAreaForm({ ...areaForm, codigo: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="TIC-001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Coordinador *
                        </label>
                        <input
                          type="text"
                          value={areaForm.coordinador}
                          onChange={(e) => setAreaForm({ ...areaForm, coordinador: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Nombre del coordinador"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción *
                      </label>
                      <textarea
                        rows={3}
                        value={areaForm.descripcion}
                        onChange={(e) => setAreaForm({ ...areaForm, descripcion: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Descripción del área de formación..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={areaForm.email}
                          onChange={(e) => setAreaForm({ ...areaForm, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="coordinador@sena.edu.co"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          value={areaForm.telefono}
                          onChange={(e) => setAreaForm({ ...areaForm, telefono: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="+57 300 1234567"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowAreaForm(false);
                        setEditingArea(null);
                        setAreaForm({
                          nombre: '',
                          codigo: '',
                          descripcion: '',
                          coordinador: '',
                          email: '',
                          telefono: ''
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={editingArea ? handleUpdateArea : handleCreateArea}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      {editingArea ? 'Actualizar' : 'Crear Área'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(showProgramaForm || editingPrograma) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    {editingPrograma ? 'Editar Programa' : 'Nuevo Programa'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Programa *
                      </label>
                      <input
                        type="text"
                        value={programaForm.nombre}
                        onChange={(e) => setProgramaForm({ ...programaForm, nombre: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Análisis y Desarrollo de Software (ADSO)"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Código *
                        </label>
                        <input
                          type="text"
                          value={programaForm.codigo}
                          onChange={(e) => setProgramaForm({ ...programaForm, codigo: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="228106"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duración *
                        </label>
                        <input
                          type="text"
                          value={programaForm.duracion}
                          onChange={(e) => setProgramaForm({ ...programaForm, duracion: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="24 meses"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nivel *
                        </label>
                        <select
                          value={programaForm.nivel}
                          onChange={(e) => setProgramaForm({ ...programaForm, nivel: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Técnico">Técnico</option>
                          <option value="Tecnólogo">Tecnólogo</option>
                          <option value="Especialización">Especialización</option>
                          <option value="Operario">Operario</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción *
                      </label>
                      <textarea
                        rows={3}
                        value={programaForm.descripcion}
                        onChange={(e) => setProgramaForm({ ...programaForm, descripcion: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Descripción del programa de formación..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowProgramaForm(false);
                        setEditingPrograma(null);
                        setSelectedArea(null);
                        setProgramaForm({
                          nombre: '',
                          codigo: '',
                          duracion: '',
                          nivel: '',
                          descripcion: ''
                        });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={editingPrograma ? handleUpdatePrograma : handleCreatePrograma}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      {editingPrograma ? 'Actualizar' : 'Crear Programa'}
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

export default AreasProgramasManagement;