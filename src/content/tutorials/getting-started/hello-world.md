---
title: Hello world
description: Write, build and run your first Mox program.
order: 2
---

This is the smallest Mox program that prints something. Make sure you did the [setup](/tutorials/getting-started/setup/) first.

## The program

Save this as `hello.mox`:

```mox
import "std.mox";

#linkc fn main(): i32 {
    println("hello {}!", .{ "world" });
    return 0;
}
```

Line by line:

- `import "std.mox";` loads the standard module. It has `println` and many other helpers.
- `#linkc` gives the function a plain C name. The C runtime calls `main`, so it must have a C name.
- `println` prints a line. Each `{}` in the text is replaced with the next value from the list `.{ ... }`.

## Build and run

Pass the file to the compiler:

```bash
mox ./hello.mox
```

The compiler makes `hello.mox.obj`, then calls clang to link it into `hello.mox.exe`. Run it:

```bash
./hello.mox.exe
```

It prints `hello world!`.

To choose the output name and turn on optimizations:

```bash
mox ./hello.mox -O3 -o=./hello
```

## Comments

```mox
// one line comment

/* comment
   on many lines */
```

Next: [Compiler options](/tutorials/getting-started/compiler-options/).
