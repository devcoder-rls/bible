
import { BookModel }  from './book-model'

export class LastBookVisitedModel {

  constructor(public book: BookModel, public chapterNumber: number) {
  }

}