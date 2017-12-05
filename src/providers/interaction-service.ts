import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

import { NERModel }  from '../models/ner-model'

@Injectable()
export class InteractionService {

  constructor(public http: HttpClient) {
  }

  get(bookid: string, chapterNumber: number, verseNumbers: any[]) {
    return this.http.get('data/ner/'+ bookid + '/' + chapterNumber + '.json')
    .map(res => {
      let entities: Array<NERModel> = [];

      for (var verse of res['verses']) {
        if (verseNumbers.indexOf(verse.number) == -1)
          continue;

        for (var e of verse.entities)
          entities.push(new NERModel(e.label, e.spot, e.thumbnail, e.uri, e.confidence));
      }

      console.log('entities', entities);

      return entities;
    });
  }
}