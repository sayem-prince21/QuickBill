import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Monitor, CheckCircle, X, ExternalLink } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'sidebar' | 'topbar';
  onOpenGuide?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'topbar',
  onOpenGuide,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showHelperModal, setShowHelperModal] = useState(false);

  // If already running as installed desktop app, display confirmation badge or hide
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span>Installed Desktop App</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) setShowHelperModal(true);
    } else {
      setShowHelperModal(true);
    }
  };

  if (variant === 'sidebar') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md transition-all ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <Monitor className="w-4 h-4" />
            <span>Install on PC (1-Click)</span>
          </div>
          <Download className="w-3.5 h-3.5" />
        </button>

        {showHelperModal && (
          <InstallHelpModal onClose={() => setShowHelperModal(false)} onOpenGuide={onOpenGuide} />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all ${className}`}
      >
        <Monitor className="w-3.5 h-3.5" />
        <span>Install Desktop App</span>
      </button>

      {showHelperModal && (
        <InstallHelpModal onClose={() => setShowHelperModal(false)} onOpenGuide={onOpenGuide} />
      )}
    </>
  );
};

const InstallHelpModal: React.FC<{ onClose: () => void; onOpenGuide?: () => void }> = ({
  onClose,
  onOpenGuide,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Install QuickBilling on Your PC</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-600 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
            <p className="font-bold">Two Easy Ways to Install on Windows 10/11:</p>
            <p className="text-[11px] text-emerald-800">
              You can install it instantly in 5 seconds via your browser, or compile the standalone Windows Setup <code>.exe</code> installer!
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="font-bold text-slate-900 text-xs block">
                Method 1: Instant 1-Click Desktop App (Chrome / Edge)
              </span>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                <li>Look at your browser's address bar (URL bar at the top right).</li>
                <li>
                  Click the <strong>Install</strong> icon (<span className="font-mono">⊕</span> or computer screen icon) or open the browser menu (<strong>⋮</strong>) and click <strong>"Install QuickBilling..."</strong>.
                </li>
                <li>Windows creates a dedicated Desktop shortcut, Start Menu shortcut, and runs it as an offline standalone window!</li>
              </ol>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="font-bold text-slate-900 text-xs block">
                Method 2: Standalone Windows Setup (.exe) Installer
              </span>
              <p className="text-slate-600 text-[11px]">
                For retail distribution to computers without internet, run <code>.\scripts\publish-windows.ps1</code> in PowerShell to generate <code>QuickBilling-Setup.exe</code> with Inno Setup.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {onOpenGuide ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGuide();
                }}
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <span>View Full Packaging Guide</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
