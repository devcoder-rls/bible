import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { BookModel }  from '../models/book-model'
import { ChapterModel, PassageModel, VerseModel }  from '../models/chapter-model'

@Injectable()
export class ChapterService {

  constructor(public http: Http) {
  }

  get(book: BookModel, number: number) {
    return this.http.get('data/' + book.id + '/' + number + '.json')
    .map(res => {       
      let response = res.json();

      let passages: Array<PassageModel> = [];

      for (var p of response.content) {
        let verses: Array<VerseModel> = [];

        for (var v of p.verses)
          verses.push(new VerseModel(v.number, v.text));

        passages.push(new PassageModel(p.text, verses));
      }

      return new ChapterModel(book, number, passages);
    });
  }

}
