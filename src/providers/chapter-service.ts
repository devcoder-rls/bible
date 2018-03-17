import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { BookmarkService } from './bookmark-service'

import { BookModel }  from '../models/book-model'
import { ChapterModel, PassageModel, VerseModel }  from '../models/chapter-model'

@Injectable()
export class ChapterService {

  constructor(public http: HttpClient, public bookmarkService: BookmarkService) {
  }

  get(book: BookModel, number: number) {
    return Observable.forkJoin([
      this.http.get('data/' + book.id + '/' + number + '.json')      
        .map(res => {
          let passages: Array<PassageModel> = [];

          for (let p of res['content']) {
            let verses: Array<VerseModel> = [];

            for (let v of p.verses)
              verses.push(new VerseModel(Number(v.number), v.text, []));

            passages.push(new PassageModel(p.text, verses));
          }

          return new ChapterModel(book, number, passages);
        }),
      this.bookmarkService.getIndex(book.id, number)
    ])
    // Unify chapter and bookmarks result, 
    // where:
    //   res[0] => chapter
    //   res[1] => bookmarks index
    .map( res => {
      let chapter = res[0], bookmarks = res[1];

      if (bookmarks == null)
        return chapter;

      for (let passage of chapter.passages) {
        for (let verse of passage.verses) {

          if (bookmarks[verse.number] == null)
            continue;

          // Set bookmarks and remove duplicates values
          verse.bookmarks = bookmarks[verse.number].filter(function (value, index, self) { return self.indexOf(value) === index });
        }
      }

      return chapter;
    });
  }

}
