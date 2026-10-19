---
title: Pointers
description: Take an address, read through a pointer, access fields and move pointers by bytes.
order: 3
---

Mox has raw pointers, like C. There is no garbage collector.

## Taking an address and reading

`.^` takes a pointer. `.*` reads the value it points to.

```mox
struct MyStruct {
    x: i32;
};

fn pointers() {
    s : MyStruct = 0;

    p : *MyStruct = s.^;  // like &s in C
    px := s.x.^;          // like &s.x in C

    copy : MyStruct = p.*; // like *p in C
}
```

## Fields through a pointer

You do not need a special operator. Use `.` like with a normal value:

```mox
x : i32 = p.x; // like p->x in C
p.x = 10;
```

## Null pointer

Like any other type, a pointer can be set to `0`. This makes it null:

```mox
p : *u8 = 0; // null
```

When there is no type to infer from, use the `nullptr` function. It makes a null pointer of the given type:

```mox
p := nullptr(u8); // *u8 that is null
```

## Moving a pointer

There is no `p + 1` for pointers. Use these helpers from the standard modules:

```mox
p : *i32 = ...;

p2 := byte_offset(p, 8); // 8 bytes forward
p3 := type_offset(p, 2);   // 2 items forward, 2 * 4 bytes for i32

p2 == p3; // true
```

They read well with the pipe operator:

```mox
p2 = p |> byte_offset(8);
p3 = p |> type_offset(2);
```

## Pointer to a slice

`slice(ptr, len)` makes a slice from a pointer and a length:

```mox
buf : *u8 = ...;
s := slice(buf, 1024);
s.ptr == buf;
s.len == 1024;
```

To learn how to get memory, see [Allocators](/tutorials/memory/allocators/).
