import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { BookModel }  from '../models/book-model'

@Injectable()
export class BookService {

  constructor(public http: Http) {
  }

  getall() {
    return this.http.get('data/books.json')
    .map(res => {
      let response = res.json();

      let books: Array<BookModel> = [];

      for (var b of response.books)
        books.push(new BookModel(b.id, b.name, b.shortName, b.chapterAmount));

      return books;
    });
  }

}
