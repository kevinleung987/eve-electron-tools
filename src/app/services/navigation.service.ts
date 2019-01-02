import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Papa, PapaParseResult } from 'ngx-papaparse';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { UniverseService } from './universe.service';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  fileName = 'mapSolarSystemJumps.csv';
  jumps = {};
  ready = new BehaviorSubject(false);

  constructor(private http: HttpClient, private papa: Papa, private universe: UniverseService) {
    this.http.get('./assets/' + this.fileName, { responseType: 'text' })
      .pipe(map((data: any) => data))
      .subscribe((data: any) => {
        this.papa.parse(data, {
          header: true,
          complete: (result: PapaParseResult) => {
            // Map other columns as fields for the specified key
            const tempData = {};
            result.data.forEach(element => {
              if (tempData[element['fromSolarSystemID']]) {
                tempData[element['fromSolarSystemID']].push(element['toSolarSystemID']);
              } else {
                tempData[element['fromSolarSystemID']] = [element['toSolarSystemID']];
              }
            });
            this.jumps = tempData;
            this.ready.next(true);
          }
        });
      }, error => console.error(error));
    this.ready.subscribe((result) => {
      if (result) {
        // this.universe.waitUntilLoaded(() => {
        //   const starttime = Date.now();
        //   Object.keys(this.universe.systemData.value).forEach(system => {
        //     this.getDistance(30000001, Number(system));
        //   });
        //   console.log((Date.now() - starttime) / 1000);
        // });
      }
    });
  }
  // TODO: Convert to Uniform-Cost Search
  getRoute(start: number, finish: number) {
    // Breadth-First-Search with cycle-checking, takes around 0.03 seconds for
    // 100 jump route
    const prev = {};  // Cycle checking
    prev[start] = 0;
    const open = [];
    open.push([start]);
    while (!(open.length === 0)) {
      const top: number[] = open.shift();
      const last: number = top[top.length - 1];
      if (last === finish) {
        return top;
      }
      const successors: number[] = this.jumps[last];
      successors.forEach(element => {
        const successor = Number(element);
        const newPath = top.concat(successor);
        if (!prev[successor]) {
          open.push(newPath);
          prev[successor] = newPath.length;
        } else {
          if (prev[successor] > newPath.length) {
            open.push(newPath);
            prev[successor] = newPath.length;
          }
        }
      });
    }
  }

  /**
   * Get the distance in Light Years between two systems
   * @param a First system
   * @param b Second system
   */
  getDistance(a: number, b: number): number {
    const aData = this.universe.getSystem(a);
    const bData = this.universe.getSystem(b);
    if (aData == null || bData == null) { return null; }
    const x = aData['x'] - bData['x'];
    const y = aData['y'] - bData['y'];
    const z = aData['z'] - bData['z'];
    return Math.sqrt(x * x + y * y + z * z) / 9460700000000000;
  }
}
