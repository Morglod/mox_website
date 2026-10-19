---
title: Variables and types
description: Declare variables, use the basic types, structs, enums, arrays, slices and strings.
order: 1
---

## Declaring variables

A variable is written as `name : type = value`:

```mox
count : i32 = 0;
```

If you skip the type, it comes from the value:

```mox
other := count; // other is i32
```

Every variable must have a initial value. This is an error:

```mox
x : i32; // compile error
```

## Basic types

- signed integers: `i8`, `i16`, `i32`, `i64`, `i128`
- unsigned integers: `u8`, `u16`, `u32`, `u64`, `u128`
- floats: `f32`, `f64`
- `bool`
- `void`

A number can have its type at the end:

```mox
a := 123i32;
b := 10u64;
c := 1.5f; // f32
```

A number without a type is a compile time number. Math on such numbers is done by the compiler. When it is stored into a real type, the compiler checks that the value fits without loss.

## Zero and garbage

`0` sets any value to zeros (zeroing memory):

```mox
s : MyStruct = 0;
```

If you really want to skip the initial value (for speed), say it out loud with `#memory_garbage`:

```mox
s : MyStruct = #memory_garbage;
```

Mox follows idea of ZII - Zero Is Initialization. So better design your data in a way that zero is a valid default state.

## Structs

```mox
struct MyStruct {
    x: i32;
};
```

The memory layout of a struct is the same as in C.

Struct values are written with `.{ }`. Fields can be named. Use `,` or `;` between them:

```mox
a : MyStruct = .{ x = 123 };
b := MyStruct.{ x = 123, };
b = .{ x = 123; };
```

Fields could also come just in order:

```mox
b := MyStruct.{ 123 };
```

When the type is known, you can write just `.{ ... }`. Otherwise put the type in front: `MyStruct.{ ... }`.

## Enums

```mox
enum Direction {
    Left;
    Right;
};

enum Flags : u8 {
    A := 0;
    B := 2;
};

d := Direction.Right;
d : Direction = .Right; // same as Direction.Right
```

By default an enum uses the smallest integer type that fits all values. You can set it with `: u8` and set values with `:=`.

## Arrays

An array holds its items inside itself. When you copy an array, all items are copied.

```mox
a : [3]i32 = .{ 1, 2, 3 };    // fixed size
b : [?]i32 = .{ 0, 1, 2, 3 }; // size comes from the value
```

`a.ptr` gives a pointer to the first item.  
`a.len` gives length of an array.

It is "synthetic" fields that works as operators, in memory only items are stored for fixed arrays.

## Slices

A slice is a pointer and a length, like `struct { ptr: *T; len: i64; }`. When you copy a slice, only the pointer and length are copied, not the items.

```mox
s : []i32 = ...;
s.ptr; // pointer to first item
s.len; // number of items
s[0];  // first item
```

## Strings

A string literal can be one of two things, based on the type:

```mox
a : []u8 = "a slice of u8";            // slice to constant memory
b : *u8 = "a C string, ends with zero"; // C string
```

Most Mox code uses `[]u8`. Use `*u8` when you call C functions.

String literals are null terminated but Mox code relies on string slices without null termination.  
In case you need to pass string to some C API that expects null terminated string, use `#temp_c_string`.

## Constants

```mox
const SIZE : i64 = 10;
const NAME := "mox";
```

A constant is known at compile time.

Any initial value or expression for constants are evaluated at compile time.

## Global variables

A variable declared outside of functions is global. Its initial value is also evaluated at compile time, the same way as for `const`. The result is stored in the program, so no code runs for it at start:

```mox
TABLE_SIZE : i64 = 16 * 1024;
greeting : []u8 = "hello";
```

Unlike a constant, a global can be changed while the program runs.

## Two special types

Mox has two more built-in types. They are used for compile time code:

- `__type_ptr` - a type as a value. Every type in Mox is a `__type_ptr`.
- `__ast_ptr` - a piece of code as a value.

You will see them in [Generics](/tutorials/basics/generics/) and [Code generation](/tutorials/comptime/code-generation/).
