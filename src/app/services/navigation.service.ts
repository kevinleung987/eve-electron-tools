import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Papa, PapaParseResult } from 'ngx-papaparse';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { UniverseService } from 'src/app/services/universe.service';
import { PriorityQueue } from 'src/app/util/priority-queue';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  fileName = 'mapSolarSystemJumps.csv';
  jumps = {}; // Mapping each system with it's connected systems in a graph
  ready = new BehaviorSubject(false);

  constructor(private http: HttpClient, private papa: Papa, private universe: UniverseService) {
    // Build solar system graph
    this.http.get('./assets/' + this.fileName, { responseType: 'text' })
      .pipe(map((data: any) => data))
      .subscribe((data: any) => {
        this.papa.parse(data, {
          header: true,
          complete: (result: PapaParseResult) => {
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
  }

  getRoute(start: number, finish: number, costFunc: (id: number) => number) {
    // A* Search with cycle-checking, takes around 0.03 seconds for 100 jumps
    const prev = {};  // Cycle checking
    prev[start] = 1;
    const open = new PriorityQueue((a, b) => a[1] < b[1]);
    open.push([[start], 1]);
    while (!open.isEmpty()) {
      const top: number[] = open.pop()[0];
      const last: number = top[top.length - 1];
      if (last === finish) {
        return top;
      }
      const successors: number[] = this.jumps[last];
      successors.forEach(element => {
        const successor = Number(element);
        const newPath = top.concat(successor);
        const cost = newPath.reduce((a, b) => a + costFunc(b), 0);
        if (!prev[successor] || (cost < prev[successor])) {
          open.push([newPath, cost]);
          prev[successor] = cost;
        }
      });
    }
  }

  /**
   * Cost functions for use in getRoute
   */
  getShortestRoute(start: number, finish: number) {
    return this.getRoute(start, finish, (id: number) => {
      return 1;
    });
  }

  getSafestRoute(start: number, finish: number) {
    return this.getRoute(start, finish, (id: number) => {
      return 1 - Number(this.universe.getSystemSecurity(id));
    });
  }

  getLessSecureRoute(start: number, finish: number) {
    return this.getRoute(start, finish, (id: number) => {
      return 1 + Number(this.universe.getSystemSecurity(id));
    });
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
    // Conversion to Light Years
    return Math.sqrt(x * x + y * y + z * z) / 9460700000000000;
  }
}
