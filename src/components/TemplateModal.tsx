'use client';

import { useState, useEffect } from 'react';
import { useTripStore, useTripActions } from '@/lib/store';
import { TripTemplate } from '@/lib/types';
import { X, Save, Plus, Trash2, Copy, Calendar } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
  tripId?: string;
}

export default function TemplateModal({ isOpen, onClose, mode, tripId }: TemplateModalProps) {
  const { templates, trips } = useTripStore();
  const { saveTripAsTemplate, createTripFromTemplate, deleteTemplate, loadTemplates } = useTripActions();
  
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [includeDates, setIncludeDates] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [newTripName, setNewTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (mode === 'save' && tripId) {
      const trip = trips.find(t => t.id === tripId);
      if (trip) {
        setTemplateName(`${trip.name} Template`);
      }
    }
  }, [mode, tripId, trips]);

  const handleSaveTemplate = () => {
    if (!tripId || !templateName) return;
    saveTripAsTemplate(tripId, templateName, templateDescription, includeDates);
    onClose();
    setTemplateName('');
    setTemplateDescription('');
  };

  const handleCreateFromTemplate = () => {
    if (!selectedTemplateId || !newTripName || !startDate || !endDate) return;
    const newTrip = createTripFromTemplate(selectedTemplateId, newTripName, startDate, endDate);
    if (newTrip) {
      onClose();
      // Navigate to the new trip
      window.location.href = `/trips/${newTrip.id}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {mode === 'save' ? 'Save as Template' : 'Create from Template'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {mode === 'save' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Annual Beach Vacation"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Brief description of this template..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeDates"
                  checked={includeDates}
                  onChange={(e) => setIncludeDates(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="includeDates" className="text-sm text-gray-700 dark:text-gray-300">
                  Include specific dates in template
                </label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The template will save your trip structure (days and activities) but not the specific dates.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Copy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No templates yet.</p>
                  <p className="text-sm">Save a trip as a template to get started.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Template
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => setSelectedTemplateId(template.id)}
                          className={`p-3 border rounded-md cursor-pointer transition-colors ${
                            selectedTemplateId === template.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {template.days.length} day{template.days.length !== 1 ? 's' : ''} •{' '}
                            {template.days.reduce((sum, d) => sum + d.activities.length, 0)} activities
                          </div>
                          {template.description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {template.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedTemplateId && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          New Trip Name
                        </label>
                        <input
                          type="text"
                          value={newTripName}
                          onChange={(e) => setNewTripName(e.target.value)}
                          placeholder="e.g., My 2025 Beach Trip"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Cancel
          </button>
          {mode === 'save' ? (
            <button
              onClick={handleSaveTemplate}
              disabled={!templateName || !tripId}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Template
            </button>
          ) : (
            <button
              onClick={handleCreateFromTemplate}
              disabled={!selectedTemplateId || !newTripName || !startDate || !endDate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
