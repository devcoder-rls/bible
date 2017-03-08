import { Injectable } from '@angular/core';

import { BookModel }  from './book-model'

export class VerseModel {
  constructor(public number: number, public text: string ) {
  }
}

@Injectable()
export class ChapterModel {

  constructor(public book: BookModel, public number: number, public verses: VerseModel[] ) {
  }

}
