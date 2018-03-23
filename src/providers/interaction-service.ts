import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from 'aws-amplify';
import 'rxjs/add/operator/map';

import { NERModel }  from '../models/ner-model'

@Injectable()
export class InteractionService {

  constructor(public http: HttpClient) {
  }

  get(bookid: string, chapterNumber: number, verseNumbers: any[]) {
    return API.get('BibleInteractionAPI', '/data/'+ bookid + '/' + chapterNumber, { response: true })
    .then(res => {
      let entities: Array<NERModel> = [];

      // Used to evict duplicated entities
      let entityLabels: Array<string> = [];

      for (var verse of res['verses']) {
        if (verseNumbers.indexOf(verse.number) == -1)
          continue;

        for (var e of verse.entities) {
          if (entityLabels.indexOf(e.label) == -1) {
            entityLabels.push(e.label);
            entities.push(new NERModel(e.label, e.image, e.uri, e.spot, e.confidence));
          }
        }
      }

      // Sort the entities by label
      entities.sort(function (e1, e2) {
        if (e1.label < e2.label) return -1;
        if (e1.label > e2.label) return 1;
        return 0;
      });

      return entities;
    });
  }
}