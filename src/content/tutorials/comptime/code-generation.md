---
title: Code generation
description: Treat code as a value with #ast, insert it with #land_ast, emit code from loops, and parse strings into code.
order: 3
---

In Mox, code itself can be a value. You can keep it, build it, and insert it somewhere. The compiler then treats it as if you wrote it there by hand.

## Code as a value

`#ast` takes a piece of code without running it. Its type is `__ast_ptr`:

```mox
#linkc fn puts(str: *u8): void;

const code : __ast_ptr = #ast puts("hello");
```

## Inserting code

`#land_ast` puts the code where it is written:

```mox
fn main() {
    #land_ast code; // same as writing puts("hello"); here
}
```

## Emitting code from a loop

Inside `#run`, `#emit` adds code to the place where `#run` is. It can use compile time values like the loop variable:

```mox
total : u32 = 0;

#run {
    for (i : it_range(10u32)) {
        #emit {
            total += i;
        };
    }
};
```

This unrolls the loop: the program gets 10 lines, `total += 0;`, `total += 1;` and so on.

`#for` is a short way to write the same thing:

```mox
#for (i : it_range(10u32)) {
    total += i;
}
```

## Code from a string

`__compiler_parse` turns a string into code:

```mox
const code := __compiler_parse("puts(\"hello from a string\");");
#land_ast code;
```

## Example: constants from a config file

A function can build the string at compile time from any data. Here we read a config file and make a constant for each line.

`config.txt`, next to the source file:

```
width=800
height=600
```

The code:

```mox
import "std.mox";

fn make_config($path: []u8): __ast_ptr {
    sb : StringBuilder = 0;
    init(sb.^);

    for (line : split_iterator(fs_read_file_full($path), "\n")) {
        eq := index_of(line, "=");
        name := slice(line, 0, eq);
        value := slice(line, eq + 1, line.len);
        format(sb.^, "const {} : i32 = {};\n", .{ name, value });
    }

    return __compiler_parse(finalize(sb.^));
}

#run #land_ast make_config("./config.txt");

#linkc fn main(): i32 {
    println("{}x{}", .{ width, height }); // 800x600
    return 0;
}
```

How it works:

1. `fs_read_file_full` reads the file. This happens while compiling.
2. `split_iterator` walks over the lines, and `index_of` finds the `=` in each one.
3. A `StringBuilder` collects the code. For this file it is:

   ```mox
   const width : i32 = 800;
   const height : i32 = 600;
   ```

4. `__compiler_parse` turns the text into code, and `#land_ast` puts it into the module.

Now `width` and `height` are normal constants. The program does not read `config.txt` when it runs. Change the file and build again to get new values.

## When to use it

Use it when names or values in your code come from data: a config file, a table, a list of names. It is also good for picking code per platform. For simple cases, [generics](/tutorials/basics/generics/) or [macros](/tutorials/comptime/macros/) are easier to read.

For example with code generation [#soa](https://github.com/Morglod/mox/blob/master/modules/soa.mox) is implemented this way.
