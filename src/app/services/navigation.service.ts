import { Injectable } from '@angular/core';
import { Papa, PapaParseResult } from 'ngx-papaparse';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  fileName = 'mapSolarSystemJumps.csv';
  jumps = {};
  ready = new BehaviorSubject(false);

  constructor(private http: HttpClient, private papa: Papa) {
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
        console.log(this.getNumJumps(30001947, 30003647));
      }
    });
  }

  getNumJumps(start: number, finish: number) {
    // Classic Breadth-First-Search, takes around 0.03 seconds for 100 jump route
    const startTime = Date.now();
    const prev = {};
    prev[start] = 0;
    const open = [];
    open.push([start]);
    while (!(open.length === 0)) {
      const top: number[] = open.shift();
      const last: number = top[top.length - 1];
      if (last === finish) {
        console.log((Date.now() - startTime) / 1000);
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
}
