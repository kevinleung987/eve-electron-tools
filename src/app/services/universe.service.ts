import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { PapaParseResult } from 'ngx-papaparse/lib/interfaces/papa-parse-result';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UniverseService {
  private typeData = {};
  private systemData = {};
  private invTypes: Subscription;
  private mapSolarSystems: Subscription;
  constructor(private http: HttpClient, private papa: Papa) {
    // Setup typeData
    this.invTypes =
      this.initializeData('invTypes.csv', 'typeID', this.typeData)
        .add(() => {
          // Hash-map validation function call-back
          if (this.getTypeName(670) === 'Capsule') {
            console.log('typeData initialized.');
          } else {
            throw new Error('typeData could not be parsed.');
          }
        });
    this.mapSolarSystems =
      this.initializeData('mapSolarSystems.csv', 'solarSystemID',
        this.systemData)
        .add(() => {
          // Hash-map validation function call-back
          if (this.getSystemName(30000142) === 'Jita') {
            console.log('systemData initialized.');
          } else {
            throw new Error('systemData could not be parsed.');
          }
        });
  }

  initializeData(fileName: string, key: string, store: any): Subscription {
    return this.http.get('./assets/' + fileName, { responseType: 'text' })
      .pipe(map((data: any) => data))
      .subscribe((data: any) => {
        this.papa.parse(data, {
          header: true,
          complete: (result: PapaParseResult) => {
            // Set the specified key to be the key in converting the csv array
            // to a hash-map
            result.data.forEach(element => {
              store[element[key]] = element;
              delete store[element[key]][key];
            });
          }
        });
      }, error => console.error(error));
  }

  getTypeName(id: number): string {
    return this.invTypes.closed ? this.typeData[id]['typeName'] : null;
  }

  getSystemName(id: number): string {
    return this.mapSolarSystems.closed ? this.systemData[id]['solarSystemName'] : null;
  }

  getSystemSecurity(id: number): string {
    return this.mapSolarSystems.closed ? this.systemData[id]['security'] : null;
  }

  getSecurityColor(sec: number): string {
    if (sec <= 0.0) {
      return '#F00000';
    }
    if (sec <= 0.1) {
      return '#D73000';
    }
    if (sec <= 0.2) {
      return '#F04800';
    }
    if (sec <= 0.3) {
      return '#F06000';
    }
    if (sec <= 0.4) {
      return '#D77700';
    }
    if (sec <= 0.5) {
      return '#EFEF00';
    }
    if (sec <= 0.6) {
      return '#8FEF2F';
    }
    if (sec <= 0.7) {
      return '#00F000';
    }
    if (sec <= 0.8) {
      return '#00EF47';
    }
    if (sec <= 0.9) {
      return '#48F0C0';
    }
    if (sec <= 1.0) {
      return '#2FEFEF';
    }
  }
}
