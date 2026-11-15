---
title: Struct of arrays
description: Turn a struct into a struct of arrays with #soa from soa.mox.
order: 4
---

An array of structs keeps all fields of one item together:

```mox
struct Particle {
    pos: [2]f32;
    vel: [2]f32;
    life: f32;
};

particles : [100]Particle = 0; // pos vel life, pos vel life, ...
```

A struct of arrays (SoA) keeps each field in its own array: all `pos`, then all `vel`, then all `life`. A loop that only reads `life` then reads only the `life` memory. This is faster when you have many items, and such data is easier to process with SIMD.

`soa.mox` makes such a type from your struct.

## Making the type

```mox
import "std.mox";
import "soa.mox";

const ParticleSoa := #soa(Particle);
```

`ParticleSoa` has one slice for each field of `Particle`: `ps.pos` is `[][2]f32`, `ps.vel` is `[][2]f32`, `ps.life` is `[]f32`.

## Using it

```mox
alloc := get_context_alloc();

ps : ParticleSoa = 0;
soa_alloc(ps.^, 100, alloc); // room for 100 items in each field
defer soa_free(ps.^, alloc);

for (i : it_range(100)) {
    ps.pos[i] = .{ 0, 0 };
    ps.vel[i] = .{ 1, 2 };
    ps.life[i] = 3;
}

for (i : it_range(100)) {
    ps.pos[i] += ps.vel[i] * 0.5f;
    ps.life[i] -= 0.5f;
}
```

`soa_realloc(ps.^, 200, alloc)` makes room for more items and keeps the values.

## How it works

`#soa` is a normal Mox function that runs at compile time. It reads the fields of the struct, builds the source code of the new struct as text and parses it. Each field becomes an [alias](/tutorials/comptime/macros/#aliases) to one memory slot, cast to a slice of the field's type.

See [Code generation](/tutorials/comptime/code-generation/) for how to do this in your own code.
