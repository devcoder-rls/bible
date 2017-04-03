import { Injectable } from '@angular/core';

import { BookModel }  from './book-model'

export class VerseModel {
  constructor( public number: number, public text: string, public bookmarks: string[] ) {
  }
}

export class PassageModel {
  constructor( public name: string, public verses: VerseModel[] ) {
  }
}

@Injectable()
export class ChapterModel {

  constructor( public book: BookModel, public number: number, public passages: PassageModel[] ) {
  }

}
