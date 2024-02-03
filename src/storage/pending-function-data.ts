
import * as vscode from 'vscode';
import * as hash from '../utilities/cyrb53';

interface PendingFunctionList {
    bookmarks: PendingFunctionBookmark[];
}

export type BookmarkId = number;

export class PendingFunctionBookmark {
    name: string;
    id: BookmarkId;
    location: vscode.Location;
    createdAt: Date;
    context: string;
    contextLocation: vscode.Location;
    constructor(
        name: string,
        uri: vscode.Uri,
        range: vscode.Range,
        context: string,
        contextUri: vscode.Uri,
        contextRange: vscode.Range
    ) {
        this.name = name;
        this.context = context;
        this.location = new vscode.Location(uri, range);
        this.contextLocation = new vscode.Location(contextUri, contextRange);
        this.createdAt = new Date();
        this.id = hash.cyrb53(
            `${name}${contextUri.toString()}${contextRange.start.line}`
        );
    }
}

type BookmarksEvent = {
    added?: BookmarkId;
    removed?: BookmarkId;
};

export const bookmarksDidChange = new vscode.EventEmitter<BookmarksEvent>();

export class PendingFunctionData {
    storage: vscode.Memento;
    constructor(private context: vscode.ExtensionContext) {
        this.storage = context.workspaceState;
    }

    async getPendingFunctions(): Promise<PendingFunctionBookmark[]> {
        const pendingFunctions = this.storage.get<PendingFunctionList>(`pendingFunctions`, { bookmarks: [] });
        return pendingFunctions.bookmarks;
    }

    async updatePendingFunctions(pendingFunctions: PendingFunctionBookmark[]) {
        const pendingFunctionsList: PendingFunctionList = { bookmarks: pendingFunctions };
        await this.storage.update(`pendingFunctions`, pendingFunctionsList);
    }

    // #TODO: only add if not already present?
    async addPendingFunction(pendingFunction: PendingFunctionBookmark) {
        const pendingFunctions = await this.getPendingFunctions();
        pendingFunction.id = PendingFunctionData.idForBookmark(pendingFunction);
        pendingFunctions.push(pendingFunction);
        await this.updatePendingFunctions(pendingFunctions);
        bookmarksDidChange.fire({added: pendingFunction.id});
    }

    async removePendingFunction(pendingFunction: PendingFunctionBookmark) {
        const pendingFunctions = await this.getPendingFunctions();
        await this.updatePendingFunctions(
            pendingFunctions.filter(
                (bookmark) => bookmark.id !== pendingFunction.id
            )
        );
        bookmarksDidChange.fire({removed: pendingFunction.id});
    }

    static idForBookmark(bookmark: PendingFunctionBookmark): BookmarkId {
        const id = hash.cyrb53(
            `${bookmark.name}${bookmark.contextLocation.uri}${bookmark.contextLocation.range.start.line}`
        );
        return id;
    }
}