# Obsidian Notes - VS Code Extension

Browse and manage your Obsidian vault directly from VS Code's activity bar.

## Features

- **Activity Bar Integration**: Dedicated Obsidian icon in VS Code's activity bar
- **Vault Browser**: Tree view of your Obsidian vault with folder structure
- **File Operations**: Create, delete, rename files and folders
- **Search**: Full-text search across all notes in your vault
- **Configurable**: Ignore patterns and hidden file visibility
- **Quick Access**: Click any note to open it in VS Code

## Installation

1. Install from VS Code Marketplace (coming soon)
2. Or install from VSIX file

## Configuration

### Initial Setup

1. Click the Obsidian icon in the activity bar
2. Click "Configure Vault" or use the command palette: `Obsidian Notes: Configure Vault Path`
3. Select your Obsidian vault folder

### Settings

Configure the extension through VS Code settings:

```json
{
  "obsidianNotes.vaultPath": "/path/to/your/obsidian/vault",
  "obsidianNotes.ignorePatterns": [
    ".obsidian/**",
    "*.tmp",
    ".DS_Store",
    "Thumbs.db"
  ],
  "obsidianNotes.showHiddenFiles": false
}
```

## Usage

### Basic Operations

- **Browse**: Expand folders to see your notes
- **Open**: Click any file to open it in VS Code
- **Create**: Right-click folders to create new files or folders
- **Delete**: Right-click items to delete them
- **Rename**: Right-click items to rename them

### Search

1. Click the search icon in the tree view header
2. Enter your search term
3. Browse results and click to open files at specific lines

### File Management

- **New File**: Click the "+" icon or right-click a folder
- **New Folder**: Click the folder icon or right-click a folder
- **Refresh**: Click the refresh icon to update the tree view

## Commands

- `Obsidian Notes: Configure Vault Path` - Set up your vault location
- `Obsidian Notes: Refresh` - Refresh the tree view
- `Obsidian Notes: Search in Vault` - Search across all notes

## Ignore Patterns

The extension supports glob patterns for ignoring files and folders:

- `*.tmp` - Ignore all temporary files
- `.obsidian/**` - Ignore Obsidian's config folder
- `drafts/` - Ignore specific folders
- `**/*.backup` - Ignore backup files in any folder

## Requirements

- VS Code 1.74.0 or higher
- An Obsidian vault (folder containing your notes)

## Extension Settings

This extension contributes the following settings:

- `obsidianNotes.vaultPath`: Path to your Obsidian vault
- `obsidianNotes.ignorePatterns`: Array of glob patterns to ignore
- `obsidianNotes.showHiddenFiles`: Show hidden files and folders

## Known Issues

- Large vaults may take time to load initially
- Search performance depends on vault size

## Release Notes

### 1.0.0

Initial release with core functionality:
- Vault browsing
- File operations
- Search functionality
- Configuration options

## Contributing

Issues and feature requests are welcome on [GitHub](https://github.com/gsportelli/vscode-obsidian-notes).

## License

MIT License - see LICENSE file for details.