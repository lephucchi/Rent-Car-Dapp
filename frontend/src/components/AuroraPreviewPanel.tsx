import React from 'react';
import { Eye, EyeOff, Palette, User, Crown, Shield } from 'lucide-react';
import { usePreviewMode } from '../contexts/PreviewModeContext';
import { useTheme } from '../contexts/ThemeContext';

export const AuroraPreviewPanel: React.FC = () => {
  const {
    showPreviewPanel,
    simulatedRole,
    simulatedTheme,
    setSimulatedRole,
    setSimulatedTheme,
    enterPreviewMode,
    setShowPreviewPanel
  } = usePreviewMode();
  const { setTheme } = useTheme();

  if (!showPreviewPanel) return null;

  const handleEnterPreview = () => {
    setTheme(simulatedTheme);
    enterPreviewMode();
  };

  const roles = [
    { id: 'user' as const, label: 'User/Renter', icon: User, description: 'Browse and rent cars on CarDapp' },
    { id: 'admin' as const, label: 'Car Owner/Lessor', icon: Crown, description: 'Register cars and manage rentals' },
    { id: 'inspector' as const, label: 'Damage Inspector', icon: Shield, description: 'Assess damage on returned cars' }
  ];

  const themes = [
    { id: 'light-aurora' as const, label: 'Light Mode', description: 'Bright, professional CarDapp interface' },
    { id: 'dark-aurora' as const, label: 'Dark Mode', description: 'Sleek dark theme for comfortable viewing' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-xl shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 aurora-gradient rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">CarDapp Preview Mode</h2>
                <p className="text-sm text-muted-foreground">
                  Explore CarDapp functionality without connecting MetaMask
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPreviewPanel(false)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <EyeOff className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Role Selection */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              Select Role
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSimulatedRole(role.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      simulatedRole === role.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon className={`w-5 h-5 ${
                        simulatedRole === role.id ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className={`font-medium ${
                        simulatedRole === role.id ? 'text-primary' : 'text-foreground'
                      }`}>
                        {role.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-secondary" />
              Select Theme
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSimulatedTheme(theme.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    simulatedTheme === theme.id
                      ? 'border-secondary bg-secondary/10'
                      : 'border-border hover:border-secondary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${
                      simulatedTheme === theme.id ? 'text-secondary' : 'text-foreground'
                    }`}>
                      {theme.label}
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      theme.id === 'light-aurora' 
                        ? 'bg-white border-gray-300' 
                        : 'bg-gray-800 border-gray-600'
                    }`} />
                  </div>
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Selection Summary */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">Preview Configuration</h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Role:</span>
              <span className="text-foreground font-medium">
                {roles.find(r => r.id === simulatedRole)?.label}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Theme:</span>
              <span className="text-foreground font-medium">
                {themes.find(t => t.id === simulatedTheme)?.label}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleEnterPreview}
              className="aurora-button flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Enter Preview Mode
            </button>
            <button
              onClick={() => setShowPreviewPanel(false)}
              className="aurora-button-outline px-6 py-3"
            >
              Cancel
            </button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Preview mode disables all blockchain transactions
          </div>
        </div>
      </div>
    </div>
  );
};
