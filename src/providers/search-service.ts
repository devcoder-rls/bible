import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Platform } from 'ionic-angular';

import { BookService }  from './book-service'
import { ChapterService }  from './chapter-service'

import { SearchResultModel }  from '../models/searchresult-model'

declare var window: any;

@Injectable()
export class SearchService {

  constructor(public platform: Platform, public bookService: BookService, public chapterService: ChapterService) {
  }

  search(keyword) {
    console.log('searchall', keyword);

    if (keyword == undefined || keyword.trim() == "" || keyword.trim().length < 3)
    {
      return Observable.create(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    if (this.platform.is('android') && this.platform.is('cordova')) {
      return this._searchNative(keyword);
    }

    let self = this;
    keyword = keyword.toLowerCase();

    return Observable.create(observer => {

      self.bookService.getAll()
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

  _searchNative(keyword) {
    let start = Date.now();

    return Observable.create(observer => {

      window.plugins.BibleSearch.search(keyword, 
        function(data) {
          let results: Array<SearchResultModel> = [];

          for (var result of data)
            results.push(new SearchResultModel(result.book, result.chapterNumber, result.verse));

          let end = Date.now();

          console.log('Duration', end - start, 'Count', results.length);

          observer.next(results);
          observer.complete();
        }, function(err) {
          observer.error(err);
        });

    });
  }
}
