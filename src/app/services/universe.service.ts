import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UniverseService {
  private typeData = {};
  constructor(private http: HttpClient) {
    this.http.get('./assets/invTypes.csv', { responseType: 'text' }).pipe(map((data: any) => data, error => console.error(error)))
      .subscribe((data: any) => {
        // console.log(data);
        const lines = data.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const columns = lines[i].split(',');
          this.typeData[columns[0].toString()] = columns[2];
        }
        // console.log(this.typeData[670]); // should return Capsule
      }, error => console.error(error));
  }

  getType(id) {
    return this.typeData[id];
  }
}
