---
title: Macros
description: Write macro functions that expand in the caller, share names with the caller, and take code as an argument.
order: 4
---

A function whose name starts with `#` is a macro. Its body is put into the caller, instead of being called.

## A simple macro

```mox
fn #temp_memory($size: i64): []u8 {
    buf: [$size]u8 = #memory_garbage;
    return buf.^ |> slice();
}

fn main() {
    {
        temp_buf := #temp_memory(512);
        // temp_buf points to a 512 byte array on the stack
    }
    // the array is gone here
}
```

The array lives in the caller's scope, so the returned slice is valid until the end of that scope. A normal function could not do this.

## Names are hidden by default

Variables inside a macro are not visible to the caller. So a macro can not break the caller's variables by accident. These are called hygienic macros.

## Sharing with the caller

Put a backtick `` ` `` before a name to make it visible to the caller:

```mox
fn #make_x(): void {
    `x : i32 = 0;
}

fn main() {
    #make_x();
    x += 1; // x comes from the macro
}
```

The backtick works for `defer` and control flow too. They then act in the caller's scope:

```mox
fn #example(): void {
    `x : i32 = 0;

    {
        // runs at the end of the caller's scope,
        // not at the end of this block
        `defer `x += 1;
    }

    // returns from the caller
    `return;
    // `break; and `continue; also work
}
```

## Example: fail and return

From [examples/4_sdl3.mox](https://github.com/Morglod/mox/blob/master/examples/4_sdl3.mox). On error, it prints a message and returns `-1` from the function that used it:

```mox
fn #fail($fmt: []u8, values: $T) {
    println($fmt, values);
    println(from_c_string(SDL_GetError().cast(*u8)));

    `return -1;
}

#linkc fn main(): i32 {
    if (!SDL_Init(SDL_INIT_VIDEO)) {
        #fail("sdl init failed", .{});
    }
    // ...
    return 0;
}
```

## Taking code as an argument

A macro can take code (`__ast_ptr`) and insert it with `#land_ast`:

```mox
fn #repeat(n: u64, code: __ast_ptr) {
    `it: u64 = 0;
    while (`it < n) {
        #land_ast code;
        `it = `it + 1;
    }
}

fn main() {
    total : u64 = 0;
    #repeat(10, #run #ast total += it);
}
```

`it` comes from the macro with a backtick, so the code you pass can use it.

## Aliases

`#alias name = expression;` gives a name to an expression. It can be in a module, in a function or in a struct:

```mox
struct Something {
    ptr: *i32;
    len: i64;

    // inside a struct, self is a pointer to the struct
    #alias as_slice = slice(self.ptr, self.len);
    #alias size = self.len;
};

s.size = 10; // writes s.len
```

The expression is compiled where the alias is declared, not where it is used. So unlike C defines, it can not see the caller's variables.

Aliases could slow compilation, because the expression is compiled again each time it is used and also makes code less predictable. Use them only when you really need them.
