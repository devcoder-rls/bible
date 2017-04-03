import { Injectable } from '@angular/core';

@Injectable()
export class BookmarkListModel {

  constructor(public id: string, public name: string, public bookmarkCount: number) {
  }

}

@Injectable()
export class BookmarkModel {

  constructor(public id: string, public bookId: string, public bookShortName: string, public chapterNumber: number, public versesNumber: Array<number>, public shortText: string) {
  }

}
