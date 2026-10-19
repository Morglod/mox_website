---
title: Operators
description: Math, comparison, bit operations, casts, vector math with swizzling and the pipe operator.
order: 2
---

## Math and comparison

```mox
1 + 1;  2 - 2;  3 * 3;  5 / 5;  5 % 5;

2 == 2;  2 != 1;  2 > 1;  2 >= 2;

true && true;  true || false;  !true;
```

Compound assignment works too:

```mox
x : i64 = 0;
x += 1;  x -= 1;  x *= 2;  x /= 2;  x %= 3;  x &= 1;
```

There is no operator overloading.

## Comparing structs and arrays

`==` on structs, arrays and slices compares field by field, item by item. Two slices with the same items are equal, even if they point to different memory:

```mox
MyStruct.{ 10 } == MyStruct.{ 10 }; // true
```

If slice's ptr and len are equal, there is no item by item comparison as they are the same slice.

## Casts

`.cast(type)` converts a value:

```mox
fn add(a: i32, b: f32): f32 {
    return a.cast(f32) + b;
}
```

## Bit operations

```mox
5 & 5;  5 | 5;  5 ^ 5;  ~5u32;
```

Shifts and other bit tools are built-in functions:

```mox
#shl(10u32, 2);   // shift left
#shr(10u32, 2);   // shift right
#bit_popcount(10u32);
#bit_count_leading_zeroes(10u32);
#bit_count_trailing_zeroes(10u32);
#bit_first_set(10u32);
#bit_parity(10u32);
#bit_reverse(10u32);
#byte_reverse(10u32); // little endian <-> big endian
```

## Overflow

By default `+`, `-` and `*` expect that overflow never happens. If you want numbers to wrap around, say so:

```mox
#wrap_add(10u32, 10u32);
#wrap_sub(10u32, 10u32);
#wrap_mul(10u32, 10u32);
```

## Vector math

Math works on arrays of 2 to 4 items, like vectors in 3D math. You can also read and write parts of them with `xyzw` or `rgba` letters (this is called swizzling):

```mox
a := [3]f32.{ 1, 2, 3 };
b := [3]f32.{ 4, 5, 6 };
a.yz = b.xx * 2;
// a is { 1, 8, 8 } now
```

```mox
fn foo(a: [4]f32, b: [4]f32): [3]f32 {
    return (a + b).xyy * 2.0f;
}
```

These are normal arrays. They just have these extra operators. Swizzling does not work on arrays with more than 4 items.

## Pipe operator

`|>` passes the value on the left as the first argument of the call on the right:

```mox
value |> first() |> second(10);
```

is the same as:

```mox
second(first(value), 10);
```
