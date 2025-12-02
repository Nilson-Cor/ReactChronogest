import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Badge from '../atoms/Badge';

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

interface UserTableProps {
  users: RegisteredUser[];
  onDelete: (id: string, type: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onDelete }) => {
  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, 'admin' | 'instructor' | 'aprendiz'> = {
      admin: 'admin',
      instructor: 'instructor',
      aprendiz: 'aprendiz'
    };
    
    const roleNames: Record<string, string> = {
      admin: 'Administrador',
      instructor: 'Instructor',
      aprendiz: 'Aprendiz'
    };

    return <Badge variant={roleMap[role]}>{roleNames[role] || role}</Badge>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Usuario</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre Completo</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rol</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
              <td className="py-3 px-4 text-sm text-gray-800 font-medium">{user.username}</td>
              <td className="py-3 px-4 text-sm text-gray-700">{user.fullName}</td>
              <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(user.id, user.type || 'registrado')}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
  );
};

export default UserTable;