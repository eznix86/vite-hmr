# vite-hmr

A framework-agnostic Vite plugin inspired by Laravel's Vite plugin.

## Installation

```bash
npm install vite-hmr
```

## Usage

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import hmr from 'vite-hmr'

export default defineConfig({
  plugins: [
    hmr({
      input: ['src/js/main.ts', 'src/css/app.css'],
      refresh: true,
    }),
  ],
})
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `input` | `string[]` \| `Record<string, string>` | `[]` | Entry points to compile |
| `publicDir` | `string` | `"public"` | Directory for public assets |
| `buildDir` | `string` | `"build"` | Output directory inside publicDir |
| `hotFile` | `string` | `"public/hot"` | Path to hot reload file |
| `refresh` | `boolean` \| `string` \| `string[]` | `false` | Enable full-page reload on file changes |

## Output Structure

Built files are organized into:

- `js/` - JavaScript entry points and chunks
- `css/` - Stylesheets
- `images/` - Image assets
- `assets/` - Other assets

## License

[MIT](LICENSE)
