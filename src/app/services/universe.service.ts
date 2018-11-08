import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Papa} from 'ngx-papaparse';
import {Subscription} from 'rxjs';
import {PapaParseResult} from 'ngx-papaparse/lib/interfaces/papa-parse-result';

@Injectable({providedIn: 'root'})
export class UniverseService {
  private loaded = false;
  private typeData = {};
  private systemData = {};
  constructor(private http: HttpClient, private papa: Papa) {
    // Setup typeData
    const invTypes =
        this.initializeData('invTypes.csv', 'typeID', this.typeData)
            .add(() => {
              // Hash-map validation function call-back
              if (this.getTypeName(670) === 'Capsule') {
                console.log('typeData initialized.');
              } else {
                throw new Error('typeData could not be parsed.');
              }
            });
    const mapSolarSystems =
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
    this.loaded = true;
  }

  initializeData(fileName, key, store): Subscription {
    return this.http.get('./assets/' + fileName, {responseType: 'text'})
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
    return this.loaded && this.typeData[id]['typeName'];
  }

  getSystemName(id: number): string {
    return this.loaded && this.systemData[id]['solarSystemName'];
  }

  getSystemSecurity(id: number): string {
    return this.loaded && this.systemData[id]['security'];
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
