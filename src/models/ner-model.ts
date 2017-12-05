import { Injectable } from '@angular/core';

@Injectable()
export class NERModel {

  constructor(public label: string, public spot: string, public thumbnail: string, public uri: string, public confidence: number) {
  }

}
