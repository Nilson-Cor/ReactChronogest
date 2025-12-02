import React, { useState } from 'react';
import { User } from '../../types';
import FormField from '../molecules/FormField';
import PasswordField from '../molecules/PasswordField';
import Button from '../atoms/Button';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onRegisterClick: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onRegisterClick }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorAuth, setErrorAuth] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setErrorAuth('');

    try {
      // Llamar al API
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Guardar token en localStorage
        localStorage.setItem('token', data.token);
        
        // Crear objeto User compatible con tu interfaz
        const user: User = {
          username: data.user.username,
          password: '', // No guardamos la contraseña en el frontend
          role: data.user.role,
          name: data.user.name
        };

        onLogin(user);
      } else {
        setErrorAuth(data.message || 'Usuario o contraseña incorrectos');
        setTimeout(() => setErrorAuth(''), 3000);
      }
    } catch (error) {
      console.error('Error en login:', error);
      setErrorAuth('Error de conexión. Verifica que el servidor esté activo.');
      setTimeout(() => setErrorAuth(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Inicio de sesión de usuarios
      </h2>
      
      <div className="space-y-6">
        <FormField
          label="Usuario"
          name="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="Ingrese su usuario"
        />

        <PasswordField
          label="Contraseña"
          name="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="••••••••••"
        />

        {errorAuth && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errorAuth}
          </div>
        )}

        <Button 
          onClick={handleSubmit} 
          variant="primary" 
          className="w-full py-3"
          disabled={loading}
        >
          {loading ? 'CARGANDO...' : 'CONTINUAR'}
        </Button>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Usuarios de prueba:</strong><br/>
            Instructor: instructor1 / instructor123<br/>
            Aprendiz: aprendiz1 / aprendiz123<br/>
            Admin: admin1 / admin123
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          ¿Eres administrador?{' '}
          <button 
            onClick={onRegisterClick}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Registra usuarios aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;