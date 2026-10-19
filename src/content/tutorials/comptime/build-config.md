---
title: Build scripts in code
description: Read env variables, run shell commands, use #if, and build and call a C library while compiling.
order: 2
---

Mox has no separate build system. The build logic is normal Mox code that runs at compile time. This page follows `examples/3_comptime.mox`.

## Bake the git hash

`os_exec_output` runs a command and returns what it printed. With `#run` this happens while compiling, so the hash is stored in the program:

```mox
import "std.mox";

fn print_version() {
    git_hash := #run os_exec_output("git rev-parse HEAD");
    println(git_hash);
}
```

## Build flags from env variables

```mox
USE_FOO := #run os_get_env("USE_FOO") == "true";

#run {
    println("USE_FOO = {}", .{ USE_FOO; });
}
```

## Conditional compilation with #if

`#if` checks a compile time value. The branch that is not taken is not compiled at all:

```mox
fn foo() {
    #if (USE_FOO) {
        println("foo");
    } else {
        println("not foo");
    }
}
```

You can chain it: `#if (a) { } else #if (b) { }`.

To check the OS, use `MOX_OS`:

```mox
#if (MOX_OS == .Windows) {
    // windows only code
}
```

## Build a C library and call it at compile time

This is the fun part. While compiling, the code below:

1. builds a small C library with clang,
2. loads it into the compiler,
3. copies it next to the final program,
4. calls its function at compile time.

```mox
import "std.mox";
import "build.mox";

// the C function we will build
#linkc fn comptime_example(a: i32, b: i32): i32;

#run {
    if (MOX_OS == .Windows) {
        os_exec("echo __declspec(dllexport) int comptime_example(int a, int b) { return a + b; } | clang -x c - -shared -o comptime_example.dll");
        __compiler_link_lib("comptime_example.dll", true);
        build_copy_to_output("./comptime_example.dll");
    } else {
        os_exec("echo 'int comptime_example(int a, int b) { return a + b; }' | clang -x c - -shared -o comptime_example.so");
        __compiler_link_lib("comptime_example.so", true);
        build_copy_to_output("./comptime_example.so");
    }
    println("comptime_example(10, 20) = {}", .{ comptime_example(10, 20) });
}
```

`__compiler_link_lib(path, true)` loads the library into the compiler.  
So `comptime_example` can be called right away inside `#run`.

`build_copy_to_output` from `build.mox` copies a file next to the output executable.
