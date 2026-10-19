---
title: Running code at compile time
description: Use #run to execute any code while compiling, bake results into the binary, and control globals.
order: 1
---

Any Mox code can run while the compiler works. This includes calls to C functions. This is called compile time (or "comptime") code.

## The #run directive

`#run` runs code while compiling:

```mox
#linkc fn puts(str: *u8): void;

#run puts("printed while compiling");
```

It can run a block too:

```mox
#run {
    puts("hello from compile time!");
};
```

## Baking values into the binary

The result of `#run` is a normal value. Store it in a variable or constant, and it is written into the program:

```mox
x := #run 10u32 + 20u32;

const BUILD_URL := #run os_get_env("PUBLIC_URL");
```

This works for files too. The file is read once while compiling, so the program has nothing to load at start:

```mox
const FONT_BYTES := #run fs_read_file_full("./assets/font.ttf");
```

Constants always live at compile time. Since types are values, a type can be a constant too:

```mox
const MyInt : __type_ptr = i32;
```

## Globals at compile time

The initial value of a global variable is evaluated at compile time, the same way as for `const`. You do not need `#run` for it. Even a function call runs while compiling, and only the result goes into the program:

```mox
fn compute(): i64 {
    return 6 * 7;
}

answer : i64 = compute(); // compute() runs at compile time
```

Compile time code can change global variables. But by default, when the program starts, each global goes back to its initial value. Add `#no_comptime_reset` to keep what compile time code wrote into it:

```mox
counter1 : i64 = 0;
counter2 : i64 = 0; #no_comptime_reset

fn bump() {
    counter1 += 1;
    counter2 += 1;
}

#run bump();
#run bump();

// at compile time both are 2 here

// when the program runs:
// counter1 == 0
// counter2 == 2
```

This lets you collect data while compiling and use it when the program runs. See [Compiler hooks](/tutorials/comptime/compiler-hooks/) for a full example.

## What can go from compile time to runtime

Not every value can be passed from compile time to the running program:

- Numbers, bools, structs and arrays of them - yes.
- Slices - yes. The memory they point to is copied into the program.
- Function pointers - yes. They point to the same function in the program.
- Raw pointers (`*T`) - no. A raw pointer is just an address inside the compiler, and the compiler does not know how much memory is behind it.

So if you build data at compile time and want to keep it, store it as a slice, not as a raw pointer:

```mox
data: []u8 = 0; #no_comptime_reset  // ok
ptr: *u8   = 0; #no_comptime_reset  // error: can not keep a compile time address
```

## Am I running at compile time?

Since any function can run at compile time, sometimes it needs to know:

```mox
if (#is_comptime) {
    // running inside the compiler
}

if (#is_interp) {
    // running in the interpreter, maybe use a simpler path
}
```

## Speed

Compile time code mostly runs in an interpreter, so heavy code can be slow. On the jit backend, the interpreter can call jit-compiled functions, which is much faster.
