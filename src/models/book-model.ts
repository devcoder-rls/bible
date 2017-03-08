import { Injectable } from '@angular/core';

@Injectable()
export class BookModel {

  constructor(public id: string, public name: string, public shortName: string, public chapterAmount: number) {
  }

}
