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
      }
    });
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
        console.log(prev[last]);
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

  getShortestRoute(start: number, finish: number) {
    return this.getRoute(start, finish, (id: number) => {
      return 1;
    });
  }
  // TODO: Modify these cost functions to make them more representative of the game's navigation
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
    return Math.sqrt(x * x + y * y + z * z) / 9460700000000000;
  }
}

/**
 * https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
 * Priority queue used in A* search
 */
class PriorityQueue {
  _comparator;
  _heap;
  top = 0;
  parent = i => ((i + 1) >>> 1) - 1;
  left = i => (i << 1) + 1;
  right = i => (i + 1) << 1;

  constructor(comparator = (a, b) => a < b) {
    this._heap = [];
    this._comparator = comparator;
  }
  size() {
    return this._heap.length;
  }
  isEmpty() {
    return this.size() === 0;
  }
  peek() {
    return this._heap[this.top];
  }
  push(...values) {
    values.forEach(value => {
      this._heap.push(value);
      this._siftUp();
    });
    return this.size();
  }
  pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > this.top) {
      this._swap(this.top, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }
  replace(value) {
    const replacedValue = this.peek();
    this._heap[this.top] = value;
    this._siftDown();
    return replacedValue;
  }
  _greater(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  _swap(i, j) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  _siftUp() {
    let node = this.size() - 1;
    while (node > this.top && this._greater(node, this.parent(node))) {
      this._swap(node, this.parent(node));
      node = this.parent(node);
    }
  }
  _siftDown() {
    let node = this.top;
    while (
      (this.left(node) < this.size() && this._greater(this.left(node), node)) ||
      (this.right(node) < this.size() && this._greater(this.right(node), node))
    ) {
      const maxChild =
        (this.right(node) < this.size() && this._greater(this.right(node), this.left(node))) ? this.right(node) : this.left(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}
