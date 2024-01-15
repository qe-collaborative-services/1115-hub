# Dependencies

## Runtime (Deployment) Dependencies

All dependencies are cross-platform, open source with permissive licenses so
that developers and data analysts do not need to procure or purchase any tools.

- Download
  [Deno](https://docs.deno.com/runtime/manual/getting_started/installation)
  Javascript runtime and put it in your `PATH`.
- Download [DuckDB](https://duckdb.org/docs/installation) 0.9+ for data
  orchestration operations and put it in your `PATH`.
- Download [SQLite](https://www.sqlite.org/download.html) embedded database and
  put it in your `PATH`.
- Download [SQLPage](https://github.com/lovasoa/SQLpage/releases) SQL browser,
  call it `sqlpage` on Linux/MacOS (not the default `sqlpage.bin`) or
  `sqlpage.exe` on Windows and put it in your `PATH`.
  - SQLPage is not strictly required but highly recommended for easier
    diagnostics. See _Manage GitHub binaries with `eget`_ for an easy way to
    manage GitHub binaries.

The utilities mentioned above are cross-platform single-file binaries and will
run on Windows, MacOS, or Linux. Please be sure to get the proper binaries for
your platform.

You can run `deno task doctor` (see below) to see if dependencies are installed
properly.

### Manage GitHub binaries with `eget`

A good way to get binaries from GitHub (e.g. SQLPage, et. al.) you should
download and use [eget](https://github.com/zyedidia/eget/releases).

1. Create a directory called `D:\bin` or `C:\Program Files\qe-cs` (or anywhere
   you want), grab the `eget.exe` binary and store it in `D:\bin`.
2. Add `D:\bin` or `C:\Program Files\qe-cs` (or whatever you created in step #1)
   to your `PATH`.
3. Create an `D:\bin\eget.toml` file (or `C:\Program Files\qe-cs\eget.toml`) and
   add the following content. Be sure to set `target = "X"` where X is either
   `D:\\bin` or `C:\\Program Files\\qe-cs` (or whatever you created in step #1).

```toml
[global]
target = "D:\\bin"    

["lovasoa/SQLpage"]
```

4. CD into `D:\bin` (or `C:\\Program Files\\qe-cs` or whatever you created in
   step #1) and run `eget /D` to download all required binaries.

## Use Windows Sandbox for Safe Evaluation

### Install Windows Store and `winget` in Sandbox First

Right-click on Windows icon, start "Windows Powershell (Admin)" session and do
the following to install Microsoft Store in the Sandbox:

```psh
Set-ExecutionPolicy Bypass -Scope Process -Force
$url="https://github.com/bonben365/add-store-win-sandbox/raw/main/install.ps1"
iex ((New-Object System.Net.WebClient).DownloadString($url))
```

Now install the Windows Package Manager (`winget`) in Sandbox using
[these instructions](https://learn.microsoft.com/en-us/windows/package-manager/winget/#install-winget-on-windows-sandbox).

Exit the current "Windows Powershell (Admin)" session restart another "Windows
Powershell (Admin)" session then proceed.

### Install PowerShell 7+ and Windows Terminal

```psh
winget install Microsoft.Powershell
```

Exit the current "Windows Powershell (Admin)" session (close the window).

Click on Windows icon, start "Microsoft Store", search for "Windows Terminal"
and install it.

Launch Windows Terminal and proceed with "Quick start (Windows)" section in
[README.md](../../README.md).
