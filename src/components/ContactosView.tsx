import React, { useState } from 'react';
import { Plus, Search, BookUser, Phone, Mail, Building2, Trash2 } from 'lucide-react';
import { Cliente, Proveedor } from '../types';
import { Modal } from './Modal';

interface ContactosViewProps {
  clientes: Cliente[];
  proveedores: Proveedor[];
  onAddCliente: (cli: Omit<Cliente, 'id'>) => void;
  onAddProveedor: (pro: Omit<Proveedor, 'id'>) => void;
  onDeleteCliente: (id: string) => void;
  onDeleteProveedor: (id: string) => void;
  onNotify: (msg: string, type: 'success' | 'warning' | 'danger' | 'info') => void;
}

export const ContactosView: React.FC<ContactosViewProps> = ({
  clientes,
  proveedores,
  onAddCliente,
  onAddProveedor,
  onDeleteCliente,
  onDeleteProveedor,
  onNotify,
}) => {
  const [subTab, setSubTab] = useState<'clientes' | 'proveedores'>('clientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCliModalOpen, setIsCliModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  // Cliente Form State
  const [cliNombre, setCliNombre] = useState('');
  const [cliCuit, setCliCuit] = useState('');
  const [cliTel, setCliTel] = useState('');
  const [cliEmail, setCliEmail] = useState('');
  const [cliCategoria, setCliCategoria] = useState('Corporativo');

  // Proveedor Form State
  const [proNombre, setProNombre] = useState('');
  const [proCuit, setProCuit] = useState('');
  const [proTel, setProTel] = useState('');
  const [proRubro, setProRubro] = useState('Insumos');
  const [proCbu, setProCbu] = useState('');

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliNombre.trim()) return;

    onAddCliente({
      nombre: cliNombre.trim(),
      cuitDni: cliCuit.trim() || '-',
      telefono: cliTel.trim() || '-',
      email: cliEmail.trim() || '-',
      categoria: cliCategoria,
    });

    onNotify('✅ Cliente agregado correctamente', 'success');
    setIsCliModalOpen(false);

    setCliNombre('');
    setCliCuit('');
    setCliTel('');
    setCliEmail('');
  };

  const handleProSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proNombre.trim()) return;

    onAddProveedor({
      nombre: proNombre.trim(),
      cuit: proCuit.trim() || '-',
      telefono: proTel.trim() || '-',
      rubro: proRubro,
      cbuAlias: proCbu.trim() || '-',
    });

    onNotify('✅ Proveedor agregado correctamente', 'success');
    setIsProModalOpen(false);

    setProNombre('');
    setProCuit('');
    setProTel('');
    setProCbu('');
  };

  const filteredClientes = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cuitDni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProveedores = proveedores.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.rubro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📖 Agenda de Clientes y Proveedores</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Directorio comercial para facturación y cuentas corrientes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'clientes' ? (
            <button
              onClick={() => setIsCliModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Cliente</span>
            </button>
          ) : (
            <button
              onClick={() => setIsProModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Proveedor</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-lg w-full sm:w-auto border border-gray-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setSubTab('clientes')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              subTab === 'clientes'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Clientes ({clientes.length})
          </button>
          <button
            onClick={() => setSubTab('proveedores')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              subTab === 'proveedores'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Proveedores ({proveedores.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
      </div>

      {/* Grid Content */}
      {subTab === 'clientes' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClientes.map((c) => (
            <div
              key={c.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800 uppercase">
                    {c.categoria}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar cliente ${c.nombre}?`)) {
                        onDeleteCliente(c.id);
                        onNotify('Cliente eliminado', 'info');
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-2">
                  {c.nombre}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">CUIT/DNI: {c.cuitDni}</p>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.email}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProveedores.map((p) => (
            <div
              key={p.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800 uppercase">
                    {p.rubro}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar proveedor ${p.nombre}?`)) {
                        onDeleteProveedor(p.id);
                        onNotify('Proveedor eliminado', 'info');
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-2">
                  {p.nombre}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">CUIT: {p.cuit}</p>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>CBU/Alias: {p.cbuAlias || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuevo Cliente */}
      <Modal
        isOpen={isCliModalOpen}
        onClose={() => setIsCliModalOpen(false)}
        title="Agregar Nuevo Cliente"
      >
        <form onSubmit={handleCliSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Nombre / Razón Social
            </label>
            <input
              type="text"
              placeholder="Ej. TechCorp Argentina S.A."
              value={cliNombre}
              onChange={(e) => setCliNombre(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                CUIT / DNI
              </label>
              <input
                type="text"
                placeholder="30-12345678-9"
                value={cliCuit}
                onChange={(e) => setCliCuit(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Categoría
              </label>
              <select
                value={cliCategoria}
                onChange={(e) => setCliCategoria(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option value="Corporativo VIP">Corporativo VIP</option>
                <option value="Mayorista">Mayorista</option>
                <option value="Minorista">Minorista</option>
                <option value="Particular">Particular</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                placeholder="+54 11 1234-5678"
                value={cliTel}
                onChange={(e) => setCliTel(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="contacto@cliente.com"
                value={cliEmail}
                onChange={(e) => setCliEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsCliModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
            >
              Guardar Cliente
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Nuevo Proveedor */}
      <Modal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        title="Agregar Nuevo Proveedor"
      >
        <form onSubmit={handleProSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Nombre / Empresa
            </label>
            <input
              type="text"
              placeholder="Ej. Importadora Central S.R.L."
              value={proNombre}
              onChange={(e) => setProNombre(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                CUIT
              </label>
              <input
                type="text"
                placeholder="30-98765432-1"
                value={proCuit}
                onChange={(e) => setProCuit(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Rubro Principal
              </label>
              <input
                type="text"
                placeholder="Ej. Hardware, Insumos, Papelería"
                value={proRubro}
                onChange={(e) => setProRubro(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                placeholder="+54 11 4000-0000"
                value={proTel}
                onChange={(e) => setProTel(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                CBU / Alias Bancario
              </label>
              <input
                type="text"
                placeholder="PROVEEDOR.ALIAS.MP"
                value={proCbu}
                onChange={(e) => setProCbu(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsProModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md"
            >
              Guardar Proveedor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
