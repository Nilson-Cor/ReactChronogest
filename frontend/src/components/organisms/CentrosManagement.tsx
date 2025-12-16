import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, ChevronDown, ChevronRight, Building2, MapPin } from 'lucide-react';

interface Tecnoparque {
  id: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  createdAt: string;
}

interface Centro {
  id: string;
  nombre: string;
  codigo: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  email: string;
  tecnoparques: Tecnoparque[];
  createdAt: string;
}

interface CentroFormData {
  nombre: string;
  codigo: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  email: string;
}

interface TecnoparqueFormData {
  nombre: string;
  descripcion: string;
  ubicacion: string;
}

const CentrosManagement: React.FC = () => {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [expandedCentros, setExpandedCentros] = useState<Set<string>>(new Set());
  const [showCentroForm, setShowCentroForm] = useState(false);
  const [showTecnoparqueForm, setShowTecnoparqueForm] = useState(false);
  const [selectedCentro, setSelectedCentro] = useState<string | null>(null);
  const [editingCentro, setEditingCentro] = useState<Centro | null>(null);
  const [editingTecnoparque, setEditingTecnoparque] = useState<Tecnoparque | null>(null);

  const [centroForm, setCentroForm] = useState<CentroFormData>({
    nombre: '',
    codigo: '',
    ciudad: '',
    direccion: '',
    telefono: '',
    email: ''
  });

  const [tecnoparqueForm, setTecnoparqueForm] = useState<TecnoparqueFormData>({
    nombre: '',
    descripcion: '',
    ubicacion: ''
  });

  useEffect(() => {
    loadCentros();
  }, []);

  const loadCentros = () => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('centro:'));
      const centrosData = keys.map(key => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }).filter((centro): centro is Centro => centro !== null);
      setCentros(centrosData);
    } catch (error) {
      console.log('No hay centros guardados aún');
      setCentros([]);
    }
  };

  const saveCentro = (centro: Centro) => {
    localStorage.setItem(`centro:${centro.id}`, JSON.stringify(centro));
  };

  const deleteCentro = (id: string) => {
    localStorage.removeItem(`centro:${id}`);
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

  const handleCreateCentro = () => {
    if (!centroForm.nombre || !centroForm.codigo || !centroForm.ciudad || 
        !centroForm.direccion || !centroForm.telefono || !centroForm.email) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    const newCentro: Centro = {
      id: Date.now().toString(),
      ...centroForm,
      tecnoparques: [],
      createdAt: new Date().toISOString()
    };

    saveCentro(newCentro);
    loadCentros();
    
    setShowCentroForm(false);
    setCentroForm({
      nombre: '',
      codigo: '',
      ciudad: '',
      direccion: '',
      telefono: '',
      email: ''
    });
  };

  const handleUpdateCentro = () => {
    if (!editingCentro) return;

    if (!centroForm.nombre || !centroForm.codigo || !centroForm.ciudad || 
        !centroForm.direccion || !centroForm.telefono || !centroForm.email) {
      alert('Por favor completa todos los campos');
      return;
    }

    const updatedCentro: Centro = {
      ...editingCentro,
      ...centroForm
    };

    saveCentro(updatedCentro);
    loadCentros();
    
    setEditingCentro(null);
    setCentroForm({
      nombre: '',
      codigo: '',
      ciudad: '',
      direccion: '',
      telefono: '',
      email: ''
    });
  };

  const handleDeleteCentro = (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este centro? Se eliminarán también todos sus tecnoparques.')) {
      return;
    }

    deleteCentro(id);
    loadCentros();
  };

  const handleCreateTecnoparque = () => {
    if (!selectedCentro) return;

    if (!tecnoparqueForm.nombre || !tecnoparqueForm.descripcion || !tecnoparqueForm.ubicacion) {
      alert('Por favor completa todos los campos');
      return;
    }

    const centro = centros.find(c => c.id === selectedCentro);
    if (!centro) return;

    const newTecnoparque: Tecnoparque = {
      id: Date.now().toString(),
      ...tecnoparqueForm,
      createdAt: new Date().toISOString()
    };

    const updatedCentro = {
      ...centro,
      tecnoparques: [...centro.tecnoparques, newTecnoparque]
    };

    saveCentro(updatedCentro);
    loadCentros();
    
    setShowTecnoparqueForm(false);
    setSelectedCentro(null);
    setTecnoparqueForm({
      nombre: '',
      descripcion: '',
      ubicacion: ''
    });
  };

  const handleUpdateTecnoparque = () => {
    if (!editingTecnoparque || !selectedCentro) return;

    if (!tecnoparqueForm.nombre || !tecnoparqueForm.descripcion || !tecnoparqueForm.ubicacion) {
      alert('Por favor completa todos los campos');
      return;
    }

    const centro = centros.find(c => c.id === selectedCentro);
    if (!centro) return;

    const updatedTecnoparques = centro.tecnoparques.map(t =>
      t.id === editingTecnoparque.id ? { ...t, ...tecnoparqueForm } : t
    );

    const updatedCentro = {
      ...centro,
      tecnoparques: updatedTecnoparques
    };

    saveCentro(updatedCentro);
    loadCentros();
    
    setEditingTecnoparque(null);
    setSelectedCentro(null);
    setTecnoparqueForm({
      nombre: '',
      descripcion: '',
      ubicacion: ''
    });
  };

  const handleDeleteTecnoparque = (centroId: string, tecnoparqueId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este tecnoparque?')) {
      return;
    }

    const centro = centros.find(c => c.id === centroId);
    if (!centro) return;

    const updatedCentro = {
      ...centro,
      tecnoparques: centro.tecnoparques.filter(t => t.id !== tecnoparqueId)
    };

    saveCentro(updatedCentro);
    loadCentros();
  };

  const startEditCentro = (centro: Centro) => {
    setEditingCentro(centro);
    setCentroForm({
      nombre: centro.nombre,
      codigo: centro.codigo,
      ciudad: centro.ciudad,
      direccion: centro.direccion,
      telefono: centro.telefono,
      email: centro.email
    });
  };

  const startEditTecnoparque = (centroId: string, tecnoparque: Tecnoparque) => {
    setSelectedCentro(centroId);
    setEditingTecnoparque(tecnoparque);
    setTecnoparqueForm({
      nombre: tecnoparque.nombre,
      descripcion: tecnoparque.descripcion,
      ubicacion: tecnoparque.ubicacion
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Centros</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Total: <span className="font-bold text-gray-800">{centros.length}</span> centros
          </div>
          <button
            onClick={() => setShowCentroForm(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Centro
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {centros.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">No hay centros registrados</p>
            <p className="text-sm text-gray-500">Crea tu primer centro para comenzar</p>
          </div>
        ) : (
          centros.map(centro => (
            <div key={centro.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4">
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
                    <Building2 className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{centro.nombre}</h3>
                      <p className="text-sm text-gray-600">Código: {centro.codigo} | {centro.ciudad}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCentro(centro.id);
                        setShowTecnoparqueForm(true);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      + Tecnoparque
                    </button>
                    <button
                      onClick={() => startEditCentro(centro)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCentro(centro.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {expandedCentros.has(centro.id) && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Dirección:</span>
                      <p className="font-medium">{centro.direccion}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Teléfono:</span>
                      <p className="font-medium">{centro.telefono}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{centro.email}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Tecnoparques ({centro.tecnoparques.length})
                    </h4>
                    {centro.tecnoparques.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No hay tecnoparques registrados</p>
                    ) : (
                      <div className="space-y-2">
                        {centro.tecnoparques.map(tecno => (
                          <div
                            key={tecno.id}
                            className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-800">{tecno.nombre}</h5>
                              <p className="text-sm text-gray-600">{tecno.descripcion}</p>
                              <p className="text-xs text-gray-500 mt-1">📍 {tecno.ubicacion}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEditTecnoparque(centro.id, tecno)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTecnoparque(centro.id, tecno.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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

      {(showCentroForm || editingCentro) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {editingCentro ? 'Editar Centro' : 'Nuevo Centro'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Centro *
                  </label>
                  <input
                    type="text"
                    value={centroForm.nombre}
                    onChange={(e) => setCentroForm({ ...centroForm, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Centro de Gestión y Desarrollo..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código *
                    </label>
                    <input
                      type="text"
                      value={centroForm.codigo}
                      onChange={(e) => setCentroForm({ ...centroForm, codigo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="CGDSS"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      value={centroForm.ciudad}
                      onChange={(e) => setCentroForm({ ...centroForm, ciudad: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Pitalito"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={centroForm.direccion}
                    onChange={(e) => setCentroForm({ ...centroForm, direccion: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Calle 123 #45-67"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={centroForm.telefono}
                      onChange={(e) => setCentroForm({ ...centroForm, telefono: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+57 314 2520812"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={centroForm.email}
                      onChange={(e) => setCentroForm({ ...centroForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="centro@sena.edu.co"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCentroForm(false);
                    setEditingCentro(null);
                    setCentroForm({
                      nombre: '',
                      codigo: '',
                      ciudad: '',
                      direccion: '',
                      telefono: '',
                      email: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingCentro ? handleUpdateCentro : handleCreateCentro}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {editingCentro ? 'Actualizar' : 'Crear Centro'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(showTecnoparqueForm || editingTecnoparque) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {editingTecnoparque ? 'Editar Tecnoparque' : 'Nuevo Tecnoparque'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Tecnoparque *
                  </label>
                  <input
                    type="text"
                    value={tecnoparqueForm.nombre}
                    onChange={(e) => setTecnoparqueForm({ ...tecnoparqueForm, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tecnoparque 7 Agroecológico Yamboro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    rows={3}
                    value={tecnoparqueForm.descripcion}
                    onChange={(e) => setTecnoparqueForm({ ...tecnoparqueForm, descripcion: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Descripción del tecnoparque..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    value={tecnoparqueForm.ubicacion}
                    onChange={(e) => setTecnoparqueForm({ ...tecnoparqueForm, ubicacion: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Yamboro, Pitalito"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowTecnoparqueForm(false);
                    setEditingTecnoparque(null);
                    setSelectedCentro(null);
                    setTecnoparqueForm({
                      nombre: '',
                      descripcion: '',
                      ubicacion: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingTecnoparque ? handleUpdateTecnoparque : handleCreateTecnoparque}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {editingTecnoparque ? 'Actualizar' : 'Crear Tecnoparque'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentrosManagement;