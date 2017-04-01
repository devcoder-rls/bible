import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { BookmarkListModel, BookmarkModel }  from '../models/bookmark-list-model'
import { ChapterModel, VerseModel }  from '../models/chapter-model'

class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }
}

@Injectable()
export class BookmarkService {

  // To know pallet color see https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51

  private BOOKMARK_LISTS_KEY: string = 'bookmarkLists';
  private BOOKMARKS_KEY: string = 'bookmarks-';

  constructor(private storage: Storage) {
  }

  getLists() {
    return this.storage.get(this.BOOKMARK_LISTS_KEY)
      .then(data => {
        let lists: Array<BookmarkListModel> = [];

        data = (data != null) ? JSON.parse(data) : this._getDefaultLists();

        for (var bookmarkList of data)
          lists.push(new BookmarkListModel(bookmarkList.id, bookmarkList.name, bookmarkList.color, bookmarkList.bookmarkCount));

        return lists;
      }
    );
  }

  addList(name: string) {
    return this.getLists()
      .then(lists => {

        let color = "#000000"; // TODO: Define a color
        lists.push(new BookmarkListModel(Guid.newGuid(), name, color, 0));

        this.storage.set(this.BOOKMARK_LISTS_KEY, JSON.stringify(lists));
      });
  }

  removeList(list: BookmarkListModel) {
    return this.getLists()
      .then(lists => {

        lists = lists.filter(l => l.id != list.id);

        this.storage.set(this.BOOKMARK_LISTS_KEY, JSON.stringify(lists));
      });
  }

  getBookmarks(listId: string) {
    return this.storage.get(this.BOOKMARKS_KEY + listId)
      .then(data => {
        let bookmarks: Array<BookmarkModel> = [];

        if (data != null) {
          for (var bookmark of JSON.parse(data))
            bookmarks.push(new BookmarkModel(bookmark.id, bookmark.bookId, bookmark.bookShortName, bookmark.chapterNumber, bookmark.versesNumber, bookmark.shortText));
        }

        return bookmarks;
      });
  }

  addBookmark(listId: string, chapter: ChapterModel, verses: VerseModel[]) {
    if (verses.length == 0)
      return;

    return this.getBookmarks(listId)
      .then(bookmarks => {

        let versesNumber : Array<number> = verses.map(function(verse) { return Number(verse.number) });
        bookmarks.push(new BookmarkModel(Guid.newGuid(), chapter.book.id, chapter.book.shortName, chapter.number, versesNumber, verses[0].text));

        this.storage.set(this.BOOKMARKS_KEY + listId, JSON.stringify(bookmarks));

        this._changeBookmarkCount(listId, +1);
      });
  }

  removeBookmark(listId: string, bookmark: BookmarkModel) {
    return this.getBookmarks(listId)
      .then(bookmarks => {

        bookmarks = bookmarks.filter(b => b.id != bookmark.id);

        this.storage.set(this.BOOKMARKS_KEY + listId, JSON.stringify(bookmarks));

        this._changeBookmarkCount(listId, -1);
      });
  }

  _changeBookmarkCount(listId: string, value: number) {
    this.getLists()
      .then(lists => {
        
        for(let list of lists) {
          if (list.id == listId) {
            list.bookmarkCount += value;
            break;
          }
        }

        this.storage.set(this.BOOKMARK_LISTS_KEY, JSON.stringify(lists));
      });
  }

  _getDefaultLists() {
    // next color #E76F51
    return [
      {"id": "K3hfdhjf94h49fj", "name": "Ler mais tarde", "color": "#264653", "bookmarkCount": 0},
      {"id": "Ngj49fhfdnSDh3s", "name": "Favorito", "color": "#2A9D8F", "bookmarkCount": 0},
      {"id": "Lej39fh49rhxs0D", "name": "Interessante", "color": "#E9C46A", "bookmarkCount": 0},
      {"id": "dh39fhf9HaPs9Sh", "name": "Inspirador", "color": "#F4A261", "bookmarkCount": 0}
    ];
  }
}