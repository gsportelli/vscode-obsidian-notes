import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ObsidianItem } from './obsidianItem';
import { ConfigManager } from './configManager';

const minimatch = require('minimatch');

export class ObsidianProvider implements vscode.TreeDataProvider<ObsidianItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ObsidianItem | undefined | null | void> = new vscode.EventEmitter<ObsidianItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ObsidianItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private configManager: ConfigManager) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ObsidianItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ObsidianItem): Thenable<ObsidianItem[]> {
        const vaultPath = this.configManager.getVaultPath();
        
        if (!vaultPath) {
            return Promise.resolve([]);
        }

        if (!fs.existsSync(vaultPath)) {
            vscode.window.showErrorMessage(`Obsidian vault path does not exist: ${vaultPath}`);
            return Promise.resolve([]);
        }

        if (!element) {
            // Root level
            return Promise.resolve(this.getFilesAndFolders(vaultPath));
        } else {
            // Child elements
            if (element.resourceUri && element.contextValue === 'folder') {
                return Promise.resolve(this.getFilesAndFolders(element.resourceUri.fsPath));
            }
        }

        return Promise.resolve([]);
    }

    private getFilesAndFolders(dirPath: string): ObsidianItem[] {
        const items: ObsidianItem[] = [];
        const ignorePatterns = this.configManager.getIgnorePatterns();
        const showHiddenFiles = this.configManager.getShowHiddenFiles();

        try {
            const files = fs.readdirSync(dirPath);

            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const relativePath = path.relative(this.configManager.getVaultPath(), filePath);

                // Skip hidden files if not configured to show them
                if (!showHiddenFiles && file.startsWith('.')) {
                    continue;
                }

                // Check ignore patterns
                if (this.shouldIgnore(relativePath, ignorePatterns)) {
                    continue;
                }

                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    items.push(new ObsidianItem(
                        file,
                        vscode.TreeItemCollapsibleState.Collapsed,
                        'folder',
                        vscode.Uri.file(filePath)
                    ));
                } else {
                    const collapsibleState = vscode.TreeItemCollapsibleState.None;
                    const item = new ObsidianItem(
                        file,
                        collapsibleState,
                        'file',
                        vscode.Uri.file(filePath)
                    );
                    
                    // Set command to open file on click
                    item.command = {
                        command: 'obsidianNotes.openFile',
                        title: 'Open File',
                        arguments: [item]
                    };

                    items.push(item);
                }
            }
        } catch (error) {
            console.error('Error reading directory:', error);
        }

        // Sort: folders first, then files, both alphabetically
        return items.sort((a, b) => {
            if (a.contextValue === 'folder' && b.contextValue === 'file') {
                return -1;
            }
            if (a.contextValue === 'file' && b.contextValue === 'folder') {
                return 1;
            }
            return (a.label as string).localeCompare(b.label as string);
        });
    }

    private shouldIgnore(relativePath: string, ignorePatterns: string[]): boolean {
        for (const pattern of ignorePatterns) {
            if (minimatch(relativePath, pattern) || minimatch(path.basename(relativePath), pattern)) {
                return true;
            }
        }
        return false;
    }

    async createFile(parentItem: ObsidianItem | undefined, fileName: string): Promise<void> {
        const vaultPath = this.configManager.getVaultPath();
        let targetDir = vaultPath;

        if (parentItem && parentItem.resourceUri && parentItem.contextValue === 'folder') {
            targetDir = parentItem.resourceUri.fsPath;
        }

        // Ensure .md extension for markdown files
        if (!fileName.includes('.')) {
            fileName += '.md';
        }

        const filePath = path.join(targetDir, fileName);

        if (fs.existsSync(filePath)) {
            throw new Error(`File already exists: ${fileName}`);
        }

        await fs.promises.writeFile(filePath, '');
        this.refresh();

        // Open the new file
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document);
    }

    async createFolder(parentItem: ObsidianItem | undefined, folderName: string): Promise<void> {
        const vaultPath = this.configManager.getVaultPath();
        let targetDir = vaultPath;

        if (parentItem && parentItem.resourceUri && parentItem.contextValue === 'folder') {
            targetDir = parentItem.resourceUri.fsPath;
        }

        const folderPath = path.join(targetDir, folderName);

        if (fs.existsSync(folderPath)) {
            throw new Error(`Folder already exists: ${folderName}`);
        }

        await fs.promises.mkdir(folderPath, { recursive: true });
        this.refresh();
    }

    async deleteItem(item: ObsidianItem): Promise<void> {
        if (!item.resourceUri) {
            throw new Error('No resource URI found for item');
        }

        // Use VS Code's workspace.fs.delete with useTrash option
        await vscode.workspace.fs.delete(item.resourceUri, { 
            recursive: true, 
            useTrash: true 
        });

        this.refresh();
    }

    async renameItem(item: ObsidianItem, newName: string): Promise<void> {
        if (!item.resourceUri) {
            throw new Error('No resource URI found for item');
        }

        const oldPath = item.resourceUri.fsPath;
        const newPath = path.join(path.dirname(oldPath), newName);

        if (fs.existsSync(newPath)) {
            throw new Error(`Item with name "${newName}" already exists`);
        }

        await fs.promises.rename(oldPath, newPath);
        this.refresh();
    }
}