import * as vscode from 'vscode';

export class ConfigManager {
    private static readonly VAULT_PATH_KEY = 'obsidianNotes.vaultPath';
    private static readonly IGNORE_PATTERNS_KEY = 'obsidianNotes.ignorePatterns';
    private static readonly SHOW_HIDDEN_FILES_KEY = 'obsidianNotes.showHiddenFiles';

    getVaultPath(): string {
        const config = vscode.workspace.getConfiguration();
        return config.get<string>(ConfigManager.VAULT_PATH_KEY, '');
    }

    async setVaultPath(path: string): Promise<void> {
        const config = vscode.workspace.getConfiguration();
        await config.update(ConfigManager.VAULT_PATH_KEY, path, vscode.ConfigurationTarget.Global);
    }

    getIgnorePatterns(): string[] {
        const config = vscode.workspace.getConfiguration();
        return config.get<string[]>(ConfigManager.IGNORE_PATTERNS_KEY, [
            '.obsidian/**',
            '*.tmp',
            '.DS_Store',
            'Thumbs.db'
        ]);
    }

    getShowHiddenFiles(): boolean {
        const config = vscode.workspace.getConfiguration();
        return config.get<boolean>(ConfigManager.SHOW_HIDDEN_FILES_KEY, false);
    }

    async updateIgnorePatterns(patterns: string[]): Promise<void> {
        const config = vscode.workspace.getConfiguration();
        await config.update(ConfigManager.IGNORE_PATTERNS_KEY, patterns, vscode.ConfigurationTarget.Global);
    }

    async updateShowHiddenFiles(show: boolean): Promise<void> {
        const config = vscode.workspace.getConfiguration();
        await config.update(ConfigManager.SHOW_HIDDEN_FILES_KEY, show, vscode.ConfigurationTarget.Global);
    }
}