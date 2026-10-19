---
title: Allocators
description: Allocate and free memory with allocators, and swap the allocator for code you call.
order: 2
---

Mox has no garbage collector and no destructors. You get memory and free it yourself. Because memory is just bytes, you can reuse the same memory for different types.

The standard library gets memory from allocators and [arenas](/tutorials/memory/arenas/).

## The current allocator

Each thread has a current allocator. Get it with `get_context_alloc()`. The default one is created the first time you ask for it.

```mox
alloc := get_context_alloc();
```

## Allocate and free

```mox
alloc := get_context_alloc();

// one i64
ptr : *i64 = mem_alloc(alloc, i64);
defer mem_free(alloc, ptr);

// 512 bytes
buf_mem : *u8 = mem_alloc(alloc, 512);
defer mem_free(alloc, buf_mem);

// slice of 512 u8 items
buf : []u8 = mem_alloc_slice(alloc, u8, 512);
defer mem_free(alloc, buf);
```

`mem_alloc` takes a type or a size in bytes. `defer` right after the allocation makes sure the memory is freed at the end of the scope.

## Grow memory

```mox
buf_mem = mem_realloc(alloc, buf_mem, 1024);
buf = mem_realloc_slice(alloc, buf, 1024);
```

## Containers keep their allocator

Every container remembers the allocator it was made with. For example, `DynArr` (a growing array):

```mox
struct DynArr($T: __type_ptr) {
    storage: *DynArrStorage($T);
    alloc: *Alloc;
};
```

Using it:

```mox
alloc := get_context_alloc();

arr := mem_alloc(alloc, DynArr(i64));
defer mem_free(alloc, arr);

dynarr_init(arr, alloc);
defer dynarr_free(arr);

push(arr, 123);
push(arr, 456);
// arr.len is 2, arr.items[0] is 123
```

## Swap the allocator

Because containers keep their allocator, you can change the current allocator for some code, and it will use yours:

```mox
fn foo() {
    // temporary arena, it is reset at the end of this scope
    arena := #temp_arena();

    // make an allocator from the arena
    alloc := arena_as_allocator(arena);

    // set it as current, and put the old one back at the end
    prev_alloc := set_context_alloc(alloc);
    defer set_context_alloc(prev_alloc);

    // all code inside do_something() now uses the temp arena
    do_something();
}
```

You can also go back from such an allocator to its arena:

```mox
alloc := arena_as_allocator(arena);
arena := arena_from_allocator(alloc);
```
