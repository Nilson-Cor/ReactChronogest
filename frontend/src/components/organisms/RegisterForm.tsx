import React, { useState } from 'react';
import { X } from 'lucide-react';
import FormField from '../molecules/FormField';
import PasswordField from '../molecules/PasswordField';
import Button from '../atoms/Button';
import { API_URL } from '../../config';

interface RegisterFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'instructor',
    fullName: '',
    email: '',
    phone: '',
    documentType: 'CC',
    documentNumber: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) newErrors.username = 'Usuario requerido';
    if (!formData.password) newErrors.password = 'Contraseña requerida';
    if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!formData.fullName) newErrors.fullName = 'Nombre completo requerido';
    if (!formData.email) newErrors.email = 'Email requerido';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.phone) newErrors.phone = 'Teléfono requerido';
    if (!formData.documentNumber) newErrors.documentNumber = 'Número de documento requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setServerError('');

    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Usuario registrado exitosamente');
        onSuccess();
        onClose();
      } else {
        setServerError(data.message || 'Error al registrar usuario');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      setServerError('Error de conexión. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Registrar Usuario</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Usuario *"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="Ingrese usuario"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="instructor">Instructor</option>
                <option value="aprendiz">Aprendiz</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PasswordField
              label="Contraseña *"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Mínimo 6 caracteres"
            />

            <PasswordField
              label="Confirmar Contraseña *"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Repita la contraseña"
            />
          </div>

          <FormField
            label="Nombre Completo *"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="Ingrese nombre completo"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="correo@ejemplo.com"
            />

            <FormField
              label="Teléfono *"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="3001234567"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Documento *
              </label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="PAS">Pasaporte</option>
              </select>
            </div>

            <FormField
              label="Número de Documento *"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              error={errors.documentNumber}
              placeholder="Ingrese número"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'REGISTRANDO...' : 'REGISTRAR USUARIO'}
            </Button>
            <Button 
              type="button"
              variant="secondary" 
              onClick={onClose}
              disabled={loading}
            >
              CANCELAR
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;