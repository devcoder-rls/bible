import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { BookService }  from './book-service'
import { ChapterService }  from './chapter-service'

import { SearchResultModel }  from '../models/searchresult-model'

@Injectable()
export class SearchService {

  constructor(public bookService: BookService, public chapterService: ChapterService) {
  }

  searchall(keyword) {
    console.log("Searching for '" + keyword + "'");

    if (keyword == undefined || keyword.trim() == "")
    {
      return Observable.create(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    keyword = keyword.toLowerCase();

    let self = this;

    return Observable.create(observer => {

      self.bookService.getall()
      .subscribe(
        books => {

          let observables = [];
          let results: Array<SearchResultModel> = [];

          for(var book of books) {
            for (var i = 1; i <= book.chapterAmount; i++) {

              observables.push(
                self.chapterService.get(book, i)
                .map(
                  chapter => {
                    for(var passage of chapter.passages) {
                      for(var verse of passage.verses) {
                        if (verse.text.toLowerCase().includes(keyword))
                          results.push(new SearchResultModel(chapter.book, chapter.number, verse));
                      }
                    }
                  })
                );

            }
          }

          Observable.forkJoin(observables)
          .subscribe(
            x => {
              observer.next(results);
              observer.complete();
            },
            err => observer.error(err)
          );
        }
      );

    });
  }
}
