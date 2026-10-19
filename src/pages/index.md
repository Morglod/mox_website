---
layout: ../layouts/Page.astro
title: Mox programming language
description: Mox is a statically typed, data oriented, low level programming language for software and games. Compile time code execution, fast compilation, JIT, LLVM and C backends.
---

# Mox

Mox is a statically typed, data oriented, low level programming language for software and games.

[Download](/download/) · [Showcase](/showcase/) · [GitHub](https://github.com/Morglod/mox)

- [Compile time code execution](#compile-time-code-execution)
- [Code generation and hygienic macros](#code-generation)
- [AST and types are first class values](#types-are-values)
- [Comptime data baked into runtime](#comptime-data-in-runtime)
- [Batteries included: 3D math, raylib, SDL3](#batteries-included)
- [Generics, polymorphism and function overloading](#generics)
- [Three backends: x86_64 JIT, LLVM and C](#compilation-speed)
- [Fast compilation: 20-30x faster than clang](#compilation-speed)
- [C performance](#c-performance)

## Hello world

```mox
import "std.mox";

#linkc fn main(): i32 {
    println("hello {}!", .{ "world" });
    return 0;
}
```

## Compile time code execution

Any code can run at compile time, including external C calls. The result is baked into the binary as a constant.

```mox
#linkc fn puts(str: *u8): void;

#run puts("printed while compiling");

const BUILD_URL := #run os_get_env("PUBLIC_URL");
```

More patterns on the [showcase page](/showcase/).

## Code generation

Build code from a string and insert it into the module. Here each line of `config.txt` (`width=800`) becomes a constant.

```mox
fn make_config($path: []u8): __ast_ptr {
    sb : StringBuilder = 0;
    init(sb.^);
    for (line : split_iterator(fs_read_file_full($path), "\n")) {
        eq := index_of(line, "=");
        format(sb.^, "const {} : i32 = {};\n", .{ slice(line, 0, eq), slice(line, eq + 1, line.len) });
    }
    return __compiler_parse(finalize(sb.^));
}

#run #land_ast make_config("./config.txt"); // const width : i32 = 800; ...
```

[How it works](/tutorials/comptime/code-generation/#example-constants-from-a-config-file).

## Types are values

A type is a real pointer to its data inside the compiler. Cast it to `*MoxType` and read its fields like any struct. AST nodes work the same way.

```mox
fn alloc($T: __type_ptr): *$T {
    const size := $T.cast(*MoxType).size;
    return malloc(size).cast(*$T);
}

fn main() {
    x: *i32 = alloc(i32);
}
```

## Comptime data in runtime

Read a resource at compile time and bake its bytes into the binary as a constant. No asset loader at startup, no file paths to ship.

```mox
const FONT_BYTES := #run fs_read_file_full("./assets/font.ttf");

fn render_text() {
    load_font_from_memory(FONT_BYTES);
    // ...
}
```

Or fill a table at compile time and read it at runtime. [Longer example on GitHub](https://github.com/Morglod/mox/blob/master/examples/5_comptime_command_list.mox).

```mox
struct Command {
    name: []u8;
    run: *fn (x: i32): i32;
};

commands: [16]Command = 0; #no_comptime_reset
commands_len: i32 = 0;     #no_comptime_reset

fn register(name: []u8, run: *fn (x: i32): i32) {
    commands[commands_len].name = name;
    commands[commands_len].run = run;
    commands_len = commands_len + 1;
}

fn double(x: i32): i32 { return x * 2; }
fn square(x: i32): i32 { return x * x; }

#run {
    register("double", double);
    register("square", square);
}

#linkc fn main(): i32 {
    return commands[1].run(commands_len); // square(2) == 4
}
```

## Batteries included

Vectors with swizzling and overloaded operators are built into the language.

```mox
fn add_scaled(a: [4]f32, b: [4]f32): [3]f32 {
    return (a + b).xyy * 2.0f;
}
```

The `math.mox` module ships with the compiler:

- Vectors: `length`, `distance`, `normalize`, `dot`, `cross`, `reflect`, `lerp`, `clamp`
- Angles: `angle_to_direction`, `angle_to_direction_3d_yup`, `to_radians`, `to_degrees`
- Quaternions: `quat_from_axis_angle`, `quat_slerp`, `quat_rotate_vec`, `quat_to_direction`, `quat_to_matrix`
- Matrices: `perspective`, `orthographic`, `look_at`, `rotation_axis`, `translation`, `scaling`, `inverse`, `transpose`
- Easing and movement: `smoothstep`, `smootherstep`, `inverse_lerp`, `remap`, `move_towards`, `damp`, `smooth_damp`
- Space and time: `is_point_in_rect`, `wrap_in_rect`, `fract`, `saturate`, `snap`, `ping_pong`, `repeat`

Plus the usual `sqrt`, `sin`/`cos`/`tan`, `pow`, `exp`, `log`, `floor`/`ceil`/`round`. See [modules/math.mox](https://github.com/Morglod/mox/blob/master/modules/math.mox).

Vendored libraries come with prebuilt binaries for Windows and Linux. [raylib](https://www.raylib.com) and [SDL3](https://www.libsdl.org) work out of the box, no system install:

```mox
import "std.mox";
import "vendor/raylib.mox";

#linkc fn main(): i32 {
    InitWindow(800, 600, "hello");
    defer CloseWindow();

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(Color.{ 24, 24, 24, 255 });
        EndDrawing();
    }

    return 0;
}
```

The raylib DLLs are copied to the output directory on build. [Full example](https://github.com/Morglod/mox/blob/master/examples/2_raylib.mox).

## Generics

One syntax for generics, polymorphism and overloading.

```mox
fn max($T: __type_ptr, a: $T, b: $T): $T {
    if (a > b) { return a; }
    return b;
}

fn main() {
    i: i32 = max(i32, 1, 2);
    f: f32 = max(f32, 1.0f, 2.5f);
}
```

## Compilation speed

200k simple functions, emitting an executable:

| Compiler         | Time      | vs mox |
| ---------------- | --------- | ------ |
| mox jit          | 0.499 sec | 1.0x   |
| mox llvm         | 8.8 sec   | 17.6x  |
| clang 19.1.3     | 13.3 sec  | 26.7x  |
| odin dev-2026-08 | 13.8 sec  | 27.7x  |
| rustc 1.96.1     | 33.9 sec  | 67.9x  |

25k generics over 8 types, emitting an executable:

| Compiler         | Time      | vs mox |
| ---------------- | --------- | ------ |
| mox jit          | 1.24 sec  | 1.0x   |
| mox llvm         | 15.48 sec | 12.5x  |
| clang++ 19.1.3   | 39.64 sec | 32.0x  |
| rustc 1.96.1     | 43.56 sec | 35.1x  |
| odin dev-2026-08 | 59.09 sec | 47.7x  |

[Full benchmark](https://github.com/Morglod/mox/blob/master/benchmark/result.md)

## C performance

Mox-compiled code runs at C speed. The rapidhash benchmark matches the C reference on throughput.

[Rapidhash benchmark](https://github.com/Morglod/mox/blob/master/benchmark/result.md#rapidhash)
