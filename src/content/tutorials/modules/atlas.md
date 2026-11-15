---
title: Texture atlas
description: Pack many small images into a few big pages with game/atlas.mox.
order: 3
---

Games often put many small images (sprites, font glyphs) into one big texture. This is called a texture atlas. One texture is faster to draw from than hundreds of small ones.

`game/atlas.mox` finds where each image goes. It only works with sizes and positions. Copying the pixels is up to you.

```mox
import "std.mox";
import "game/atlas.mox";
```

## Packing

```mox
enum PixelFormat {
    RGBA8;
    R8;
};

struct Sprite {
    id: i32;
};

atlas : Atlas(Sprite, PixelFormat) = 0;
atlas_init(atlas.^);
defer atlas_free(atlas.^);

// width, height, kind, data
hero := atlas_add(atlas.^, 64, 64, .RGBA8, Sprite.{ id = 1 });
atlas_add(atlas.^, 32, 32, .RGBA8, Sprite.{ id = 2 });
atlas_add(atlas.^, 16, 16, .R8, Sprite.{ id = 3 });

atlas_pack(atlas.^);
```

`Atlas` takes two types:

- **Data** - anything you want to keep with each image, like an id or a pointer to the pixels.
- **Kind** - images share a page only when their kinds are equal. Here `R8` images never go to the same page as `RGBA8` ones.

## Reading the result

After `atlas_pack`, walk over the pages and the items on each page:

```mox
for (page, page_index : iterate(atlas.pages.items)) {
    // make a page.width x page.height texture
    for (item : atlas_page_items(atlas.^, page_index)) {
        // copy the image of item.data to item.x, item.y
    }
}
```

For the example above it gives:

```
page 0: 97x64
  sprite 1 at 0,0 size 64x64
  sprite 2 at 65,0 size 32x32
page 1: 16x16
  sprite 3 at 0,0 size 16x16
```

`atlas_add` returns a handle. Use it to find one item later:

```mox
hero := atlas_add(atlas.^, 64, 64, .RGBA8, Sprite.{ id = 1 });
// ... atlas_pack(atlas.^);

h := atlas_item(atlas.^, hero);
// h.page, h.x, h.y
```

## Settings

Pass settings to `atlas_init`. Start from the defaults and change what you need:

```mox
settings := ATLAS_DEFAULT_SETTINGS;
settings.max_width = 1024;
settings.max_height = 1024;
settings.extrude = 1;
atlas_init(atlas.^, settings);
```

- `max_width`, `max_height` - the biggest page size. 2048 by default.
- `padding` - empty pixels between images. 1 by default.
- `extrude` - a border around each image. Fill it with the image's edge pixels, so the texture filter does not mix in pixels of the neighbors. `item.x` and `item.y` point to the image itself, inside the border.
- `align` - round each place up to this number of pixels.
- `power_of_two` - make page sizes 64, 128, 256 and so on.
- `allow_big_items` - an image bigger than a page gets its own page. If this is off, such images are skipped (`item.page` is `-1`) and `atlas_pack` returns `false`.
