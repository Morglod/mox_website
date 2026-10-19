---
title: A window with raylib
description: Open a window and draw with raylib, then run the same window at compile time.
order: 1
---

Mox comes with ready bindings for [raylib](https://www.raylib.com/), a simple library for games and graphics. You do not need to install anything. The library files are in `modules/vendor/raylib`.

This page follows `examples/2_raylib.mox`.

## Open a window

```mox
import "std.mox";
import "vendor/raylib.mox";

fn show_simple_window(window_title: *u8) {
    InitWindow(800, 600, window_title);
    defer CloseWindow();

    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(Color.{ 24, 24, 24, 255 });
        EndDrawing();
    }
}

#linkc fn main(): i32 {
    show_simple_window("runtime hello");
    return 0;
}
```

The raylib functions have the same names as in C. If you know raylib, you already know how to use it from Mox.

## Build

```bash
mox ./examples/2_raylib.mox -o=./build/raylib_example
```

The raylib library file is copied next to the executable for you, so you can run it right away.

## How linking works here

`vendor/raylib.mox` imports `vendor/raylib/link.mox`. That file runs at compile time. It picks the right library file for your OS, adds it to the linker command, and copies it to the output folder:

```mox
__compiler_link_lib(link_path, false);
if ($link_comptime) {
    __compiler_link_lib(dll_path, true);
}
build_copy_to_output(dll_path);
```

You can use the same idea for your own C libraries. See [Linking](/tutorials/getting-started/linking/).

## A window at compile time

Since any code can run at compile time, you can open the raylib window while compiling. You only need to load raylib into the compiler first:

```mox
#run {
    // true = load raylib into the compiler, so we can call it now
    const raylib_link := import "vendor/raylib/link.mox";
    raylib_link.link_raylib(true);
    show_simple_window("comptime hello");
};
```

The window opens during the build. When you close it, the compiler goes on. This is not very useful for a real program, but the same trick lets you make tools that run inside the build, like a level editor or an asset preview.

## Bigger examples

- `examples/asteroids.mox` - a small asteroids game with raylib.
- `examples/box3d.mox` - 3D physics with box3d, drawn with raylib.
- `examples/microui.mox` - a UI made with microui, drawn with raylib.

All of them build the same way:

```bash
mox ./examples/asteroids.mox
```
