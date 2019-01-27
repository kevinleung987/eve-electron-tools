import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class EveService {
  esiUrl = environment.esiUrl;
  constructor(private http: HttpClient) { }

  search(subject: string, category: string, strict: boolean): Promise<any> {
    return this.http.get(`${this.esiUrl}/latest/search/?` +
      `categories=${category}` +
      `&datasource=tranquility` +
      `&language=en-us` +
      `&search=${subject}` +
      `&strict=${strict}`)
      .toPromise();
  }

  characters(id: number): Promise<any> {
    return this.http
      .get(`${this.esiUrl}/latest/characters/${id}/?datasource=tranquility`)
      .toPromise();
  }

  corporations(id: number): Promise<any> {
    return this.http
      .get(`${this.esiUrl}/latest/corporations/${id}/?datasource=tranquility`)
      .toPromise();
  }

  alliances(id: number): Promise<any> {
    return this.http
      .get(`${this.esiUrl}/latest/alliances/${id}/?datasource=tranquility`)
      .toPromise();
  }

  marketOrders(typeId: number, regionId: number): Promise<any> {
    return this.http
      .get(`${this.esiUrl}/latest/markets/${regionId}/orders/?datasource=tranquility&order_type=all&type_id=${typeId}`)
      .toPromise();
  }

  universeTypes(typeId: number): Promise<any> {
    return this.http
      .get(`${this.esiUrl}/latest/universe/types/${typeId}/?datasource=tranquility&language=en-us`)
      .toPromise();
  }
}
