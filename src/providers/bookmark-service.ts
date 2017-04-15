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

  // Hold the ...
  //
  // Sample:
  // [
  //   { "id": "#264653", "name": "Ler mais tarde", "bookmarkCount": 2 },
  //   { "id": "#2A9D8F", "name": "Favorito", "bookmarkCount": 1 },
  //   { "id": "#E9C46A", "name": "Interessante", "bookmarkCount": 0 }
  // ]
  private BOOKMARK_LISTS_KEY: string = 'bookmark-lists';

  // Hold the ..
  //
  // Sample:
  // [
  //   { "id": "6d850a61-ab38-483a-9c24-87b3b68f0115", "bookId": "genesis", "bookShortName": "Gênesis", "chapterNumber": 1, "versesNumber": [1], "shortText": "No princípio, criou Deus os céus e a terra." },
  //   { "id": "5f34c9d2-81ce-4e9f-8434-8a073d23d812", "bookId": "genesis", "bookShortName": "Gênesis", "chapterNumber": 1, "versesNumber": [5], "shortText": "Chamou Deus à luz Dia e às trevas, Noite. Houve tarde e manhã, o primeiro dia." }
  // ]
  private BOOKMARKS_KEY: string = 'bookmarks-';

  // Hold the ...
  //
  // Sample:
  // {
  //  "genesis": {
  //    3: {
  //      1: ["#AAAAAA", "#BBBBBB"]
  //    }
  //  }, 
  //  "joao": {
  //    13: {
  //      4: ["#CCCCCC"],
  //      34: ["#DDDDDD"]
  //    }
  //  }
  // }
  private BOOKMARKS_INDEX_KEY: string = 'bookmarks-index';

  constructor(private storage: Storage) {
  }

  getLists() {
    return this.storage.get(this.BOOKMARK_LISTS_KEY)
      .then(data => {
        let lists: Array<BookmarkListModel> = [];

        if (data == null)
          data = this._getDefaultLists();

        for (var bookmarkList of data)
          lists.push(new BookmarkListModel(bookmarkList.id, bookmarkList.name, bookmarkList.bookmarkCount));

        return lists;
      }
    );
  }

  getBookmarks(listId: string) {
    return this.storage.get(this.BOOKMARKS_KEY + listId)
      .then(data => {
        let bookmarks: Array<BookmarkModel> = [];

        if (data != null) {
          for (var bookmark of data)
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

        this.storage.set(this.BOOKMARKS_KEY + listId, bookmarks);

        this._changeBookmarkCount(listId, +1);

        this._addIndex(chapter.book.id, chapter.number, versesNumber, listId);
      });
  }

  removeBookmark(listId: string, bookmark: BookmarkModel) {
    return this.getBookmarks(listId)
      .then(bookmarks => {

        bookmarks = bookmarks.filter(b => b.id != bookmark.id);

        this.storage.set(this.BOOKMARKS_KEY + listId, bookmarks);

        this._changeBookmarkCount(listId, -1);

        this._removeIndex(bookmark.bookId, bookmark.chapterNumber, bookmark.versesNumber, listId);
      });
  }

  getIndex(bookId: string, chapterNumber: number) {
    return this.storage.get(this.BOOKMARKS_INDEX_KEY)
      .then(data => {
        if (data == null)
          return null;

        if (data[bookId] == null)
          return null;

        return data[bookId][chapterNumber];
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

        this.storage.set(this.BOOKMARK_LISTS_KEY, lists);
      });
  }

  _addIndex(bookId: string, chapterNumber: number, versesNumber: number[], listId: string) {
    return this.storage.get(this.BOOKMARKS_INDEX_KEY)
      .then(data => {
        if (data == null)
          data = {};

        if (data[bookId] == null)
          data[bookId] = {};

        if (data[bookId][chapterNumber] == null)
          data[bookId][chapterNumber] = {};

        for (let verseNumber of versesNumber) {
          if (data[bookId][chapterNumber][verseNumber] == null)
            data[bookId][chapterNumber][verseNumber] = [];

          data[bookId][chapterNumber][verseNumber].push(listId);
        }

        this.storage.set(this.BOOKMARKS_INDEX_KEY, data);
      });
  }

  _removeIndex(bookId: string, chapterNumber: number, versesNumber: number[], listId: string) {
    return this.storage.get(this.BOOKMARKS_INDEX_KEY)
      .then(data => {
        if (data == null)
          return;

        for (let verseNumber of versesNumber) {
          var index = data[bookId][chapterNumber][verseNumber].indexOf(listId, 0);

          if (index > -1)
            data[bookId][chapterNumber][verseNumber].splice(index, 1);

          if (data[bookId][chapterNumber][verseNumber].length == 0)
            delete data[bookId][chapterNumber][verseNumber];
        }

        // If has no verses in chapter map, remove it
        if (Object.keys(data[bookId][chapterNumber]).length === 0 
          && data[bookId][chapterNumber].constructor === Object)
          delete data[bookId][chapterNumber];

        // If has no chapters in book map, remove it
        if (Object.keys(data[bookId]).length === 0 
          && data[bookId].constructor === Object)
          delete data[bookId];

        this.storage.set(this.BOOKMARKS_INDEX_KEY, data);
      });
  }

  _getDefaultLists() {
    // next color #E76F51
    return [
      {"id": "#264653", "name": "Ler mais tarde", "bookmarkCount": 0},
      {"id": "#2A9D8F", "name": "Favorito", "bookmarkCount": 0},
      {"id": "#E9C46A", "name": "Interessante", "bookmarkCount": 0},
      {"id": "#F4A261", "name": "Inspirador", "bookmarkCount": 0}
    ];
  }
}