import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { PapaParseResult } from 'ngx-papaparse/lib/interfaces/papa-parse-result';
import { BehaviorSubject, Subscription, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UniverseService {
  readonly numToLoad = 8;
  private numLoaded = 0;
  public isLoaded = new BehaviorSubject(false);
  public typeData = new BehaviorSubject(null);
  public systemData = new BehaviorSubject(null);
  public regionData = new BehaviorSubject(null);
  public groupData = new BehaviorSubject(null);
  public typeNames = new BehaviorSubject(null);
  public systemNames = new BehaviorSubject(null);
  public regionNames = new BehaviorSubject(null);
  public groupNames = new BehaviorSubject(null);

  constructor(private http: HttpClient, private papa: Papa) {
    this.initializeData('invTypes.csv', 'typeID', this.typeData)
      .add(() => {
        this.initializeMap(this.typeData, this.typeNames, 'typeName', null);
        this.incrementLoad(2);
      });
    this.initializeData('mapSolarSystems.csv', 'solarSystemID',
      this.systemData)
      .add(() => {
        this.initializeMap(this.systemData, this.systemNames, 'solarSystemName', null);
        this.incrementLoad(2);
      });
    this.initializeData('mapRegions.csv', 'regionID',
      this.regionData)
      .add(() => {
        this.initializeMap(this.regionData, this.regionNames, 'regionName', null);
        this.incrementLoad(2);
      });
    this.initializeData('invGroups.csv', 'groupID',
      this.groupData)
      .add(() => {
        this.initializeMap(this.groupData, this.groupNames, 'groupName', null);
        this.incrementLoad(2);
      });
    this.waitUntilLoaded(() => {
      console.log('Finished loading Universe Service.');
      if (!(this.getTypeName(34) === 'Tritanium')) { console.error('typeData could not be parsed.'); }
      if (!(this.getTypeId('Tritanium') === 34)) { console.error('typeNames could not be parsed.'); }
      if (!(this.getSystemName(30000142) === 'Jita')) { console.error('systemData could not be parsed.'); }
      if (!(this.getSystemId('Jita') === 30000142)) { console.error('systemNames could not be parsed.'); }
      if (!(this.getRegionName(10000002) === 'The Forge')) { console.error('regionData could not be parsed.'); }
      if (!(this.getRegionId('The Forge') === 10000002)) { console.error('regionNames could not be parsed.'); }
      if (!(this.getGroupName(6) === 'Sun')) { console.error('groupData could not be parsed.'); }
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

  initializeMap(data: BehaviorSubject<any>, target: BehaviorSubject<any>, key: any, value: any) {
    const mapping = {};
    Object.keys(data.value).forEach(item => {
      if (value == null) {
        mapping[data.value[item][key]] = item;
      } else {
        mapping[data.value[item][key]] = data.value[item][value];
      }
    });
    target.next(mapping);
  }

  incrementLoad(num: number) {
    this.numLoaded += num;
    if (this.numLoaded >= this.numToLoad) {
      this.isLoaded.next(true);
    }
  }

  waitUntilLoaded(callback: () => void) {
    this.isLoaded.subscribe((loaded => {
      if (loaded) { callback(); }
    }));
  }

  getTypeName(id: number): string {
    return this.typeData.value && this.typeData.value[id] ? this.typeData.value[id]['typeName'] : null;
  }

  getTypeId(name: string): number {
    return this.typeNames.value && this.typeNames.value[name] ? Number(this.typeNames.value[name]) : null;
  }

  getTypeGroup(id: number): number {
    return this.typeData.value && this.typeData.value[id] ? Number(this.typeData.value[id]['groupID']) : null;
  }

  getSystem(id: number): any {
    return this.systemData.value && this.systemData.value[id] ? this.systemData.value[id] : null;
  }

  getSystemName(id: number): string {
    return this.systemData.value && this.systemData.value[id] ? this.systemData.value[id]['solarSystemName'] : null;
  }

  getSystemId(name: string): number {
    return this.systemNames.value && this.systemNames.value[name] ? Number(this.systemNames.value[name]) : null;
  }

  getSystemSecurity(id: number): string {
    return this.systemData.value && this.systemData.value[id] ? this.systemData.value[id]['security'] : null;
  }

  getSystemRegion(id: number): number {
    return this.systemData.value && this.systemData.value[id] ? Number(this.systemData.value[id]['regionID']) : null;
  }

  getRegionName(id: number): string {
    return this.regionData.value && this.regionData.value[id] ? this.regionData.value[id]['regionName'] : null;
  }

  getRegionId(name: string): number {
    return this.regionNames.value && this.regionNames.value[name] ? Number(this.regionNames.value[name]) : null;
  }

  getSystemRegionName(id: number): string {
    return this.getRegionName(this.getSystemRegion(id));
  }

  getGroupName(id: number): string {
    return this.groupData.value && this.groupData.value[id] ? this.groupData.value[id]['groupName'] : null;
  }

  getGroupId(name: string): number {
    return this.groupNames.value && this.groupNames.value[name] ? Number(this.groupNames.value[name]) : null;
  }

  getSecurityColor(sec: number): string {
    switch (true) {
      case sec <= 0.0:
        return '#F00000';
      case sec <= 0.1:
        return '#D73000';
      case sec <= 0.2:
        return '#F04800';
      case sec <= 0.3:
        return '#F06000';
      case sec <= 0.4:
        return '#D77700';
      case sec <= 0.5:
        return '#EFEF00';
      case sec <= 0.6:
        return '#8FEF2F';
      case sec <= 0.7:
        return '#00F000';
      case sec <= 0.8:
        return '#00EF47';
      case sec <= 0.9:
        return '#48F0C0';
      case sec <= 1.0:
        return '#2FEFEF';
    }
  }
}
