import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  EveCharacter,
  EveCorporation,
  EveAlliance
} from '../models/EveModels.model';

@Injectable({
  providedIn: 'root'
})
export class LocalScanService {
  public characters: { [id: number]: EveCharacter };
  public corporations: { [id: number]: EveCorporation };
  public alliances: { [id: number]: EveAlliance };
  public displayCorporations: {
    [id: number]: { corporation: EveCorporation; count: number };
  };
  public displayAlliances: {
    [id: number]: { alliance: EveAlliance; count: number };
  };
  constructor(private http: HttpClient) {
    this.characters = {};
    this.corporations = {};
    this.alliances = {};
    this.displayCorporations = {};
    this.displayAlliances = {};
  }

  addDisplayCorporation(corpId: number, corp: EveCorporation) {
    if (this.displayCorporations[corpId]) {
      this.displayCorporations[corpId].count++;
    } else {
      this.displayCorporations[corpId] = {
        corporation: corp,
        count: 1
      };
    }
  }
  addDisplayAlliance(allianceId: number, alliance: EveAlliance) {
    if (this.displayAlliances[allianceId]) {
      this.displayAlliances[allianceId].count++;
    } else {
      this.displayAlliances[allianceId] = {
        alliance: alliance,
        count: 1
      };
    }
  }

  parse(localList) {
    console.log('Running Parse');
    const lines = localList.split('\n');
    for (let i = 0; i < lines.length; i++) {
      // Search the character in ESI
      this.http
        .get(
          'https://esi.evetech.net/latest/search/?categories=character&datasource=tranquility&language=en-us&search=' +
            lines[i] +
            '&strict=true'
        )
        .subscribe(searchData => {
          // If the character exists in ESI
          if (searchData['character']) {
            const id = searchData['character'][0];
            if (!this.characters[id]) {
              // Find the character's id and corporation
              this.http
                .get(
                  'https://esi.evetech.net/latest/characters/' +
                    id +
                    '/?datasource=tranquility'
                )
                .subscribe(charData => {
                  this.characters[id] = {
                    name: lines[i],
                    corporation: charData['corporation_id']
                  };
                  const corpId = charData['corporation_id'];
                  if (this.corporations[corpId]) {
                    this.addDisplayCorporation(
                      corpId,
                      this.corporations[corpId]
                    );
                  } else {
                    this.http
                      .get(
                        'https://esi.evetech.net/latest/corporations/' +
                          corpId +
                          '/?datasource=tranquility'
                      )
                      .subscribe(corpData => {
                        this.corporations[corpId] = {
                          name: corpData['name'],
                          alliance: corpData['alliance_id'] || null,
                          image: `http://image.eveonline.com/Corporation/${corpId}_128.png`
                        };
                        this.addDisplayCorporation(
                          corpId,
                          this.corporations[corpId]
                        );
                        if (corpData['alliance_id']) {
                          this.http
                            .get(
                              'https://esi.evetech.net/latest/alliances/' +
                                corpData['alliance_id'] +
                                '/?datasource=tranquility'
                            )
                            .subscribe(allianceData => {
                              if (this.alliances[corpData['alliance_id']]) {
                                this.addDisplayAlliance(
                                  corpData['alliance_id'],
                                  this.alliances[corpData['alliance_id']]
                                );
                              } else {
                                this.alliances[corpData['alliance_id']] = {
                                  name: allianceData['name'],
                                  corporations: null,
                                  image: `http://image.eveonline.com/Alliance/${
                                    corpData['alliance_id']
                                  }_128.png`
                                };
                                this.addDisplayAlliance(
                                  corpData['alliance_id'],
                                  this.alliances[corpData['alliance_id']]
                                );
                              }
                            });
                        }
                      });
                  }
                });
            }
          }
        });
    }
  }
}
