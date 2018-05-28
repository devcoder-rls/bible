import { BookModel }  from './book-model'
import { VerseModel }  from './chapter-model'

export class SearchResultModel {

  constructor(public book: BookModel, public chapterNumber: number, public verse: VerseModel) {
  }

}
