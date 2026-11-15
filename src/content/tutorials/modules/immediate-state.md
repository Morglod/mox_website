---
title: Immediate state
description: Keep state between frames in immediate mode UI and animations with game/immediate_state.mox.
order: 2
---

In immediate mode code you draw everything again on each frame. A button is a function call, not an object. But some things must live longer than one frame: is a checkbox on, where is a moving box right now.

`game/immediate_state.mox` keeps this state for you. Each frame you ask for a state by its key, and you get the same memory back.

## The frame loop

```mox
import "std.mox";
const im := import "game/immediate_state.mox";

#linkc fn main(): i32 {
    while (running) {
        im.frame_start();
        defer im.frame_end();

        counter := im.state(im.key("counter"), 0i32);
        counter.* += 1; // 1, 2, 3, ... one more each frame
    }
    return 0;
}
```

- `im.key("counter")` makes a key from a name.
- `im.state(key, initial)` returns a pointer to the state. On the first frame the value is `initial`. On the next frames you get the same memory with the value you left there.
- `im.frame_start()` starts a frame. `defer im.frame_end()` ends it at the end of the loop body.

## Unused state is dropped

If a state was not asked for during a frame, `im.frame_end()` frees it. So when a button is not drawn anymore, its state is gone too. If it is drawn again later, it starts from `initial` again.

To run code when a state is dropped, pass a function as the last argument:

```mox
fn on_drop(ctx: *im.ImCtx, value: *i32): void {
    // free what value holds
}

s := im.state(im.key("thing"), 0i32, on_drop);
```

## Keys

Each state needs its own key. The same key with a different type is an error.

In a loop, mix the index into the key:

```mox
for (i : it_range(10u32)) {
    pos := im.state(im.key(i, "box_pos"), 0.0f);
}
```

A key can be made from another key in the same way: `im.key(parent_key, "pos")`.

Inside a function that draws a widget, `im.#push_key` mixes a key into all keys made later in the same scope. So two widgets can use the same names inside:

```mox
fn counter(name: []u8): i32 {
    im.#push_key(im.key(name));

    clicks := im.state(im.key("clicks"), 0i32); // different for counter("a") and counter("b")
    clicks.* += 1;
    return clicks.*;
}
```

## Example: a button

A button with raylib. It needs no state, it just checks the mouse on each frame:

```mox
fn button(rect: rl.Rectangle): bool {
    is_hovered := rl.CheckCollisionPointRec(rl.GetMousePosition(), rect);
    return is_hovered && rl.IsMouseButtonPressed(0);
}
```

## Example: a checkbox

A checkbox is a button that remembers if it is on. This is where state is needed:

```mox
fn checkbox(name: []u8, rect: rl.Rectangle): bool {
    checked := im.state(im.key(name), false);
    if (button(rect)) {
        checked.* = !checked.*;
    }
    return checked.*;
}
```

Call `checkbox("sound", .{ 10, 70, 40, 40 })` each frame and it keeps its value.

## Animations

`im.frame_start()` also measures the time since the last frame. The animation helpers use it.

`state_animate_move_towards` moves a value to a target, `speed` units per second. Change the target and the value follows it:

```mox
target_y := select(is_down, 10.0f, 760.0f);
y := im.state_animate_move_towards(im.key("box_y"), target_y, 700.0f);

rl.DrawRectangleV(.{ 10, y.* }, .{ 10, 10 }, rl.COLOR_RED);
```

Add a curve from `game/animate.mox` to make the move smooth:

```mox
y := im.state_animate_move_towards(im.key("box_y"), target_y, 700.0f, ease_in_out.^);
```

It works for numbers and vectors, like `vec2f` positions or colors.

`state_animate` plays from one value to another over a time in seconds:

```mox
fade := im.state_animate(im.key("fade_in"), 0.0f, 1.0f, 0.5f, ease_out.^);
alpha := fade.value; // from 0 to 1 in half a second
if (fade.ended) {
    // done
}
```

For a looping animation, pass the parameters with flags:

```mox
pulse := im.state_animate(im.key("pulse"), im.ImStateAnimationParams(f32).{
    from = 1;
    to = 1.2f;
    duration = 0.5f;
    curve = ease_in_out_sine.^;
    flags = .REPEAT | .PING_PONG; // 1 -> 1.2 -> 1 and again
});
```

## Your own context

The functions above use a default context, one per thread, made on first use. You can make your own and pass it first. This is useful when you have two separate UIs, like two windows:

```mox
ctx := im.create(get_context_alloc());
defer im.free(ctx);

im.frame_start(ctx);
defer im.frame_end(ctx);

x := im.state(ctx, im.key(ctx, "x"), 0i32);
```

One context holds up to 1024 states.

## Full example

[examples/immediate_state.mox](https://github.com/Morglod/mox/blob/master/examples/immediate_state.mox) draws a button, a checkbox and boxes that move and scale with animations, using raylib.
