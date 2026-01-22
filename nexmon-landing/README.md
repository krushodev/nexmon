# NEXMON Landing

Landing page for the NEXMON system monitor application.

## Tech Stack

- **Framework**: Astro
- **Styling**: Tailwind CSS

## Development

```bash
# Install dependencies
bun install

# Run dev server
bun dev

# Build for production
bun build
```

## Project Structure

```
nexmon-landing/
├── public/                    # Static assets and downloads
│   └── nexmon_*.msi          # Installer files
├── src/
│   ├── layouts/Layout.astro  # Base layout
│   └── pages/index.astro     # Landing page
└── package.json
```

## Updating Downloads

Place installer files in `public/` and update the download links in `src/pages/index.astro`.

## License

MIT
