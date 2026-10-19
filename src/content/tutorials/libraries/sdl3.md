---
title: A window with SDL3
description: Create an SDL3 window and renderer, handle events, and use a macro for error handling.
order: 2
---

Mox also comes with bindings for [SDL3](https://www.libsdl.org/). The bindings were made from the SDL headers by a tool, so all names are the same as in C. The library files are in `modules/vendor/sdl3`.

This page follows `examples/4_sdl3.mox`.

## Error handling with a macro

SDL functions return a failure value and keep the error text in `SDL_GetError()`. This [macro](/tutorials/comptime/macros/) prints both and returns `-1` from `main`:

```mox
import "std.mox";
import "vendor/sdl3.mox";

fn #fail($fmt: []u8, values: $T) {
    println($fmt, values);
    sdl_error := from_c_string(SDL_GetError().cast(*u8));
    println(sdl_error);

    // returns from the caller, not from the macro
    `return -1;
}
```

`from_c_string` turns a C string (`*u8`) into a slice (`[]u8`).

## Window and renderer

Each thing we create gets a `defer` right after it. So everything is cleaned up in the right order, even when `#fail` returns early:

```mox
#linkc fn main(): i32 {
    init_status := SDL_Init(SDL_INIT_VIDEO);
    if (!init_status) {
        #fail("sdl init failed with code: {}", .{ init_status });
    }
    defer SDL_Quit();

    window := SDL_CreateWindow("SDL3 Minimal", 640, 480, 0);
    if (window == 0) {
        #fail("window creation failed", .{});
    }
    defer SDL_DestroyWindow(window);

    renderer := SDL_CreateRenderer(window, nullptr(u8));
    if (renderer == 0) {
        #fail("render creation failed", .{});
    }
    defer SDL_DestroyRenderer(renderer);

    // main loop goes here

    return 0;
}
```

## The main loop

```mox
event : SDL_Event = #memory_garbage;
quit := false;
while (!quit) {
    while (SDL_PollEvent(event.^)) {
        event_type : u32 = event.^.cast(*SDL_CommonEvent).type;
        if (event_type == 256) { // SDL_EVENT_QUIT
            quit = true;
        }
    }

    SDL_SetRenderDrawColor(renderer, 25, 25, 25, 255);
    SDL_RenderClear(renderer);

    SDL_SetRenderDrawColor(renderer, 255, 0, 0, 255);
    SDL_RenderDebugText(renderer, 200, 200, "hello world!");

    SDL_RenderPresent(renderer);
}
```

`event` uses `#memory_garbage` because `SDL_PollEvent` fills it anyway. To read the event type, the pointer is cast to `*SDL_CommonEvent`, the part that all events share.

## Build

```bash
mox ./examples/4_sdl3.mox
```

The SDL3 library file is copied next to the executable.
