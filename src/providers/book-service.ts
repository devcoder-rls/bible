import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { BookModel }  from '../models/book-model'

@Injectable()
export class BookService {

  constructor(public http: Http) {
  }

  getAll() {
    return this.http.get('data/books.json')
    .map(res => {
      let response = res.json();

      let books: Array<BookModel> = [];

      for (var b of response.books)
        books.push(new BookModel(b.id, b.name, b.shortName, b.chapterAmount));

      return books;
    });
  }

  get(bookId: string) {
    return this.http.get('data/books.json')
    .map(res => {
      let response = res.json();

      for (var b of response.books) {
        if ( b.id == bookId ) {
          return new BookModel(b.id, b.name, b.shortName, b.chapterAmount);
        }
      }

      return null;
    });
  }
}