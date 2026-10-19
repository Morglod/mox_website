---
title: Compiler options
description: Pick a backend, turn on optimizations and debug info, and set output paths.
order: 3
---

Run `mox help` to see every option. This page covers the ones you will use most.

Most options are written as `name=value`. A few short flags (`-O3`, `-g`, `-o`) work like in other compilers.

## Backends

Mox has three backends:

- `jit` - the default. A fast x86_64 backend. Good while you develop.
- `llvm` - slower to compile, makes faster code. Can target other platforms.
- `c` - outputs C source code.

Pick one with `backend=`:

```bash
mox ./hello.mox backend=llvm
```

## Optimizations

- `-O0` uses the jit backend.
- `-O1`, `-O2`, `-O3` use LLVM with that optimization level.

```bash
mox ./hello.mox -O3
```

## Debug info

`-g` writes DWARF debug info, so you can use a debugger. It also turns on `embed_source_paths=true`.

```bash
mox ./hello.mox -g
```

## Output paths

- `-o=path` sets the path of the final executable.
- `out=path` sets the path of the compiler output (the `.obj` file, LLVM IR or C source).

```bash
mox ./hello.mox -o=./build/hello
```

## Other useful options

- `compile="./hello.mox"` - another way to pass the main file.
- `linker=...` - the linker command. See [Linking](/tutorials/getting-started/linking/).
- `llvm_target_triple=...` - target for the LLVM backend, for example `x86_64-pc-windows-msvc`.
- `llvm_out_format=obj|ir|asm|bitcode` - what LLVM writes.
- `modules_dir=...` - where to look for modules. By default it is the `modules` folder next to the compiler.

## Placeholders

Some options can use placeholders. The compiler replaces them:

- `:MOX_LINKER_OUT:` - the executable path (from `-o`, or the main file name + `.exe`)
- `:MOX_COMPILER_DIR:` - the folder of the compiler
- `:MOX_COMPILE_ROOT_DIR:` - the folder of the main file
- `:MOX_WORKING_DIR:` - the current folder
- `:MOX_COMPILER_OUT:` - the compiler output path
