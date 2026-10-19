---
title: Modules
description: Import other files, name imports, and re-export from a module.
order: 6
---

Each `.mox` file is a module.

## Importing

```mox
import "std.mox";
import "./my_module.mox";
```

- A path that starts with `./` is relative to the current file.
- Any other path is looked up in the `modules` folder next to the compiler.

Modules can import each other in a circle. This is allowed.

## Named imports

Give a module a name to keep its names apart:

```mox
const raylib_link := import "vendor/raylib/link.mox";

raylib_link.link_raylib(true);
```

## What is visible

Names from an imported module are visible only in the file that imports it. If `a.mox` imports `b.mox`, and `main.mox` imports `a.mox`, then `main.mox` does not see `b.mox`.

To make a "root" module that gives all names from its parts, add `#export`:

```mox
// all.mox
import "./part1.mox" #export;
import "./part2.mox" #export;
```

Now `import "./all.mox";` gives you the names from both parts.

This is how `std.mox` works: one import gives you the whole standard library.

## Built-in modules

Some useful modules in the `modules` folder:

- `std.mox` - printing, strings, memory, containers, file system, OS
- `build.mox` - helpers for build steps, like copying files next to the output
- `vendor/raylib.mox`, `vendor/sdl3.mox`, `vendor/box3d.mox`, `vendor/microui.mox` - ready bindings for these C libraries
