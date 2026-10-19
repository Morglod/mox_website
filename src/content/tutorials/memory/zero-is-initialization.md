---
title: Zero is initialization
description: Design types so that all-zero memory is a valid, ready to use value. No constructors needed.
order: 1
---

ZII means "Zero Is Initialization". The idea is simple: when all bytes of a value are zero, the value is already valid and ready to use. You do not need a constructor or an init function.

Mox does not have constructors, so ZII is the main way to make values that are easy and safe to create.

## Zero works for every type

`= 0` sets every byte of a value to zero. It works for any type:

```mox
count : i32 = 0;        // 0
done : bool = 0;        // false
name : []u8 = 0;        // empty slice, len is 0
ptr : *u8 = 0;          // null pointer
pos : [2]f32 = 0;       // { 0, 0 }
player : Player = 0;    // all fields are zero
```

You can also reset a value back to zero later:

```mox
player = 0;
```

## Why it is useful

- **Less code.** Make a value with `= 0` and use it. No `init` call to forget.
- **Fast.** Zeroing memory is one of the fastest things a computer can do. Memory you get from the OS is often zero already.
- **Easy reset.** `x = 0` puts any value back to its start state. This works for one value or a whole array of thousands.
- **Fewer bugs.** A zero value is always the same, so there are no random values from old memory.

## Designing types for ZII

ZII does not happen by itself. You design your types so that zero means something good. Some simple rules:

### Zero means "empty" or "none"

A length of `0` is an empty list. A null pointer means "there is nothing here":

```mox
struct Player {
    name: []u8;
    hp: i32;
    target: *Player; // null = no target
};

p : Player = 0;
if (p.target == 0) {
    // no target yet
}
```

### Put the default enum value first

The first enum value is `0`. Make it the default or "none" state:

```mox
enum State {
    Idle;    // 0, the default
    Running;
    Done;
};
```

### Name bools so false is the default

`false` is zero. So name a bool for the less common case:

```mox
struct Entity {
    is_deleted: bool;   // zero = alive, good
    // is_alive: bool;  // zero = dead, bad default
};
```

### Start ids from 1

If you use numbers as ids or handles, keep `0` for "no id". Real ids start from `1`:

```mox
struct Entity {
    id: u32;     // 0 = not created yet
    parent: u32; // 0 = no parent
};
```

### Set things up on first use

If a type needs something that zero can not give, set it up when it is first needed. Here a zero `IntList` gets its allocator on the first push:

```mox
struct IntList {
    items: *i64;
    len: i64;
    cap: i64;
    alloc: *Alloc;
};

fn list_push(list: *IntList, value: i64) {
    if (list.alloc == 0) {
        list.alloc = get_context_alloc();
    }
    if (list.len == list.cap) {
        new_cap := max(list.cap * 2, 8);
        if (list.items == 0) {
            list.items = mem_alloc(list.alloc, new_cap * 8, 8).cast(*i64);
        } else {
            list.items = mem_realloc(list.alloc, list.items, new_cap * 8);
        }
        list.cap = new_cap;
    }
    type_offset(list.items, list.len).* = value;
    list.len += 1;
}

fn list_free(list: *IntList) {
    if (list.items == 0) { return; }
    mem_free(list.alloc, list.items);
    list.* = 0; // back to empty, safe to use again
}
```

Using it needs no init at all:

```mox
list : IntList = 0;
list_push(list.^, 5);
list_push(list.^, 7);
list_free(list.^);
list_free(list.^); // freeing twice is fine too
```

### Functions accept zero values

Functions that read a value should work on a zero value too. For example, the length of a zero list is `0`, and freeing a zero list does nothing.

## Zero in the standard library

`DynArr` from the standard library follows this in part. A zero `DynArr` is a valid empty array:

```mox
arr : DynArr(i64) = 0;
arr.len;          // 0
arr.items;        // empty slice
dynarr_free(arr.^); // does nothing
```

But it needs an allocator before you add items, so call `dynarr_init` before `push`. See [Allocators](/tutorials/memory/allocators/).

## Setting only some fields

A struct literal must list all fields. To set only a few, start from zero and then set them:

```mox
p : Player = 0;
p.hp = 100;
```

## Zeroing allocated memory

Memory from `mem_alloc` is not zeroed. Zero it yourself:

```mox
p := mem_alloc(alloc, Player);
p.* = 0;
// or: mem_zero(p);
```

## When not to zero

If you are going to fill a big buffer anyway, zeroing it first is wasted work. Use `#memory_garbage` to skip it:

```mox
buf : [4096]u8 = #memory_garbage;
```

Only do this when you are sure every byte will be written before it is read.
