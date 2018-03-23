import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { LastBookVisitedModel }  from '../models/last-book-visited-model'
import { BookModel }  from '../models/book-model'

@Injectable()
export class LastBookVisitedService {

  private LAST_BOOK_KEY: string = "last-book";

  constructor(private storage: Storage) {
  }

  getLastBook() {  
    return this.storage.get(this.LAST_BOOK_KEY)
      .then(data => {
        if (data != null) {
          return new LastBookVisitedModel(data.book, data.chapterNumber);
        }
        else {
          return this._getFirstBook();
        }
      }
    );
  }

  setLastBook(book: BookModel, chapterNumber: number) {
    let lastBook = new LastBookVisitedModel(book, chapterNumber);
    this.storage.set(this.LAST_BOOK_KEY, lastBook);
  }

  _getFirstBook() {
    return new LastBookVisitedModel(new BookModel('genesis', 'Gênesis', 'Gênesis', 'Gn', 50), 1);
  }
}