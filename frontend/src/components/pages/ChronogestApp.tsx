import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Users, AlertCircle, Home } from 'lucide-react';
import { User } from '../../types';
import Header from '../organisms/Header';
import Sidebar from '../organisms/Sidebar';
import LoginForm from '../organisms/LoginForm';
import RegisterForm from '../organisms/RegisterForm';
import UserTable from '../organisms/UserTable';
import { API_URL } from '../../config';
import CentrosManagement from '../organisms/CentrosManagement';
import AreasProgramasManagement from '../organisms/AreasProgramasManagement';
import HorariosManagement from '../organisms/HorariosManagement';
import HorarioInstructor from '../organisms/HorarioInstructor';
import HorarioAprendiz from '../organisms/HorarioAprendiz';

interface AppUser extends User {
  id?: string;
  name: string;
  role: 'admin' | 'instructor' | 'aprendiz';
  fichaId?: string;
  fichaNumero?: string;
  programaNombre?: string;
}

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
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [activeMenu, setActiveMenu] = useState('inicio');
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  /* Recuperar sesión */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch {
        localStorage.clear();
      }
    }
  }, []);

  /* Usuarios */
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'usuarios' && currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [activeMenu, currentUser]);

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem('userData', JSON.stringify(user));
    setActiveMenu('inicio');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.clear();
    setActiveMenu('inicio');
  };

  const handleDeleteUser = async (id: string, type: string) => {
    if (type === 'predefinido') return alert('No puedes eliminar este usuario');
    if (!confirm('¿Eliminar usuario?')) return;

    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchUsers();
  };

  /* LOGIN */
  if (!currentUser) {
    return (
      <>
        <div className="min-h-screen flex">
          <div className="w-2/5 bg-green-600 text-white flex items-center p-12">
            <div>
              <Clock className="w-12 h-12 mb-6" />
              <h1 className="text-4xl font-bold mb-4">CHRONOGEST</h1>
              <p>Sistema de gestión de horarios</p>
            </div>
          </div>

          <div className="w-3/5 flex items-center justify-center">
            <LoginForm
              onLogin={handleLogin}
              onRegisterClick={() => setShowRegisterForm(true)}
            />
          </div>
        </div>

        {showRegisterForm && (
          <RegisterForm
            onClose={() => setShowRegisterForm(false)}
            onSuccess={fetchUsers}
          />
        )}
      </>
    );
  }

  /* DASHBOARD */
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

        <main className="flex-1 p-8 max-w-6xl mx-auto">
          {activeMenu === 'inicio' && (
            <div className="bg-white p-8 rounded shadow text-center">
              <BookOpen className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold">Bienvenido {currentUser.name}</h2>
              <p className="text-gray-500">Rol: {currentUser.role}</p>
            </div>
          )}

          {activeMenu === 'usuarios' && currentUser.role === 'admin' && (
            <UserTable users={users} onDelete={handleDeleteUser} />
          )}

          {activeMenu === 'centros' && <CentrosManagement />}
          {activeMenu === 'programas' && <AreasProgramasManagement />}

          {activeMenu === 'horarios' && currentUser.role === 'admin' && (
            <HorariosManagement />
          )}

          {activeMenu === 'horarios' && currentUser.role === 'instructor' && (
            <HorarioInstructor
              instructorId={currentUser.id ?? ''}
              instructorNombre={currentUser.name}
            />
          )}

          {activeMenu === 'horarios' && currentUser.role === 'aprendiz' && (
            <HorarioAprendiz
              fichaId={currentUser.fichaId ?? ''}
              fichaNumero={currentUser.fichaNumero ?? ''}
              programaNombre={currentUser.programaNombre ?? ''}
            />
          )}

          {(activeMenu === 'solicitudes' || activeMenu === 'solicitar') && (
            <div className="bg-white p-8 rounded shadow text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p>Contenido en desarrollo</p>
            </div>
          )}

          {activeMenu === 'ambientes' && (
            <div className="bg-white p-8 rounded shadow text-center">
              <Home className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p>Gestión de Ambientes</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChronogestApp;
