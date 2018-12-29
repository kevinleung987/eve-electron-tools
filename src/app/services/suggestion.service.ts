import { Injectable } from '@angular/core';
import matchSorter from 'match-sorter';
import { UniverseService } from 'src/app/services/universe.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SuggestionService {

  typeNames: string[] = [];
  groupNames: string[] = [];
  systemNames: string[] = [];
  regionNames: string[] = [];

  constructor(private universe: UniverseService) {
    this.loadSuggestions(this.universe.typeNames, this.typeNames, 'typeNames');
    this.loadSuggestions(this.universe.groupNames, this.groupNames, 'groupNames');
    this.loadSuggestions(this.universe.systemNames, this.systemNames, 'systemNames');
    this.loadSuggestions(this.universe.regionNames, this.regionNames, 'regionNames');
  }

  loadSuggestions(source: BehaviorSubject<any>, target: string[], name: string) {
    const subscription = source.subscribe((result) => {
      if (result) {
        target.push.apply(target, Object.keys(result));
        console.log(name + ' loaded.', target.length, 'suggestions.');
        subscription.unsubscribe();
      }
    });
  }

  suggest(items: any[], value: any, num: number) {
    const startTime = Date.now();
    if (items == null || value == null || value.length < 1) { return null; }
    const result = matchSorter(items, value).slice(0, num);
    console.log((Date.now() - startTime) / 1000);
    return result;
  }
}
