import React, { useState, useEffect } from 'react';
import { Clock, Calendar, BookOpen, Users, AlertCircle, Home } from 'lucide-react';
import { User } from '../../types';
import Header from '../organisms/Header';
import Sidebar from '../organisms/Sidebar';
import LoginForm from '../organisms/LoginForm';
import RegisterForm from '../organisms/RegisterForm';
import UserTable from '../organisms/UserTable';

interface RegisteredUser {
  id: string;
  username: string;
  password: string;
  role: string;
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  createdAt: string;
  type?: string;
}

const ChronogestApp: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeMenu, setActiveMenu] = useState('inicio');
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error al recuperar sesión:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  // Cargar usuarios desde la API
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        console.error('Error cargando usuarios:', data.message);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Cargar usuarios cuando se accede a la gestión de usuarios
  useEffect(() => {
    if (activeMenu === 'usuarios' && currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [activeMenu, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('userData', JSON.stringify(user));
    setActiveMenu('inicio');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setActiveMenu('inicio');
  };

  const handleDeleteUser = async (id: string, type: string) => {
    if (type === 'predefinido') {
      alert('No puedes eliminar usuarios predefinidos del sistema');
      return;
    }
    
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Usuario eliminado exitosamente');
        fetchUsers();
      } else {
        alert(data.message || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error de conexión');
    }
  };

  const handleRegisterSuccess = () => {
    fetchUsers();
  };

  // Vista de Login
  if (!currentUser) {
    return (
      <>
        <div className="min-h-screen flex">
          <div className="w-2/5 bg-gradient-to-br from-green-500 to-green-600 flex flex-col justify-center items-center text-white p-12">
            <div className="text-left w-full max-w-md">
              <div className="flex items-center gap-3 mb-8">
                <Clock className="w-12 h-12" />
                <h1 className="text-4xl font-bold">CHRONOGEST.com</h1>
              </div>
              <h2 className="text-2xl font-bold mb-4">
                Chronogest sistema de gestión de horarios
              </h2>
              <p className="text-lg text-white/90">
                Lleva una mejor organización y control en tus jornadas laborales y académicas.
              </p>
            </div>
          </div>

          <div className="w-3/5 bg-gray-50 flex items-center justify-center p-12">
            <div className="w-full max-w-md">
              <LoginForm 
                onLogin={handleLogin} 
                onRegisterClick={() => setShowRegisterForm(true)}
              />
            </div>
          </div>
        </div>

        {showRegisterForm && (
          <RegisterForm 
            onClose={() => setShowRegisterForm(false)}
            onSuccess={handleRegisterSuccess}
          />
        )}
      </>
    );
  }

  // Vista Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onGoHome={() => setActiveMenu('inicio')} onLogout={handleLogout} />

      <div className="flex">
        <Sidebar 
          role={currentUser.role} 
          activeMenu={activeMenu} 
          onMenuClick={setActiveMenu}
          userName={currentUser.name}
        />

        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">CHRONOGEST.com</h1>
              <p className="text-gray-600">Sistema de Gestión de Horarios - SENA</p>
            </div>

            {/* Inicio */}
            {activeMenu === 'inicio' && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido, {currentUser.name}</h2>
                <p className="text-gray-600">Centro de Formación Yamboro, Pitalito</p>
                <p className="text-sm text-gray-500 mt-2">Rol: {currentUser.role}</p>
              </div>
            )}

            {/* Gestión de Usuarios */}
            {activeMenu === 'usuarios' && currentUser.role === 'admin' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-green-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Total: <span className="font-bold text-gray-800">{users.length}</span> usuarios
                    </div>
                    <button
                      onClick={() => setShowRegisterForm(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      + Nuevo Usuario
                    </button>
                  </div>
                </div>
                
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Cargando usuarios...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No hay usuarios registrados</p>
                  </div>
                ) : (
                  <UserTable users={users} onDelete={handleDeleteUser} />
                )}
              </div>
            )}

            {/* Resto de secciones */}
            {activeMenu === 'centros' && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Centros</h2>
                <p className="text-gray-600">Contenido en desarrollo</p>
              </div>
            )}

            {activeMenu === 'fichas' && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Fichas</h2>
                <p className="text-gray-600">Contenido en desarrollo</p>
              </div>
            )}

            {(activeMenu === 'horarios' || activeMenu === 'horario') && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {currentUser.role === 'admin' ? 'Gestión de Horarios' : 'Mi Horario'}
                </h2>
                <p className="text-gray-600">Contenido en desarrollo</p>
              </div>
            )}

            {(activeMenu === 'solicitudes' || activeMenu === 'solicitar') && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {currentUser.role === 'admin' ? 'Solicitudes de Cambio' : 'Solicitar Cambio'}
                </h2>
                <p className="text-gray-600">Contenido en desarrollo</p>
              </div>
            )}

            {activeMenu === 'programas' && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Programas</h2>
                <p className="text-gray-600">Contenido en desarrollo</p>
              </div>
            )}

            {activeMenu === 'ambientes' && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Ambientes</h2>
                <p className="text-gray-600">Contenido en desarrollo</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRegisterForm && (
        <RegisterForm 
          onClose={() => setShowRegisterForm(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}

      <footer className="bg-blue-900 text-white py-6 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h4 className="font-bold text-xl mb-3 text-green-400">Sena</h4>
          <p className="text-base mb-2">¡Contáctenos!</p>
          <p className="text-sm mb-1">cgdssena@gmail.com</p>
          <p className="text-sm mb-4">+57 314 2520812</p>
          <div className="pt-4 border-t border-blue-800">
            <p className="text-sm">© Adso 3063290</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChronogestApp;