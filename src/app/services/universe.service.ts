import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Papa } from 'ngx-papaparse';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UniverseService {
  private typeData = {};
  constructor(private http: HttpClient, private papa: Papa) {
    // Setup typeData
    this.initializeData('invTypes.csv', 'typeID', this.typeData).add(
      () => { // Call-back hash-map validation function
        if (this.getType(670).typeName === 'Capsule') {
          console.log('typeData initialized.');
        } else {
          throw new Error('typeData could not be parsed.');
        }
      }
    );
  }

  initializeData(fileName, key, store): Subscription {
    return this.http.get('./assets/' + fileName, { responseType: 'text' })
      .pipe(map((data: any) => data, error => console.error(error)))
      .subscribe((data: any) => {
        this.papa.parse(data, {
          header: true,
          complete: (result) => {
            // Set the specified key to be the key in converting the csv array to a hash-map
            result.data.forEach(element => {
              store[element[key]] = element;
              delete store[element[key]][key];
            });
          }
        });
      }, error => console.error(error));
  }

  getType(id) {
    return this.typeData[id];
  }
}
