# NEXMON App

Desktop system monitor built with Tauri, React, and Rust.

## Features

- **Dashboard**: System overview with CPU, RAM, and network stats
- **Resources**: Real-time charts for CPU and memory usage history
- **Processes**: List of running processes with CPU/memory consumption
- **Themes**: Dark and light mode support

## Tech Stack

- **Backend**: Rust + Tauri 2 + sysinfo
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Charts**: Recharts

## Development

```bash
# Install dependencies
bun install

# Run in development
bun tauri dev

# Build for production
bun tauri build
```

## Project Structure

```
nexmon-app/
├── src/                  # React frontend
│   ├── components/       # UI components (DashboardTab, ResourcesTab, ProcessesTab)
│   └── App.tsx          # Main app with navigation and theme toggle
├── src-tauri/           # Rust backend
│   └── src/
│       ├── lib.rs       # Tauri commands
│       ├── monitor.rs   # System metrics collection
│       └── models.rs    # Data structures
└── package.json
```

## License

MIT
