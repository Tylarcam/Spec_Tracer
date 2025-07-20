
import React from 'react';
import { LogTraceSettings } from '@/shared/types';

interface SettingsPanelProps {
  traceSettings: LogTraceSettings;
  updateTraceSettings: (settings: Partial<LogTraceSettings>) => void;
  isLoading: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  traceSettings,
  updateTraceSettings,
  isLoading,
}) => {
  return (
    <div className="bg-gray-700 rounded p-3 mb-4">
      <h4 className="text-white font-semibold mb-2">Settings</h4>
      <div className="space-y-3">
        <div>
          <label className="text-white text-sm block mb-1">Max Events</label>
          <input
            type="number"
            value={traceSettings.maxEvents}
            onChange={(e) => updateTraceSettings({ maxEvents: parseInt(e.target.value) })}
            className="w-full bg-gray-600 text-white px-2 py-1 rounded text-sm"
            disabled={isLoading}
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={traceSettings.autoSave}
            onChange={(e) => updateTraceSettings({ autoSave: e.target.checked })}
            className="mr-2"
            disabled={isLoading}
          />
          <label className="text-white text-sm">Auto Save</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={traceSettings.showElementPath}
            onChange={(e) => updateTraceSettings({ showElementPath: e.target.checked })}
            className="mr-2"
            disabled={isLoading}
          />
          <label className="text-white text-sm">Show Element Path</label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={traceSettings.debugMode}
            onChange={(e) => updateTraceSettings({ debugMode: e.target.checked })}
            className="mr-2"
            disabled={isLoading}
          />
          <label className="text-white text-sm">Debug Mode</label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
