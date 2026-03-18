'use client';

import { useState } from 'react';
import { useTripStore } from '@/lib/store';
import { PackingItem } from '@/lib/types';
import { Check, Plus, Trash2, Package, X } from 'lucide-react';

const CATEGORIES = ['Clothes', 'Toiletries', 'Electronics', 'Documents', 'Misc'];

export default function PackingList({ tripId }: { tripId: string }) {
  const { trips, addPackingItem, deletePackingItem, togglePackingItem, initializePackingList } = useTripStore();
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Misc');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const trip = trips.find((t) => t.id === tripId);
  const items = trip?.packingList?.items || [];

  // Initialize packing list if empty
  const handleInit = () => {
    initializePackingList(tripId);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: PackingItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim(),
      category: newItemCategory,
      packed: false,
    };

    addPackingItem(tripId, newItem);
    setNewItemName('');
    setShowAddForm(false);
  };

  const handleToggle = (itemId: string) => {
    togglePackingItem(tripId, itemId);
  };

  const handleDelete = (itemId: string) => {
    deletePackingItem(tripId, itemId);
  };

  const packedCount = items.filter((item) => item.packed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  const filteredItems = filterCategory
    ? items.filter((item) => item.category === filterCategory)
    : items;

  const groupedItems = CATEGORIES.reduce((acc, category) => {
    acc[category] = filteredItems.filter((item) => item.category === category);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Packing List</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Get started with a pre-populated packing list for your trip.
        </p>
        <button
          onClick={handleInit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Initialize Packing List
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Packing List</h3>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium">{packedCount} of {totalCount} packed</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilterCategory(null)}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            filterCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filterCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <form onSubmit={handleAddItem} className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name"
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            />
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {/* Packing List by Category */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedItems).map(([category, categoryItems]) => {
          if (categoryItems.length === 0) return null;
          return (
            <div key={category}>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                {category}
              </h4>
              <div className="space-y-1">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <button
                      onClick={() => handleToggle(item.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        item.packed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {item.packed && <Check className="w-3 h-3" />}
                    </button>
                    <span className={`flex-1 ${item.packed ? 'line-through text-gray-400' : ''}`}>
                      {item.name}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
