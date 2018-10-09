import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UniverseService {
  private typeData = {};
  constructor(private http: HttpClient) {
    // Setup typeData
    this.http.get('./assets/invTypes.csv', { responseType: 'text' }).pipe(map((data: any) => data, error => console.error(error)))
      .subscribe((data: any) => {
        // console.log(data);
        const lines = data.split('\n');
        const labels = lines[0].split(',').map(s => s.trim());
        const typeIdIndex = labels.indexOf('typeID');
        const typeNameIndex = labels.indexOf('typeName');
        if (typeIdIndex === -1 || typeNameIndex === -1) {
          console.error(labels);
          throw new Error('invTypes.csv could not be parsed.');
        }
        for (let i = 0; i < lines.length; i++) {
          const columns = lines[i].split(',');
          this.typeData[columns[typeIdIndex]] = columns[typeNameIndex];
        }
        // console.log(this.typeData[670]); // should return Capsule
      }, error => console.error(error));
  }

  getType(id) {
    return this.typeData[id];
  }
}