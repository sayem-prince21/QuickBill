# QuickBilling Windows Deployment & Installer Guide

This directory contains the Inno Setup script used to package QuickBilling into a standalone Windows Setup `.exe` installer.

## Prerequisites on the Build Machine

To build the final `QuickBilling-Setup.exe`, your development workstation requires:
1. **Windows 10 or 11 (64-bit)**
2. **Node.js 18+ & npm**
3. **.NET 8.0 SDK** (https://dotnet.microsoft.com/download/dotnet/8.0)
4. **Inno Setup 6** (Free open-source Windows installer builder: https://jrsoftware.org/isinfo.php)

*(Note: Target end-user computers do **NOT** need any of these tools. The installed `.exe` is completely self-contained with its own bundled runtime and database engine).*

## How to Build the Installer in One Step

1. Open PowerShell in the project root directory.
2. Execute the automated publishing script:
   ```powershell
   .\scripts\publish-windows.ps1
   ```
3. When the script completes, your installer is generated at:
   ```
   installer\output\QuickBilling-Setup.exe
   ```

## User Data Preservation Guarantee

The SQLite database file is stored outside the application installation folder at:
```
%LOCALAPPDATA%\QuickBilling\quickbilling.db
```
When a user updates to a new version of QuickBilling or uninstalls and reinstalls the application, their existing products, inventory counts, sales register, and settings are **never deleted or overwritten**.
