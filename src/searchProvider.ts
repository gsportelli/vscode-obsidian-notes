import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigManager } from './configManager';

const minimatch = require('minimatch');

interface SearchResult {
    file: string;
    line: number;
    content: string;
    context: string;
}

export class SearchProvider {
    constructor(private configManager: ConfigManager) {}

    async showSearchQuickPick(): Promise<void> {
        const vaultPath = this.configManager.getVaultPath();
        
        if (!vaultPath) {
            vscode.window.showErrorMessage('Please configure your Obsidian vault path first');
            return;
        }

        const searchTerm = await vscode.window.showInputBox({
            prompt: 'Search in Obsidian vault',
            placeHolder: 'Enter search term...'
        });

        if (!searchTerm) {
            return;
        }

        // Show progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Searching in vault...',
            cancellable: true
        }, async (progress, token) => {
            const results = await this.searchInVault(searchTerm, progress, token);
            
            if (token.isCancellationRequested) {
                return;
            }

            if (results.length === 0) {
                vscode.window.showInformationMessage(`No results found for "${searchTerm}"`);
                return;
            }

            // Show results in quick pick
            const quickPickItems = results.map(result => ({
                label: path.basename(result.file),
                description: `Line ${result.line}`,
                detail: result.context,
                result: result
            }));

            const selected = await vscode.window.showQuickPick(quickPickItems, {
                placeHolder: `Found ${results.length} results for "${searchTerm}"`,
                matchOnDescription: true,
                matchOnDetail: true
            });

            if (selected) {
                await this.openFileAtLine(selected.result);
            }
        });
    }

    private async searchInVault(
        searchTerm: string, 
        progress: vscode.Progress<{message?: string; increment?: number}>,
        token: vscode.CancellationToken
    ): Promise<SearchResult[]> {
        const vaultPath = this.configManager.getVaultPath();
        const ignorePatterns = this.configManager.getIgnorePatterns();
        const results: SearchResult[] = [];
        
        const files = await this.getAllFiles(vaultPath, ignorePatterns);
        const totalFiles = files.length;
        let processedFiles = 0;

        for (const file of files) {
            if (token.isCancellationRequested) {
                break;
            }

            try {
                const fileResults = await this.searchInFile(file, searchTerm);
                results.push(...fileResults);
                
                processedFiles++;
                progress.report({
                    message: `Searching... (${processedFiles}/${totalFiles})`,
                    increment: (100 / totalFiles)
                });
            } catch (error) {
                console.error(`Error searching file ${file}:`, error);
            }
        }

        return results;
    }

    private async getAllFiles(dirPath: string, ignorePatterns: string[]): Promise<string[]> {
        const files: string[] = [];
        
        const traverse = async (currentPath: string): Promise<void> => {
            try {
                const items = await fs.promises.readdir(currentPath);
                
                for (const item of items) {
                    const fullPath = path.join(currentPath, item);
                    const relativePath = path.relative(this.configManager.getVaultPath(), fullPath);
                    
                    // Check ignore patterns
                    if (this.shouldIgnore(relativePath, ignorePatterns)) {
                        continue;
                    }
                    
                    const stat = await fs.promises.stat(fullPath);
                    
                    if (stat.isDirectory()) {
                        await traverse(fullPath);
                    } else if (this.isSearchableFile(fullPath)) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                console.error(`Error reading directory ${currentPath}:`, error);
            }
        };
        
        await traverse(dirPath);
        return files;
    }

    private isSearchableFile(filePath: string): boolean {
        const ext = path.extname(filePath).toLowerCase();
        const searchableExtensions = ['.md', '.txt', '.json', '.csv', '.html', '.xml'];
        return searchableExtensions.includes(ext);
    }

    private shouldIgnore(relativePath: string, ignorePatterns: string[]): boolean {
        for (const pattern of ignorePatterns) {
            if (minimatch(relativePath, pattern) || minimatch(path.basename(relativePath), pattern)) {
                return true;
            }
        }
        return false;
    }

    private async searchInFile(filePath: string, searchTerm: string): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            const lines = content.split('\n');
            
            const searchRegex = new RegExp(searchTerm, 'gi');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const matches = line.matchAll(searchRegex);
                
                for (const match of matches) {
                    const contextStart = Math.max(0, i - 1);
                    const contextEnd = Math.min(lines.length - 1, i + 1);
                    const context = lines.slice(contextStart, contextEnd + 1).join('\n');
                    
                    results.push({
                        file: filePath,
                        line: i + 1,
                        content: line.trim(),
                        context: context
                    });
                }
            }
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
        }
        
        return results;
    }

    private async openFileAtLine(result: SearchResult): Promise<void> {
        try {
            const document = await vscode.workspace.openTextDocument(result.file);
            const editor = await vscode.window.showTextDocument(document);
            
            // Navigate to the specific line
            const position = new vscode.Position(result.line - 1, 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position));
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open file: ${error}`);
        }
    }
}