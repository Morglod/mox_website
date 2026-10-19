---
layout: ../layouts/Page.astro
title: Download - Mox programming language
description: Download the Mox programming language compiler for Windows and Linux x86_64.
---

# Download

One zip contains the compiler for Windows and Linux and the base modules.

[0.2.0 Windows/Linux](https://github.com/Morglod/mox/releases/download/0.2.0/mox_020_191026.zip)

[Latest release on GitHub](https://github.com/Morglod/mox/releases/latest)

Older versions are on the [releases page](https://github.com/Morglod/mox/releases).

## Setup

Keep the compiler executable next to the `modules` folder.

Mox has no linker of its own. By default it calls clang, so clang should be installed.

On Linux:

```bash
sudo apt install clang
```

On Windows, install clang with MSYS2 or MSVC. See [prerequisites](https://github.com/Morglod/mox/blob/master/docs/1_prerequisites.md) for details.

PS: clang is just the default. Any linker works — lld, ld, link.exe, mold. See [docs/linker.md](https://github.com/Morglod/mox/blob/master/docs/linker.md).

## Run

```bash
mox help
mox ./hello.mox
mox ./hello.mox -O3 -o=./hello
mox compile="./hello.mox" backend=llvm
mox ./hello.mox linker=false
```
