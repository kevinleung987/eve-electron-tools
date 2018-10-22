import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Papa } from 'ngx-papaparse';
import { Subscription, Observable, forkJoin } from 'rxjs';
import { PapaParseResult } from 'ngx-papaparse/lib/interfaces/papa-parse-result';

@Injectable({
  providedIn: 'root'
})
export class UniverseService {
  private loaded: Observable<any>;
  private typeData = {};
  private systemData = {};
  constructor(private http: HttpClient, private papa: Papa) {
    // Setup typeData
    const invTypes = this.initializeData('invTypes.csv', 'typeID', this.typeData).add(
      () => { // Hash-map validation function call-back
        if (this.getTypeName(670) === 'Capsule') {
          console.log('typeData initialized.');
        } else {
          throw new Error('typeData could not be parsed.');
        }
      });
    const mapSolarSystems = this.initializeData('mapSolarSystems.csv', 'solarSystemID', this.systemData).add(
      () => { // Hash-map validation function call-back
        if (this.getSystemName(30000142) === 'Jita') {
          console.log('systemData initialized.');
        } else {
          throw new Error('systemData could not be parsed.');
        }
      });
    this.loaded = forkJoin([invTypes, mapSolarSystems]);
  }

  initializeData(fileName, key, store): Subscription {
    return this.http.get('./assets/' + fileName, { responseType: 'text' })
      .pipe(map((data: any) => data))
      .subscribe((data: any) => {
        this.papa.parse(data, {
          header: true,
          complete: (result: PapaParseResult) => {
            // Set the specified key to be the key in converting the csv array to a hash-map
            result.data.forEach(element => {
              store[element[key]] = element;
              delete store[element[key]][key];
            });
          }
        });
      }, error => console.error(error));
  }

  getTypeName(id: number): string {
    return this.typeData[id] ? this.typeData[id]['typeName'] : '';
  }

  getSystemName(id: number): string {
    return this.systemData[id] ? this.systemData[id]['solarSystemName'] : '';
  }
}
