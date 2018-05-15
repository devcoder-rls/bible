import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

import { AmplifyService }  from 'aws-amplify-angular';

import { NERModel }  from '../models/ner-model'

@Injectable()
export class InteractionService {

  constructor(public http: HttpClient, public amplify: AmplifyService) {
  }

  get(bookid: string, chapterNumber: number, verseNumbers: any[]) {
    return this.amplify.api().get('BibleInteractionAPI', '/data/'+ bookid + '/' + chapterNumber, {})
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