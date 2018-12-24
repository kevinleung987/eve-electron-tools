import { Injectable } from '@angular/core';
import matchSorter, { rankings, caseRankings } from 'match-sorter';
import { UniverseService } from './universe.service';
@Injectable({ providedIn: 'root' })
export class MatchService {

  typeNames: string[];
  constructor(private universe: UniverseService) {
    this.universe.typeNames.subscribe((result) => {
      if (result) {
        this.typeNames = Object.keys(result);
        this.typeNames.sort();
      }
    });
  }
  autoComplete(items: any[], value: any, num: number) {
    const startTime = Date.now();
    if (items == null || value == null || value.length < 1) {
      return null;
    }
    const result = matchSorter(items, value).slice(0, num);
    console.log((Date.now() - startTime) / 1000);
    return result;
  }
}
