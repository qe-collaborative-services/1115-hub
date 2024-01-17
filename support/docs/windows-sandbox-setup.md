# Windows Sandbox Tips

You can use _Windows Sandbox_ for safe evaluation of this codebase.

## Install Windows Store and `winget` in Sandbox First

Right-click on Windows icon, start "Windows Powershell (Admin)" session and do
the following to install Microsoft Store in the Sandbox:

```psh
Set-ExecutionPolicy Bypass -Scope Process -Force
$url="https://github.com/bonben365/add-store-win-sandbox/raw/main/install.ps1"
iex ((New-Object System.Net.WebClient).DownloadString($url))
```

Exit the current "Windows Powershell (Admin)" session restart another "Windows
Powershell (Admin)" session then proceed to install the Windows Package Manager
(`winget`) in Sandbox using
[these instructions](https://learn.microsoft.com/en-us/windows/package-manager/winget/#install-winget-on-windows-sandbox).

Exit the current "Windows Powershell (Admin)" session restart another "Windows
Powershell (Admin)" session then proceed.

## Install PowerShell 7+ and Windows Terminal

```psh
winget install Microsoft.Powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```

Exit the current "Windows Powershell (Admin)" session (close the window).

Click on Windows icon, start "Microsoft Store", search for "Windows Terminal"
and install it. This should work using
`winget install Microsoft.WindowsTerminal` but as of 01-16-2024 the `winget`
approach is not working so just use "Microsoft Store" installer.

Launch Windows Terminal and proceed with "Quick start (Windows)" section in
[README.md](../../README.md).
