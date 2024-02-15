
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
    removed?: BookmarkId | BookmarkId[];
};

export const bookmarksDidChange = new vscode.EventEmitter<BookmarksEvent>();

export class PendingFunctionData {
    storage: vscode.Memento;
    constructor(private context: vscode.ExtensionContext) {
        this.storage = context.workspaceState;
    }

    public async getPendingFunctions(): Promise<PendingFunctionBookmark[]> {
        const pendingFunctions = this.storage.get<PendingFunctionList>(`pendingFunctions`, { bookmarks: [] });
        return pendingFunctions.bookmarks;
    }

    public async updatePendingFunctions(pendingFunctions: PendingFunctionBookmark[]) {
        const pendingFunctionsList: PendingFunctionList = { bookmarks: pendingFunctions };
        await this.storage.update(`pendingFunctions`, pendingFunctionsList);
    }

    // #TODO: only add if not already present?
    public async addPendingFunction(pendingFunction: PendingFunctionBookmark) {
        const pendingFunctions = await this.getPendingFunctions();
        pendingFunction.id = PendingFunctionData.idForBookmark(pendingFunction);
        pendingFunctions.push(pendingFunction);
        await this.updatePendingFunctions(pendingFunctions);
        bookmarksDidChange.fire({ added: pendingFunction.id });
    }

    public async removePendingFunctionWithId(id: BookmarkId) {
        const pendingFunctions = await this.getPendingFunctions();
        await this.updatePendingFunctions(
            pendingFunctions.filter(
                (bookmark) => bookmark.id !== id
            )
        );
        bookmarksDidChange.fire({ removed: id });
    }

    public async clearPendingFunctions() {
        const ids = await this.getPendingFunctions().then(
            bookmarks => {
                bookmarks.map((bookmark) => bookmark.id);
            }
        );
        await this.updatePendingFunctions([]);
        bookmarksDidChange.fire({ removed: -1 });
    }

    static idForBookmark(bookmark: PendingFunctionBookmark): BookmarkId {
        const id = hash.cyrb53(
            `${bookmark.name}${bookmark.contextLocation.uri}${bookmark.contextLocation.range.start.line}`
        );
        return id;
    }
}