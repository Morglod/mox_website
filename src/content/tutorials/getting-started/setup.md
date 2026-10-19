---
title: Setup and prerequisites
description: Download the Mox compiler, install clang on Linux or Windows, and check that everything works.
order: 1
---

Before you write any code, you need two things: the Mox compiler and a linker. This page shows how to get both.

## Download the compiler

Get the latest zip from [GitHub releases](https://github.com/Morglod/mox/releases/latest). One zip has the compiler for Windows and Linux (x86_64) and the base modules.

Unpack it anywhere. Keep the compiler executable in the same folder as the `modules` folder. The compiler looks for modules next to itself.

You can add this folder to your `PATH`, so you can type `mox` from any place.

## Why you need a linker

Mox does not have its own linker. It compiles your code to an `.obj` file, then calls an outside linker to make an executable.

By default this linker is `clang`. You can use another one, see [Linking](/tutorials/getting-started/linking/).

## Linux

Install clang:

```bash
sudo apt update
sudo apt install clang
```

If you see a `version GLIBCXX_* not found` error, update libstdc++:

```bash
sudo apt-get update
sudo apt-get install --only-upgrade libstdc++6
```

Some prebuilt libraries in `modules/vendor` need a newer `glibc`. The simplest fix is to update your system. You can also build those libraries yourself.

## Windows

On Windows you need clang and the system libraries it links with. There are two ways.

### Option 1: MSYS2 (recommended)

This uses MinGW clang from MSYS2.

With the script: press Win+R, type `powershell.exe -ExecutionPolicy Bypass` and press Enter. Go to the Mox folder and run:

```bash
tools/install_windows_msys2.ps1
```

Or by hand, in PowerShell:

```bash
winget install MSYS2.MSYS2 --silent --accept-package-agreements; & "C:\msys64\msys2_shell.cmd" -defterm -no-start -ucrt64 -c "pacman -S --noconfirm mingw-w64-ucrt-x86_64-clang"
```

Then add `C:\msys64\ucrt64\bin` to your `PATH`.

### Option 2: MSVC clang

This is slower to install and uses Visual Studio Build Tools.

With the script: press Win+R, type `powershell.exe -ExecutionPolicy Bypass` and press Enter. Go to the Mox folder and run:

```bash
tools/install_windows_msvc.ps1
```

Or by hand:

```bash
winget install Microsoft.VisualStudio.BuildTools --override "--passive --wait --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 --add Microsoft.VisualStudio.Component.Windows11SDK.22621 --add Microsoft.VisualStudio.Component.VC.Llvm.Clang"
```

With this option, two things are important:

- Always build from the `x64 Native Tools Command Prompt` (find it in the Start menu). Or run `vcvars64.bat` first, it is in `C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\VC\Auxiliary\Build\`.
- Always pass `llvm_target_triple="x86_64-pc-windows-msvc"` to the compiler.

## Check that it works

Run:

```bash
mox help
```

It prints the compiler version and all options. If you see this list, the compiler is ready. Next: [Hello world](/tutorials/getting-started/hello-world/).
