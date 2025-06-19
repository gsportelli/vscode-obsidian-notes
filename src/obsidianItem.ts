import * as vscode from 'vscode';
import * as path from 'path';

export class ObsidianItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string,
        public readonly resourceUri?: vscode.Uri
    ) {
        super(label, collapsibleState);

        this.tooltip = this.resourceUri ? this.resourceUri.fsPath : this.label;
        this.contextValue = contextValue;

        if (this.resourceUri) {
            if (contextValue === 'folder') {
                this.iconPath = new vscode.ThemeIcon('folder');
            } else {
                // Set appropriate icon based on file extension
                const ext = path.extname(this.resourceUri.fsPath).toLowerCase();
                switch (ext) {
                    case '.md':
                        this.iconPath = new vscode.ThemeIcon('markdown');
                        break;
                    case '.txt':
                        this.iconPath = new vscode.ThemeIcon('file-text');
                        break;
                    case '.json':
                        this.iconPath = new vscode.ThemeIcon('json');
                        break;
                    case '.pdf':
                        this.iconPath = new vscode.ThemeIcon('file-pdf');
                        break;
                    case '.png':
                    case '.jpg':
                    case '.jpeg':
                    case '.gif':
                    case '.webp':
                        this.iconPath = new vscode.ThemeIcon('file-media');
                        break;
                    default:
                        this.iconPath = new vscode.ThemeIcon('file');
                        break;
                }
            }
        }
    }
}