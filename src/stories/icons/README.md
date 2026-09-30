# Icons

Put your own `.svg` files in this folder and use them by file name:

```html
<nex-icon name="house" />                                       <!-- icons/house.svg -->
<nex-icon name="my-logo" [size]="32" />                         <!-- icons/my-logo.svg -->
<nex-icon name="heart" style="color: red" />                    <!-- icons that use currentColor take the text color -->
<nex-icon name="search" label="Search" />                       <!-- label = accessible name when there is no visible text -->
```

The folder ships with the full [Lucide](https://lucide.dev) set (ISC license, see `LICENSE-lucide.txt`). Browse, search and copy them on the **Icons** page at the top of the Storybook sidebar. New files show up there automatically.

`tags.json` holds extra search keywords per icon (e.g. `house` also matches "home"). Adding your icon to it is optional.

## Tips for your SVG files

- **File name = icon name.** Use lowercase with dashes: `shopping-cart.svg`, then `name="shopping-cart"`.
- **Keep the `viewBox`** attribute (e.g. `viewBox="0 0 24 24"`). The component sets the size, so `width`/`height` in the file are ignored.
- **Use `currentColor`** for `stroke` or `fill` so the icon matches the text color. Multi-color icons (logos) keep their own colors.
- Only add SVG files you trust, because they are inserted into the page as markup.
