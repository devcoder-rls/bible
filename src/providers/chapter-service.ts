import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { BookModel }  from '../models/book-model'
import { ChapterModel, VerseModel }  from '../models/chapter-model'

@Injectable()
export class ChapterService {

  constructor(public http: Http) {
  }

  get(book: BookModel, number: number) {
    return this.http.get('data/' + book.id + '/' + number + '.json')
    .map(res => {       
      let response = res.json();

      let verses: Array<VerseModel> = [];

      for (var v of response.verses)
        verses.push(new VerseModel(v.number, v.text));

      return new ChapterModel(book, number, verses);
    });
  }

}
