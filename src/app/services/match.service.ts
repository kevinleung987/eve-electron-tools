import { Injectable } from '@angular/core';
import matchSorter, { rankings, caseRankings } from 'match-sorter';
import { UniverseService } from './universe.service';
@Injectable({ providedIn: 'root' })
export class MatchService {

  typeNames: string[];
  constructor(private universe: UniverseService) {
    this.typeNames = universe.typeNames.value;
    universe.typeNames.subscribe((result) => {
      if (result) {
        this.typeNames = Object.keys(result);
        this.typeNames.sort();
      }
    });
  }
  autoComplete(value: any, num: number) {
    const startTime = Date.now();
    if (this.typeNames == null || value == null || value.length < 1) {
      return null;
    }
    const result = matchSorter(this.typeNames, value).slice(0, num);
    console.log((Date.now() - startTime) / 1000);
    return result;
  }
}
