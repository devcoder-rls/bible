import { Injectable } from '@angular/core';

import { BookModel }  from './book-model'
import { VerseModel }  from './chapter-model'

@Injectable()
export class SearchResultModel {

  constructor(public book: BookModel, public chapterNumber: number, public verse: VerseModel) {
  }

}
