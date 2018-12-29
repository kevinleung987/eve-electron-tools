import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EveService {
  constructor(private http: HttpClient) { }

  search(subject: string, category: string, strict: boolean): Promise<any> {
    return this.http.get(`https://esi.evetech.net/latest/search/?` +
      `categories=${category}` +
      `&datasource=tranquility` +
      `&language=en-us` +
      `&search=${subject}` +
      `&strict=${strict}`)
      .toPromise();
  }

  characters(id: number): Promise<any> {
    return this.http
      .get(
        `https://esi.evetech.net/latest/characters/${id}/?datasource=tranquility`)
      .toPromise();
  }

  corporations(id: number): Promise<any> {
    return this.http
      .get(
        `https://esi.evetech.net/latest/corporations/${id}/?datasource=tranquility`)
      .toPromise();
  }

  alliances(id: number): Promise<any> {
    return this.http
      .get(
        `https://esi.evetech.net/latest/alliances/${id}/?datasource=tranquility`)
      .toPromise();
  }

  marketOrders(typeId: number, regionId: number): Promise<any> {
    return this.http
      .get(
        `https://esi.evetech.net/latest/markets/${regionId}/orders/?datasource=tranquility&order_type=all&type_id=${typeId}`)
      .toPromise();
  }

  universeTypes(typeId: number): Promise<any> {
    return this.http
      .get(
        `https://esi.evetech.net/latest/universe/types/${typeId}/?datasource=tranquility&language=en-us`)
      .toPromise();
  }
}
