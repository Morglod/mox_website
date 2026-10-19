---
title: Linking
description: How Mox calls the linker, how to use your own linker, and how to link libraries from code.
order: 4
---

Mox compiles your code to an `.obj` file. An outside linker turns it into an executable. This page shows how that works and how to change it.

## The default linker command

The default is:

```bash
linker="clang -o :MOX_LINKER_OUT:"
```

So when you run:

```bash
mox ./example.mox
```

the compiler builds `example.mox.obj` and then runs:

```bash
clang -o ./example.mox.exe ./example.mox.obj
```

The compiler adds the `.obj` file and any libraries to the end of the command. It expects the linker to add the C runtime by itself, and clang does.

## Use another linker

Pass your own command:

```bash
mox ./example.mox linker="g++ -o :MOX_LINKER_OUT:"
```

## Link by hand

Turn the linker off. The compiler will only write the `.obj` file:

```bash
mox ./example.mox linker=false
```

Then link it with any tool you like.

## Link libraries from code

You can add to the linker command from Mox code. This runs at compile time with `#run` (more about it in [Compile time](/tutorials/comptime/run/)).

`__compiler_link_lib` adds a library with `-l`. Write the name without `.a`, `.lib`, `.dll` or `.so`:

```mox
#run __compiler_link_lib("user32", false);
```

The linker command becomes:

```bash
clang -o ./example.mox.exe ./example.mox.obj -luser32
```

If the second argument is `true`, the compiler loads the library into itself. Then you can call its functions at compile time. See [Build scripts in code](/tutorials/comptime/build-config/).

`__compiler_append_linker` adds any text to the command:

```mox
#run __compiler_append_linker("-passed_from_comptime");
```

## Problems on Windows

If you installed clang by hand, you also need the Windows SDK and VC Tools. They come with Visual Studio.

If you get a strange linker error:

1. Build with `linker=false` and try to link the `.obj` file by hand first.
2. If MSVC clang can not find system libraries, run it from the `x64 Native Tools Command Prompt`, or run `vcvarsall.bat x64` first.
3. You can also give the paths by hand:

   ```bash
   clang.exe -o ./app.exe ./app.mox.obj -luser32 "-Wl,/vctoolsdir:C:/Program Files (x86)/Microsoft Visual Studio/2017/Community/VC/Tools/MSVC/14.16.27023/" "-Wl,/winsdkdir:C:/Program Files (x86)/Windows Kits/10/"
   ```

4. Or install MSYS2 clang, see [Setup](/tutorials/getting-started/setup/).

With MSVC clang, always pass `llvm_target_triple="x86_64-pc-windows-msvc"` to the compiler.
