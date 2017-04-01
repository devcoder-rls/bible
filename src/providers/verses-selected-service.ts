
import { VerseModel }  from '../models/chapter-model'

export class VersesSelectedService {

  _selectedVerses: Map<VerseModel, HTMLElement>;

  constructor() {
    this._selectedVerses = new Map<VerseModel, HTMLElement>();
  }

  addVerse(model: VerseModel, element: HTMLElement) {
    this._selectedVerses.set(model, element);
  }

  removeVerse(model: VerseModel) {
    this._selectedVerses.delete(model);
  }

  get(model: VerseModel) : HTMLElement {
    return this._selectedVerses.get(model);
  }

  contains(model: VerseModel) : boolean {
    return this._selectedVerses.has(model);
  }

  getVerses() : VerseModel[] {
    // Order by verse's number
    return Array.from(this._selectedVerses.keys()).sort((v1, v2) => Number(v1.number) - Number(v2.number));
  }

  length() {
    return this._selectedVerses.size;
  }
}
