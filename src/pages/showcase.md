---
layout: ../layouts/Page.astro
title: Showcase - Mox programming language
description: What compile time code execution in the Mox programming language lets you do - bake constants, read config, download dependencies, configure the build - without external tools or codegen steps.
---

# Showcase

`#run` evaluates any expression at compile time. External symbols work too. The result is baked into the binary as a constant.

The `os_*` and `fs_*` calls below are wrappers around C functions. Nothing special, nothing from the compiler.

These patterns usually need a build system or a code generator. In Mox they are just code.

## Bake the git hash into the binary

```mox
fn print_version() {
    git_hash := #run os_exec_output("git rev-parse HEAD");
    println(git_hash);
}
```

## Build flags from the environment

```mox
const NO_ASSERTS := #run os_get_env("NO_ASSERTS") == "true";

fn assert() {
    #if (!NO_ASSERTS) {
        // ... check ...
    }
}
```

## Read a config file and bake the constants

```mox
fn read_config(path: []u8): Config {
    data := fs_read_file_full(path);
    return parse_config(data);
}

CONFIG := #run read_config("./.env");
```

## Self configuring build

```mox
#run {
    dll_path := build_resolve_path("./binaries/raylib.dll");
    build_copy_to_output(dll_path);
}
```

## Go-like dependency management

Generate an `import` from a URL. Download it on first build. Insert the import into the module.

```mox
fn require_dependency($link: []u8): __ast_ptr {
    cached_path := dep_cache_path($link);
    if (!os_path_exists(cached_path)) {
        dep_download(cached_path, $link);
    }
    return __compiler_parse(#format_temp("import \"{}\";", .{ cached_path }));
}

#run #land_ast require_dependency("github.com/smth/smth");
```
