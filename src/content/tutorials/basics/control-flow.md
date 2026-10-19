---
title: Control flow
description: if, while, for, switch and defer.
order: 4
---

## if and while

```mox
if (x > 0) {
    // ...
} else {
    // ...
}

while (running) {
    if (skip) { continue; }
    if (done) { break; }
}
```

## for

A `for` loop walks over an iterator. `it_range(n)` gives numbers from `0` to `n - 1`:

```mox
for (i : it_range(10u32)) {
    // i is 0..9
}
```

You can also get the index:

```mox
for (x, index : it_range(10u32)) {
}
```

A `for` loop is a short way to write this:

```mox
__it := it_range(10u32);
while (iterator_next(__it.^)) {
    x := iterator_current(__it.^);
    // body
}
```

So to make your own iterator,  
write your own `iterator_next` and `iterator_current` functions for your iterator type.

## switch

```mox
switch (value) {
    case 1, 2:
        // value is 1 or 2
    case 3:
        // value is 3
    case:
        // all other values
}
```

There is no fall through. Each case stops at the next `case`.

The default `case:` is required, unless you switch over an enum:

```mox
switch (MOX_OS) {
    case .Windows:
        println("windows");
    case .Linux:
        println("linux");
    case:
        println("other");
}
```

## defer

`defer` runs an expression at the end of the current scope. Use it to free things right next to where you made them:

```mox
fn show_window() {
    InitWindow(800, 600, "hello");
    defer CloseWindow();

    // ... CloseWindow() runs here, when the function ends
}
```

If there are many `defer`s, they run in reverse order.
