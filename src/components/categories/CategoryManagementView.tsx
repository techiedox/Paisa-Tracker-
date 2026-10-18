import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, AlertCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Category } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

const AVAILABLE_ICONS = [
  'Utensils',
  'ShoppingCart',
  'Car',
  'ShoppingBag',
  'Receipt',
  'HeartPulse',
  'GraduationCap',
  'Film',
  'Home',
  'Plane',
  'Briefcase',
  'Laptop',
  'TrendingUp',
  'ShieldCheck',
  'Gift',
  'Coffee',
  'Book',
  'Smartphone',
  'Gamepad2',
  'Tag',
];

const AVAILABLE_COLORS = [
  '#F97316',
  '#10B981',
  '#0EA5E9',
  '#EC4899',
  '#EAB308',
  '#EF4444',
  '#8B5CF6',
  '#6366F1',
  '#14B8A6',
  '#06B6D4',
  '#3B82F6',
  '#84CC16',
  '#6B7280',
];

export const CategoryManagementView: React.FC = () => {
  const { categories, saveCategory, deleteCategory } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income' | 'both'>('expense');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#10B981');
  const [formError, setFormError] = useState('');

  const openCreate = () => {
    setEditingCategory(null);
    setName('');
    setType('expense');
    setIcon('Tag');
    setColor('#10B981');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setType(c.type);
    setIcon(c.icon);
    setColor(c.color);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a category name.');
      return;
    }

    saveCategory({
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      type,
      icon,
      color,
      isDefault: editingCategory ? editingCategory.isDefault : false,
    });

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      const res = deleteCategory(deletingId);
      if (!res.success) {
        setDeleteError(res.error || 'Cannot delete category.');
      } else {
        setDeleteError(null);
      }
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 px-4 py-3 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Categories
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Organize expenses and income streams
          </p>
        </div>

        <button
          onClick={openCreate}
          className="py-2 px-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs hover:scale-102"
        >
          <Plus size={14} />
          <span>New Category</span>
        </button>
      </div>

      {deleteError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {categories.map((c) => (
          <div
            key={c.id}
            className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${c.color}20`, color: c.color }}
              >
                <CategoryIcon name={c.icon} size={18} color={c.color} />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                  {c.name}
                </span>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                  {c.type}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openEdit(c)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                title="Edit Category"
              >
                <Edit2 size={13} />
              </button>
              {!c.isDefault && (
                <button
                  onClick={() => setDeletingId(c.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  title="Delete Custom Category"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/60 rounded-lg">
              {formError}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Category Name
            </label>
            <input
              type="text"
              placeholder="e.g. Subscriptions, Pet Care"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Category Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['expense', 'income', 'both'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 text-xs font-semibold rounded-xl border capitalize cursor-pointer ${
                    type === t
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Choose Icon
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              {AVAILABLE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                    icon === ic
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <CategoryIcon name={ic} size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
              Color Accent
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-zinc-900 scale-110' : 'opacity-80'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this custom category? Categories with existing transactions cannot be removed."
      />
    </div>
  );
};
