---
title: Animation curves
description: Move values from one to another with easing curves using game/animate.mox.
order: 1
---

`game/animate.mox` has one function, `animate`, and a set of easing curves for it.

```mox
import "std.mox";
import "game/animate.mox";
```

## animate

```mox
x := animate(0.0f, 300.0f, 0.5f, ease_out_cubic.^); // 262.5
```

`animate(from, to, t, curve)` returns `from + (to - from) * curve(t)`.

- `t` is the progress, from `0` to `1`. Values outside are clamped.
- `curve` changes how the value moves between `from` and `to`.

To animate over time, divide the time that passed by the duration:

```mox
y := animate(0.0f, 300.0f, elapsed / duration, ease_out_bounce.^);
```

## Numbers and vectors

`animate` works on floats, integers and vectors of them. Integers are rounded:

```mox
n := animate(0i32, 10i32, 0.25f, linear.^); // 3

pos := animate(vec2f.{ 0, 0 }, vec2f.{ 100, 50 }, 0.5f, ease_in_out.^);

color := animate([4]u8.{ 255, 0, 0, 255 }, [4]u8.{ 0, 0, 255, 255 }, 0.5f, linear.^);
```

## Curves

A curve is a function `fn(t: f32): f32`. It takes `t` from `0` to `1` and returns how far the value is.

- `linear`
- `ease_in_*`, `ease_out_*`, `ease_in_out_*` for `quad`, `cubic`, `quart`, `quint`, `sine`, `expo`, `circ`, `back`, `elastic`, `bounce`. For example `ease_out_back`.
- `ease`, `ease_in`, `ease_out`, `ease_in_out` - same as in CSS

`in` starts slow, `out` ends slow, `in_out` does both. `back` and `elastic` go a bit past the end and come back.

## Your own curve

Any function with the same signature is a curve. `cubic_bezier` works like `cubic-bezier()` in CSS, so you can copy curves from CSS tools:

```mox
fn snappy(t: f32): f32 {
    return cubic_bezier(t, 0.2f, 0.8f, 0.2f, 1);
}

s := animate(1.0f, 2.0f, t, snappy.^);
```

There is also `quad_bezier(t, x1, y1)` with one control point.

## With immediate state

[Immediate state](/tutorials/modules/immediate-state/#animations) uses these curves. It keeps the time and the value between frames for you.
