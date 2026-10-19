---
title: Compiler hooks
description: Run your code after the whole program is compiled, to collect data and pass it to runtime.
order: 5
---

A hook is your code that the compiler calls at some moment.

## The compilation ended hook

`MOX_COMPILER_HOOK_COMPILATION_ENDED` is called after all modules are compiled, but before the final code is written. At this moment your code can still change global variables or add more code.

Register a hook with a macro function and one pointer argument:

```mox
fn #on_end(_: *u8): void {
    // runs after all modules are compiled
}

#run __compiler_register_hook(MOX_COMPILER_HOOK_COMPILATION_ENDED, #on_end, nullptr(u8));
```

## Example: a command list

This is `examples/5_comptime_command_list.mox`. Functions register themselves at compile time. When compiling ends, the list is saved into a global, and the program uses it when it runs.

```mox
import "std.mox";

struct Command {
    name: []u8;
    run: *fn (x: i32): i32;
}

// the final list, kept for runtime
commands: []Command = 0; #no_comptime_reset

// the list we build at compile time
_commands: DynArr(Command) = 0;

#run {
    dynarr_init(_commands.^, get_context_alloc());
}

fn register_command(name: []u8, run: *fn (x: i32): i32) {
    push(_commands.^, Command.{
        name = name;
        run = run;
    });
}

fn double(x: i32): i32 { return x * 2; }
fn square(x: i32): i32 { return x * x; }

#run register_command("double", double);
#run register_command("square", square);

fn #build_command_list(_: *u8): void {
    // this memory was allocated at compile time and never freed,
    // so it is safe to keep a slice to it
    commands = _commands.items;
}

#run __compiler_register_hook(MOX_COMPILER_HOOK_COMPILATION_ENDED, #build_command_list, nullptr(u8));

#linkc fn main(): i32 {
    for (i : it_range(commands.len)) {
        result := commands[i].run(3);
        println("command {} name='{}' run(3)={}", .{ i, commands[i].name, result });
    }
    return 0;
}
```

Output:

```
command 0 name='double' run(3)=6
command 1 name='square' run(3)=9
```

Two things make this work:

- `commands` has `#no_comptime_reset`, so the value set at compile time stays when the program runs. See [Globals at compile time](/tutorials/comptime/run/#globals-at-compile-time).
- `commands` is a slice, and function pointers taken at compile time are valid at runtime too. Raw pointers would not work here, see [What can go from compile time to runtime](/tutorials/comptime/run/#what-can-go-from-compile-time-to-runtime).

## Other ideas

The same hook can walk over a list of resources and process them before the program is built. For example: pack all textures into one atlas, compress it, and fix the coordinates in the list.
