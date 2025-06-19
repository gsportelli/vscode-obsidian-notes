# Change Log

All notable changes to the "obsidian-notes" extension will be documented in this file.

## [1.0.0] - 2025-06-19

### Added

- Initial release
- Activity bar integration with Obsidian icon
- Tree view for browsing Obsidian vault
- File and folder operations (create, delete, rename)
- Full-text search across vault
- Configurable ignore patterns
- Hidden files toggle
- Context menus for file operations
- Automatic file extension detection and icons
- Quick file opening with single click

### Features

- **Vault Browser**: Navigate your Obsidian vault structure
- **Search**: Find text across all notes with result preview
- **File Operations**: Complete file management from VS Code
- **Configuration**: Flexible settings for vault path and ignore patterns
- **Integration**: Seamless VS Code experience with proper icons and commands

### Technical

- TypeScript implementation
- Minimatch for glob pattern matching
- Proper VS Code extension architecture
- Event-driven tree refresh
- Progress reporting for search operations