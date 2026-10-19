---
title: Functions
description: Declare functions, use default arguments, overloading, function pointers and C functions.
order: 5
---

## Declaring a function

```mox
fn add(a: i32, b: f32): f32 {
    return a.cast(f32) + b;
}
```

The return type comes after `:`. If there is none, the function returns `void`.

## Default arguments

```mox
fn add(a: i32, b: f32 = 123): f32 {
    return a.cast(f32) + b;
}

add(1);      // b is 123
add(1, 2.0f);
```

## Functions inside functions

You can declare a function inside another one. It is only visible there:

```mox
fn outer() {
    fn helper(): i32 { return 1; }
    x := helper();
}
```

There is no closures or lambdas in Mox, so inner function does not see variables of outer function.

## Overloading

Functions can have the same name with different arguments:

```mox
fn show(x: i32) {}
fn show(x: f32) {}

fn main() {
    x : i32 = 0;
    show(x); // calls the i32 version
}
```

The compiler picks the best match among the functions it can see from the call. If a module with the right version is not imported, the compiler will not find it.

## Function pointers

A function pointer type is written as `*fn (args): result`:

```mox
struct Command {
    name: []u8;
    run: *fn (x: i32): i32;
}

fn double(x: i32): i32 { return x * 2; }

cmd := Command.{ name = "double", run = double };
cmd.run(3); // 6
```

## Calling C functions

`#linkc` declares a function from C. Write only the signature:

```mox
#linkc fn puts(str: *u8): void;

puts("hello");
```

If you want a different name in Mox, put the C name in brackets:

```mox
#linkc("puts") fn libc_puts(str: *u8): void;
```

`#linkc` on a function with a body gives it a C name, so C code can call it. That is why `main` is written like this:

```mox
#linkc fn main(): i32 {
    return 0;
}
```

## Caller location

A parameter with the default value `#caller_location` gets the place in the source where the function was called. Useful for logs and asserts:

```mox
fn log_here(loc: MoxSourceLocation = #caller_location) {
    path := get_source_location_file_path(loc);
}
```

The file path is only there if you build with `embed_source_paths=true` (or `-g`).
