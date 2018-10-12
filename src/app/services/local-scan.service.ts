import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  EveCharacter,
  EveCorporation,
  EveAlliance
} from '../models/EveModels.model';
import { EveService } from './eve.service';
import { from } from 'rxjs/internal/observable/from';

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
  constructor(private http: HttpClient, private eve: EveService) {
    this.characters = {};
    this.corporations = {};
    this.alliances = {};
    this.displayCorporations = {};
    this.displayAlliances = {};
  }

  addDisplayCorporation(corpId: number) {
    if (this.displayCorporations[corpId]) {
      this.displayCorporations[corpId].count++;
    } else {
      this.displayCorporations[corpId] = {
        corporation: this.corporations[corpId],
        count: 1
      };
    }
  }
  addDisplayAlliance(allianceId: number) {
    if (this.displayAlliances[allianceId]) {
      this.displayAlliances[allianceId].count++;
    } else {
      this.displayAlliances[allianceId] = {
        alliance: this.alliances[allianceId],
        count: 1
      };
    }
  }

  async parse(localList) {
    console.log('Running Parse');
    const lines = localList.split('\n');
    for (let i = 0; i < lines.length; i++) {
      // Search the character in ESI
      from(this.eve.search(lines[i], 'character', true))
        .subscribe(searchData => {
          // If the character exists in ESI
          if (searchData['character']) {
            const id = searchData['character'][0];
            if (!this.characters[id]) {
              // Find the character's id and corporation
              from(this.eve.characters(id))
                .subscribe(charData => {
                  this.characters[id] = {
                    name: lines[i],
                    corporation: charData['corporation_id']
                  };
                  const corpId = charData['corporation_id'];
                  if (this.corporations[corpId]) {
                    this.addDisplayCorporation(corpId);
                  } else {
                    from(this.eve.corporations(corpId))
                      .subscribe(corpData => {
                        this.corporations[corpId] = {
                          name: corpData['name'],
                          alliance: corpData['alliance_id'] || null,
                          image: `http://image.eveonline.com/Corporation/${corpId}_128.png`
                        };
                        this.addDisplayCorporation(corpId);
                        if (corpData['alliance_id']) {
                          from(this.eve.alliances(corpData['alliance_id']))
                            .subscribe(allianceData => {
                              if (this.alliances[corpData['alliance_id']]) {
                                this.addDisplayAlliance(corpData['alliance_id']);
                              } else {
                                this.alliances[corpData['alliance_id']] = {
                                  name: allianceData['name'],
                                  corporations: null,
                                  image: `http://image.eveonline.com/Alliance/${corpData['alliance_id']}_128.png`
                                };
                                this.addDisplayAlliance(corpData['alliance_id']);
                              }
                            });
                        }
                      });
                  }
                });
            } else { // If the character already exists in our cache
              this.addDisplayCorporation(this.characters[id].corporation);
              this.addDisplayAlliance(this.corporations[this.characters[id].corporation].alliance);
            }
          }
        });
    }
  }
}
