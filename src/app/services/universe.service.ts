import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { PapaParseResult } from 'ngx-papaparse/lib/interfaces/papa-parse-result';
import { BehaviorSubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UniverseService {

  public typeData = new BehaviorSubject(null);
  public systemData = new BehaviorSubject(null);
  public regionData = new BehaviorSubject(null);
  public typeNames = new BehaviorSubject(null);

  constructor(private http: HttpClient, private papa: Papa) {
    this.initializeData('invTypes.csv', 'typeID', this.typeData)
      .add(() => {
        this.getTypeName(670) === 'Capsule' ? console.log('typeData initialized.') : console.error('typeData could not be parsed.');
      });
    this.initializeData('mapSolarSystems.csv', 'solarSystemID',
      this.systemData)
      .add(() => {
        this.getSystemName(30000142) === 'Jita' ? console.log('systemData initialized.') :
          console.error('systemData could not be parsed.');
      });
    this.initializeData('mapRegions.csv', 'regionID',
      this.regionData)
      .add(() => {
        this.getRegionName(10000002) === 'The Forge' ? console.log('regionData initialized.') :
          console.error('regionData could not be parsed.');
      });
    this.initializeData('invTypes.csv', 'typeName',
      this.typeNames)
      .add(() => {
        this.getTypeId('Tritanium') === 34 ? console.log('regionData initialized.') : console.error('regionData could not be parsed.');
      });
  }

  initializeData(fileName: string, key: string, store: BehaviorSubject<any>): Subscription {
    return this.http.get('./assets/' + fileName, { responseType: 'text' })
      .pipe(map((data: any) => data))
      .subscribe((data: any) => {
        this.papa.parse(data, {
          header: true,
          complete: (result: PapaParseResult) => {
            // Map other columns as fields for the specified key
            const tempData = {};
            result.data.forEach(element => {
              tempData[element[key]] = element;
              delete tempData[element[key]][key];
            });
            store.next(tempData);
          }
        });
      }, error => console.error(error));
  }

  getTypeName(id: number): string {
    return this.typeData.value && id ? this.typeData.value[id]['typeName'] : null;
  }

  getAllTypeNames(): string[] {
    return this.typeNames.value ? Object.keys(this.typeNames.value) : null;
  }

  getTypeId(name: string): number {
    return this.typeNames.value && name ? Number(this.typeNames.value[name]['typeID']) : null;
  }

  getSystemName(id: number): string {
    return this.systemData.value && id ? this.systemData.value[id]['solarSystemName'] : null;
  }

  getSystemSecurity(id: number): number {
    return this.systemData.value && id ? this.systemData.value[id]['security'] : null;
  }

  getSystemRegion(id: number): number {
    return this.systemData.value && id ? this.systemData.value[id]['regionID'] : null;
  }

  getRegionName(id: number): string {
    return this.regionData.value && id ? this.regionData.value[id]['regionName'] : null;
  }

  getSystemRegionName(id: number): string {
    return this.getRegionName(this.getSystemRegion(id));
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
