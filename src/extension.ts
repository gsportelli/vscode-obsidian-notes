import * as vscode from 'vscode';
import { ObsidianProvider } from './obsidianProvider';
import { ConfigManager } from './configManager';
import { SearchProvider } from './searchProvider';

export function activate(context: vscode.ExtensionContext) {
    const configManager = new ConfigManager();
    const obsidianProvider = new ObsidianProvider(configManager);
    const searchProvider = new SearchProvider(configManager);

    // Register tree data provider
    const treeView = vscode.window.createTreeView('obsidianNotes', {
        treeDataProvider: obsidianProvider,
        showCollapseAll: true
    });

    // Update context based on vault configuration
    const updateContext = () => {
        const vaultPath = configManager.getVaultPath();
        vscode.commands.executeCommand('setContext', 'obsidianVaultConfigured', !!vaultPath);
    };

    updateContext();

    // Register commands
    const commands = [
        vscode.commands.registerCommand('obsidianNotes.refresh', () => {
            obsidianProvider.refresh();
        }),

        vscode.commands.registerCommand('obsidianNotes.configureVault', async () => {
            const result = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Select Obsidian Vault Folder'
            });

            if (result && result[0]) {
                await configManager.setVaultPath(result[0].fsPath);
                updateContext();
                obsidianProvider.refresh();
                vscode.window.showInformationMessage(`Obsidian vault configured: ${result[0].fsPath}`);
            }
        }),

        vscode.commands.registerCommand('obsidianNotes.openFile', (item) => {
            if (item && item.resourceUri) {
                vscode.window.showTextDocument(item.resourceUri);
            }
        }),

        vscode.commands.registerCommand('obsidianNotes.createFile', async (item) => {
            const fileName = await vscode.window.showInputBox({
                prompt: 'Enter file name',
                placeHolder: 'note.md'
            });

            if (fileName) {
                try {
                    await obsidianProvider.createFile(item, fileName);
                    vscode.window.showInformationMessage(`Created file: ${fileName}`);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to create file: ${error}`);
                }
            }
        }),

        vscode.commands.registerCommand('obsidianNotes.createFolder', async (item) => {
            const folderName = await vscode.window.showInputBox({
                prompt: 'Enter folder name',
                placeHolder: 'New Folder'
            });

            if (folderName) {
                try {
                    await obsidianProvider.createFolder(item, folderName);
                    vscode.window.showInformationMessage(`Created folder: ${folderName}`);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to create folder: ${error}`);
                }
            }
        }),

        vscode.commands.registerCommand('obsidianNotes.deleteItem', async (item) => {
            if (!item) return;

            const answer = await vscode.window.showWarningMessage(
                `Are you sure you want to delete "${item.label}"?`,
                'Yes', 'No'
            );

            if (answer === 'Yes') {
                try {
                    await obsidianProvider.deleteItem(item);
                    vscode.window.showInformationMessage(`Deleted: ${item.label}`);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to delete: ${error}`);
                }
            }
        }),

        vscode.commands.registerCommand('obsidianNotes.renameItem', async (item) => {
            if (!item) return;

            const newName = await vscode.window.showInputBox({
                prompt: 'Enter new name',
                value: item.label as string
            });

            if (newName && newName !== item.label) {
                try {
                    await obsidianProvider.renameItem(item, newName);
                    vscode.window.showInformationMessage(`Renamed to: ${newName}`);
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to rename: ${error}`);
                }
            }
        }),

        vscode.commands.registerCommand('obsidianNotes.search', async () => {
            await searchProvider.showSearchQuickPick();
        })
    ];

    // Register configuration change listener
    const configChangeListener = vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('obsidianNotes')) {
            updateContext();
            obsidianProvider.refresh();
        }
    });

    // Add to context subscriptions
    context.subscriptions.push(
        treeView,
        configChangeListener,
        ...commands
    );

    // Show welcome message if vault not configured
    if (!configManager.getVaultPath()) {
        vscode.window.showInformationMessage(
            'Configure your Obsidian vault to get started',
            'Configure Vault'
        ).then(selection => {
            if (selection === 'Configure Vault') {
                vscode.commands.executeCommand('obsidianNotes.configureVault');
            }
        });
    }
}

export function deactivate() {}