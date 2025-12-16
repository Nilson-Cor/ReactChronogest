import React, { useState, useEffect } from 'react';
import { Home, Plus, Edit2, Trash2, ChevronDown, ChevronRight, Building2, Users, Monitor, MapPin } from 'lucide-react';

interface Ambiente {
  id: string;
  nombre: string;
  codigo: string;
  capacidad: number;
  tipo: string;
  equipamiento: string;
  estado: string;
  ubicacion: string;
  areaId: string;
  areaNombre: string;
  createdAt: string;
}

interface Centro {
  id: string;
  nombre: string;
  codigo: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  ambientes: Ambiente[];
  createdAt: string;
}

interface AmbienteFormData {
  nombre: string;
  codigo: string;
  capacidad: string;
  tipo: string;
  equipamiento: string;
  estado: string;
  ubicacion: string;
  areaId: string;
}

const AmbientesManagement: React.FC = () => {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [expandedCentros, setExpandedCentros] = useState<Set<string>>(new Set());
  const [showAmbienteForm, setShowAmbienteForm] = useState(false);
  const [selectedCentro, setSelectedCentro] = useState<string | null>(null);
  const [editingAmbiente, setEditingAmbiente] = useState<Ambiente | null>(null);

  const [ambienteForm, setAmbienteForm] = useState<AmbienteFormData>({
    nombre: '',
    codigo: '',
    capacidad: '',
    tipo: '',
    equipamiento: '',
    estado: 'Disponible',
    ubicacion: '',
    areaId: ''
  });

  useEffect(() => {
    loadCentros();
    loadAreas();
  }, []);

  const loadCentros = () => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('centro:'));
      const centrosData = keys.map(key => {
        const data = localStorage.getItem(key);
        if (data) {
          const centro = JSON.parse(data);
          if (!centro.ambientes) {
            centro.ambientes = [];
          }
          return centro;
        }
        return null;
      }).filter((centro): centro is Centro => centro !== null);
      setCentros(centrosData);
    } catch (error) {
      console.log('Error cargando centros', error);
      setCentros([]);
    }
  };

  const loadAreas = () => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('area:'));
      const areasData = keys.map(key => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }).filter((area): area is any => area !== null);
      setAreas(areasData);
    } catch (error) {
      console.log('Error cargando áreas');
      setAreas([]);
    }
  };

  const saveCentro = (centro: Centro) => {
    localStorage.setItem(`centro:${centro.id}`, JSON.stringify(centro));
  };

  const toggleCentro = (id: string) => {
    const newExpanded = new Set(expandedCentros);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCentros(newExpanded);
  };

  const handleCreateAmbiente = () => {
    if (!selectedCentro) return;

    if (!ambienteForm.nombre || !ambienteForm.codigo || !ambienteForm.capacidad || 
        !ambienteForm.tipo || !ambienteForm.ubicacion || !ambienteForm.areaId) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const centro = centros.find(c => c.id === selectedCentro);
    if (!centro) return;

    const selectedArea = areas.find(a => a.id === ambienteForm.areaId);
    const areaNombre = selectedArea ? selectedArea.nombre : '';

    const newAmbiente: Ambiente = {
      id: Date.now().toString(),
      nombre: ambienteForm.nombre,
      codigo: ambienteForm.codigo,
      capacidad: parseInt(ambienteForm.capacidad),
      tipo: ambienteForm.tipo,
      equipamiento: ambienteForm.equipamiento,
      estado: ambienteForm.estado,
      ubicacion: ambienteForm.ubicacion,
      areaId: ambienteForm.areaId,
      areaNombre: areaNombre,
      createdAt: new Date().toISOString()
    };

    const updatedCentro = {
      ...centro,
      ambientes: [...(centro.ambientes || []), newAmbiente]
    };

    saveCentro(updatedCentro);
    loadCentros();
    
    setShowAmbienteForm(false);
    setSelectedCentro(null);
    resetForm();
  };

  const handleUpdateAmbiente = () => {
    if (!editingAmbiente || !selectedCentro) return;

    if (!ambienteForm.nombre || !ambienteForm.codigo || !ambienteForm.capacidad || 
        !ambienteForm.tipo || !ambienteForm.ubicacion || !ambienteForm.areaId) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const centro = centros.find(c => c.id === selectedCentro);
    if (!centro) return;

    const selectedArea = areas.find(a => a.id === ambienteForm.areaId);
    const areaNombre = selectedArea ? selectedArea.nombre : '';

    const updatedAmbientes = centro.ambientes.map(amb =>
      amb.id === editingAmbiente.id ? {
        ...amb,
        nombre: ambienteForm.nombre,
        codigo: ambienteForm.codigo,
        capacidad: parseInt(ambienteForm.capacidad),
        tipo: ambienteForm.tipo,
        equipamiento: ambienteForm.equipamiento,
        estado: ambienteForm.estado,
        ubicacion: ambienteForm.ubicacion,
        areaId: ambienteForm.areaId,
        areaNombre: areaNombre
      } : amb
    );

    const updatedCentro = {
      ...centro,
      ambientes: updatedAmbientes
    };

    saveCentro(updatedCentro);
    loadCentros();
    
    setEditingAmbiente(null);
    setSelectedCentro(null);
    resetForm();
  };

  const handleDeleteAmbiente = (centroId: string, ambienteId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este ambiente?')) {
      return;
    }

    const centro = centros.find(c => c.id === centroId);
    if (!centro) return;

    const updatedCentro = {
      ...centro,
      ambientes: centro.ambientes.filter(amb => amb.id !== ambienteId)
    };

    saveCentro(updatedCentro);
    loadCentros();
  };

  const startEditAmbiente = (centroId: string, ambiente: Ambiente) => {
    setSelectedCentro(centroId);
    setEditingAmbiente(ambiente);
    setAmbienteForm({
      nombre: ambiente.nombre,
      codigo: ambiente.codigo,
      capacidad: ambiente.capacidad.toString(),
      tipo: ambiente.tipo,
      equipamiento: ambiente.equipamiento,
      estado: ambiente.estado,
      ubicacion: ambiente.ubicacion,
      areaId: ambiente.areaId
    });
  };

  const resetForm = () => {
    setAmbienteForm({
      nombre: '',
      codigo: '',
      capacidad: '',
      tipo: '',
      equipamiento: '',
      estado: 'Disponible',
      ubicacion: '',
      areaId: ''
    });
  };

  const totalAmbientes = centros.reduce((sum, centro) => sum + (centro.ambientes?.length || 0), 0);
  const ambientesDisponibles = centros.reduce((sum, centro) => 
    sum + (centro.ambientes?.filter(a => a.estado === 'Disponible').length || 0), 0
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Disponible':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Ocupado':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Mantenimiento':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Home className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Ambientes</h2>
                <p className="text-sm text-gray-600">Administra los ambientes de formación por centro</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 text-right">
                <div><span className="font-bold text-gray-800">{totalAmbientes}</span> ambientes</div>
                <div><span className="font-bold text-green-600">{ambientesDisponibles}</span> disponibles</div>
              </div>
              <button
                onClick={() => {
                  loadCentros();
                  loadAreas();
                }}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
              >
                🔄 Recargar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {centros.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">No hay centros registrados</p>
                <p className="text-sm text-gray-500 mb-4">Crea centros primero para poder agregar ambientes</p>
                <button
                  onClick={() => {
                    loadCentros();
                    loadAreas();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  🔄 Recargar Datos
                </button>
              </div>
            ) : (
              centros.map(centro => (
                <div key={centro.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleCentro(centro.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {expandedCentros.has(centro.id) ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                        <Building2 className="w-6 h-6 text-blue-600" />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{centro.nombre}</h3>
                          <p className="text-sm text-gray-600">
                            {centro.ciudad} | {centro.ambientes?.length || 0} ambiente(s)
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCentro(centro.id);
                          setShowAmbienteForm(true);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Nuevo Ambiente
                      </button>
                    </div>
                  </div>

                  {expandedCentros.has(centro.id) && (
                    <div className="p-4 bg-white">
                      {!centro.ambientes || centro.ambientes.length === 0 ? (
                        <p className="text-sm text-gray-500 italic text-center py-4">
                          No hay ambientes registrados en este centro
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {centro.ambientes.map(ambiente => (
                            <div
                              key={ambiente.id}
                              className="bg-gradient-to-br from-white to-blue-50 p-4 rounded-lg border-2 border-blue-200 hover:shadow-lg transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Home className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-bold text-gray-800">{ambiente.nombre}</h4>
                                  </div>
                                  <p className="text-xs text-gray-600 font-mono">{ambiente.codigo}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => startEditAmbiente(centro.id, ambiente)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAmbiente(centro.id, ambiente.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className={`px-2 py-1 rounded-full border font-medium ${getEstadoColor(ambiente.estado)}`}>
                                    {ambiente.estado}
                                  </span>
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                                    {ambiente.tipo}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-700">
                                  <Users className="w-3.5 h-3.5" />
                                  <span>Capacidad: <strong>{ambiente.capacidad}</strong> personas</span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-700">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>{ambiente.ubicacion}</span>
                                </div>

                                {ambiente.areaNombre && (
                                  <div className="bg-blue-50 p-2 rounded border border-blue-200">
                                    <span className="text-blue-800 font-medium">Área: {ambiente.areaNombre}</span>
                                  </div>
                                )}

                                {ambiente.equipamiento && (
                                  <div className="flex items-start gap-2 text-gray-600 mt-2">
                                    <Monitor className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-2">{ambiente.equipamiento}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {(showAmbienteForm || editingAmbiente) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    {editingAmbiente ? 'Editar Ambiente' : 'Nuevo Ambiente'}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre del Ambiente *
                        </label>
                        <input
                          type="text"
                          value={ambienteForm.nombre}
                          onChange={(e) => setAmbienteForm({ ...ambienteForm, nombre: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Laboratorio de Software"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Código *
                        </label>
                        <input
                          type="text"
                          value={ambienteForm.codigo}
                          onChange={(e) => setAmbienteForm({ ...ambienteForm, codigo: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="TIC-Y12"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Capacidad *
                        </label>
                        <input
                          type="number"
                          value={ambienteForm.capacidad}
                          onChange={(e) => setAmbienteForm({ ...ambienteForm, capacidad: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="30"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo *
                        </label>
                        <select
                          value={ambienteForm.tipo}
                          onChange={(e) => setAmbienteForm({ ...ambienteForm, tipo: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Laboratorio">Laboratorio</option>
                          <option value="Taller">Taller</option>
                          <option value="Aula Teórica">Aula Teórica</option>
                          <option value="Sala de Cómputo">Sala de Cómputo</option>
                          <option value="Auditorio">Auditorio</option>
                          <option value="Biblioteca">Biblioteca</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado *
                        </label>
                        <select
                          value={ambienteForm.estado}
                          onChange={(e) => setAmbienteForm({ ...ambienteForm, estado: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Disponible">Disponible</option>
                          <option value="Ocupado">Ocupado</option>
                          <option value="Mantenimiento">Mantenimiento</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ubicación *
                        </label>
                        <input
                          type="text"
                          value={ambienteForm.ubicacion}
                          onChange={(e) => setAmbienteForm({ ...ambienteForm, ubicacion: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Edificio Y - Piso 1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Área Asociada *
                        </label>
                        <select
                          value={ambienteForm.areaId}
                          onChange={(e) => setAmbienteForm({ ...ambienteForm, areaId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar área</option>
                          {areas.map(area => (
                            <option key={area.id} value={area.id}>
                              {area.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Equipamiento
                      </label>
                      <textarea
                        rows={3}
                        value={ambienteForm.equipamiento}
                        onChange={(e) => setAmbienteForm({ ...ambienteForm, equipamiento: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Computadores, proyector, aire acondicionado, pizarra digital..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowAmbienteForm(false);
                        setEditingAmbiente(null);
                        setSelectedCentro(null);
                        resetForm();
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={editingAmbiente ? handleUpdateAmbiente : handleCreateAmbiente}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      {editingAmbiente ? 'Actualizar' : 'Crear Ambiente'}
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

export default AmbientesManagement;