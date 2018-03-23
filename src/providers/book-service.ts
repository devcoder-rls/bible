import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

import { BookModel }  from '../models/book-model'

@Injectable()
export class BookService {

  constructor(public http: HttpClient) {
  }

  getAll() {
    return this.http.get('data/books.json')
    .map(res => {
      let books: Array<BookModel> = [];

      for (var b of res['books'])
        books.push(new BookModel(b.id, b.name, b.shortName, b.abbr, b.chapterAmount));

      return books;
    });
  }

  get(bookId: string) {
    return this.http.get('data/books.json')
    .map(res => {
      for (var b of res['books']) {
        if ( b.id == bookId ) {
          return new BookModel(b.id, b.name, b.shortName, b.abbr, b.chapterAmount);
        }
      }

      return null;
    });
  }
}