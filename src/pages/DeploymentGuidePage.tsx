import React, { useState } from 'react';
import {
  HardDriveDownload,
  Terminal,
  CheckCircle,
  FolderGit2,
  Cpu,
  Layers,
  Copy,
  Check,
  Shield,
  FileCode,
} from 'lucide-react';

export const DeploymentGuidePage: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const publishScript = `# ========================================================
# QuickBilling Windows x64 Distribution Build Script
# Run from PowerShell in the solution root directory
# ========================================================
$ErrorActionPreference = "Stop"

Write-Host ">>> [1/5] Building React Vite Frontend..." -ForegroundColor Cyan
cd frontend
npm install
npm run build
cd ..

Write-Host ">>> [2/5] Copying web assets to ASP.NET Core wwwroot..." -ForegroundColor Cyan
$wwwrootPath = "src/QuickBilling.Api/wwwroot"
if (Test-Path $wwwrootPath) { Remove-Item -Recurse -Force $wwwrootPath }
New-Item -ItemType Directory -Path $wwwrootPath -Force
Copy-Item -Recurse -Force frontend/dist/* $wwwrootPath

Write-Host ">>> [3/5] Publishing self-contained ASP.NET Core x64 backend..." -ForegroundColor Cyan
dotnet publish src/QuickBilling.Api/QuickBilling.Api.csproj \`
  -c Release \`
  -r win-x64 \`
  --self-contained true \`
  -p:PublishSingleFile=true \`
  -p:IncludeNativeLibrariesForSelfExtract=true \`
  -o dist/publish-win64

Write-Host ">>> [4/5] Compiling Inno Setup Installer..." -ForegroundColor Cyan
$isccPath = "\${env:ProgramFiles(x86)}\\Inno Setup 6\\ISCC.exe"
if (Test-Path $isccPath) {
  & $isccPath installer/installer.iss
  Write-Host ">>> SUCCESS: QuickBilling-Setup.exe generated in installer/output!" -ForegroundColor Green
} else {
  Write-Host ">>> Inno Setup compiler ISCC.exe not found at $isccPath." -ForegroundColor Yellow
  Write-Host ">>> You can open installer/installer.iss inside Inno Setup IDE and click Build!" -ForegroundColor Yellow
}
`;

  const innoScript = `[Setup]
AppId={{8B41FE1D-8973-455E-A79B-6F6C7B901C92}
AppName=QuickBilling POS
AppVersion=1.0.0
AppPublisher=Retail Solutions Ltd.
DefaultDirName={autopf}\\QuickBilling
DefaultGroupName=QuickBilling
UninstallDisplayIcon={app}\\QuickBilling.Api.exe
Compression=lzma2/max
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64
OutputDir=output
OutputBaseFilename=QuickBilling-Setup

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "..\\dist\\publish-win64\\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\\QuickBilling POS"; Filename: "{app}\\QuickBilling.Api.exe"
Name: "{group}\\{cm:UninstallProgram,QuickBilling POS}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\\QuickBilling POS"; Filename: "{app}\\QuickBilling.Api.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\\QuickBilling.Api.exe"; Description: "{cm:LaunchProgram,QuickBilling POS}"; Flags: nowait postinstall skipifsilent

; IMPORTANT: User data stored at %LOCALAPPDATA%\\QuickBilling\\quickbilling.db is PRESERVED on upgrade/uninstall!
`;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Windows Desktop Packaging & Inno Setup
        </h1>
        <p className="text-xs text-slate-600">
          Complete self-contained offline deployment specifications for Windows 10/11 64-bit systems
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h4 className="text-xs font-bold text-slate-900">100% Offline Runtime</h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Target Windows computers do NOT require Node.js, npm, or the .NET SDK installed. The self-contained build packages the .NET runtime with the application.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h4 className="text-xs font-bold text-slate-900">Protected Local Database</h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            SQLite database is automatically created at <code className="text-emerald-700 bg-slate-100 px-1 py-0.5 rounded text-[10px]">%LOCALAPPDATA%\QuickBilling\quickbilling.db</code>. Upgrades or reinstalls never wipe user sales!
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h4 className="text-xs font-bold text-slate-900">Inno Setup .exe Installer</h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Creates standard Windows Start Menu shortcuts, optional Desktop icon, and a clean Windows Control Panel uninstaller.
          </p>
        </div>
      </div>

      {/* Script 1: PowerShell Publish */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">
              Build Script: <code className="text-emerald-700">scripts/publish-windows.ps1</code>
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(publishScript, 1)}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
          >
            {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedIndex === 1 ? 'Copied' : 'Copy PowerShell'}</span>
          </button>
        </div>

        <pre className="p-3 bg-slate-900 text-slate-200 text-[11px] font-mono rounded-xl overflow-x-auto leading-relaxed">
          {publishScript}
        </pre>
      </div>

      {/* Script 2: Inno Setup Configuration */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900">
              Inno Setup Compiler Script: <code className="text-indigo-700">installer/installer.iss</code>
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(innoScript, 2)}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
          >
            {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedIndex === 2 ? 'Copied' : 'Copy Inno ISS'}</span>
          </button>
        </div>

        <pre className="p-3 bg-slate-900 text-slate-200 text-[11px] font-mono rounded-xl overflow-x-auto leading-relaxed">
          {innoScript}
        </pre>
      </div>

      {/* Offline Clean Machine Checklist */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-900">
            Offline Clean-Machine Verification Checklist
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
          <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Install on a fresh Windows 10/11 64-bit PC with Wi-Fi / Ethernet disconnected.</span>
          </label>
          <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Launch via Start Menu or Desktop shortcut. The UI opens locally in loopback (127.0.0.1).</span>
          </label>
          <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Ring up an order: verify stock is subtracted, invoice number increments, and receipt prints.</span>
          </label>
          <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Cancel a sale: verify stock restores exactly once and the transaction marks as cancelled.</span>
          </label>
          <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Export Excel: verify authentic 4-sheet .xlsx file downloads without internet.</span>
          </label>
          <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Reboot computer: restart app and confirm all historical sales and inventory persist intact.</span>
          </label>
        </div>
      </div>
    </div>
  );
};
