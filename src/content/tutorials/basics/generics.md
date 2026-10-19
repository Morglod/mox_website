---
title: Generics
description: Write functions and structs that work for many types, using compile time parameters.
order: 7
---

Think of generics as templates. A generic parameter is a value that is known at compile time. For each new value, the compiler makes a new copy of the function or struct.

## Compile time parameters

A parameter whose name starts with `$` is known at compile time. Inside the function it works like a constant.

When its type is `__type_ptr`, it holds a type:

```mox
fn max($T: __type_ptr, a: $T, b: $T): $T {
    if (a > b) { return a; }
    return b;
}

fn main() {
    i := max(i32, 1, 2);
    f := max(f32, 1.0f, 2.5f);
}
```

A generic function must always have its return type written.

Any type can be used for a `$` parameter, not only types:

```mox
fn repeat_print(x: i64, $count: i64): void {
    // $count is a constant here
}
```

## Generic structs

```mox
struct Buffer($T: __type_ptr, $size: i64) {
    items: [$size]$T;
    used: i64;
};

b : Buffer(i32, 10) = 0;
```

## Finding parameters from the argument

The compiler can find `$` parameters from the type of an argument. Here `$T` and `$SIZE` come from what you pass:

```mox
fn capacity(b: *Buffer($T, $SIZE)): i64 {
    return $SIZE;
}

b : Buffer(i32, 10) = 0;
capacity(b.^); // 10
```

You can also capture the whole type with `$Name / pattern`:

```mox
fn same(x: $PtrT / *Buffer($T, $SIZE), y: $PtrT): $PtrT {
    return x;
}
```

Here `$PtrT` is the full type `*Buffer(...)`, and `y` must have the same type.

## Types are values

A type is a value of type `__type_ptr`. You can store it in a constant and pass it around:

```mox
const T : __type_ptr = i32;
x := max(T, 1, 2);
```

Sometimes the compiler reads a type as an expression and gets confused. Wrap it with `#type`:

```mox
const ptr_type := #type *u8;
```

## Reading type info

A `__type_ptr` can be cast to `*MoxType` to read type info, like its size:

```mox
#linkc fn malloc(size: u64): *u8;

fn alloc($T: __type_ptr): *$T {
    const size := $T.cast(*MoxType).size;
    return malloc(size).cast(*$T);
}

x : *i32 = alloc(i32);
```

## Overloading and generics together

Generics, overloading and default arguments work together. You can have one normal version of a function and one generic version with the same name. The compiler picks the best match.
