
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
    return Array.from(this._selectedVerses.keys()).sort((v1, v2) => v1.number - v2.number);
  }

  length() {
    return this._selectedVerses.size;
  }

  formatVersesNumbers() {
    let numbers = this.getVerses().map((verse) => verse.number);

    let groups = [[numbers.shift()]];

    for (let n of numbers) {
      let lastGroup = groups[groups.length-1];

      if (lastGroup[lastGroup.length-1] == n-1) {
        lastGroup.push(n);
      } else {
        groups.push([n]);
      }
    }

    let groups2 = groups.map((g) => {
      if (g.length == 1) return g[0];
      if (g.length == 2) return g[0] + ", " + g[g.length-1];

      return g[0] + " a " + g[g.length-1];
    });

    let lastGroup = groups2.pop();    
    let versesNumbers = "";

    if (groups2.length > 0)
      versesNumbers = groups2.join(", ") + " e ";

    versesNumbers += lastGroup;

    return versesNumbers;
  }
}
