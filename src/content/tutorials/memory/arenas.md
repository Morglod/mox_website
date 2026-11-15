---
title: Arenas
description: Use arenas and temp buffers for fast short-lived memory.
order: 3
---

An arena is a big block of memory. You push data into it one piece after another. You do not free pieces one by one. Instead you reset the whole arena at once.

This is the best way to work with temporary memory. It is fast and you can not forget to free something.

## Temp arenas

The standard library has a few scratch arenas per thread. `#temp_arena()` takes one and resets it at the end of the current scope:

```mox
fn work() {
    arena := #temp_arena();

    buf : []u8 = arena_push(arena, 1024); // 1024 bytes
    ptr : *i64 = arena_push(arena, i64);  // one i64

    // everything is gone after this function ends
}
```

## Pushing data

```mox
buf : []u8 = arena_push(arena, 1024);
ptr : *i64 = arena_push(arena, i64);

// copies
ptr = arena_push_copy(arena, ptr.*);
buf_copy : []u8 = arena_push_slice_copy(arena, buf);

// string copies
str : []u8 = arena_push_str_copy(arena, "hello world!");
str_c : []u8 = arena_push_str_copy_c(arena, "hello world!"); // with zero at the end
```

## Avoiding conflicts

Sometimes a function puts its result into memory from the caller and also needs its own temp memory. If both use the same scratch arena, the temp memory can overwrite the result.

To avoid this, pass the allocator of the result to `#temp_arena`. It will pick a different scratch arena:

```mox
other := get_context_temp_arena_as_alloc();
arena := #temp_arena(other); // never the arena behind other
```

An allocator that is not backed by a scratch arena never conflicts.

## Temp buffers

`#temp_buffer` is a short way to get temporary bytes:

```mox
buf := #temp_buffer(1024);
buf := #temp_buffer(1024, other); // avoid conflict with other
```

`#temp_c_string` makes a temporary C string (with zero at the end) from a slice:

```mox
c_str := #temp_c_string("hello world");
c_str := #temp_c_string("hello world", other);
```

## Full example

This function reads a line from the console. It uses a temp buffer for reading, then copies the result into the arena the caller passed:

```mox
#linkc fn gets(buf: *u8): *u8;

fn read_line(arena: *Arena = get_context_temp_arena()): []u8 {
    const max_len := 1024i64;

    // a different scratch arena than `arena`, freed at the end of this scope
    tmp_buf := #temp_buffer(max_len, arena_as_allocator(arena));
    gets(tmp_buf.ptr);

    str_len := c_strlen(tmp_buf.ptr, max_len);

    // copy into the caller's arena, so it lives after we return
    dst := arena_push(arena, str_len);
    mem_copy(dst, tmp_buf);

    return dst;
}
```
