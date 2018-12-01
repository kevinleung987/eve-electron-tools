import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  EveCharacter,
  EveCorporation,
  EveAlliance
} from '../models/EveModels.model';
import { EveService } from './eve.service';

@Injectable({ providedIn: 'root' })
export class LocalScanService {
  public characters: { [id: number]: EveCharacter };
  public corporations: { [id: number]: EveCorporation };
  public alliances: { [id: number]: EveAlliance };
  public displayCorporations: {
    [id: number]: {
      corporation: EveCorporation;
      count: number
    };
  };
  public displayAlliances: {
    [id: number]: {
      alliance: EveAlliance;
      count: number
    };
  };
  constructor(private http: HttpClient, private eve: EveService) {
    this.characters = {};
    this.corporations = {};
    this.alliances = {};
    this.displayCorporations = {};
    this.displayAlliances = {};
  }

  async processLine(line: string): Promise<any> {
    const result = {
      corporation: null,
      alliance: null
    };
    // Search the character in ESI
    const searchData: any = await this.eve.search(line, 'character', true);
    // If the character exists in ESI
    if (searchData['character']) {
      const id = searchData['character'][0];
      if (this.characters[id]) { // Character exists in cache
        result.corporation = this.characters[id].corporation;
        result.alliance = this.corporations[this.characters[id].corporation].alliance;
      } else {
        // Find the character's id and corporation
        const charData: any = await this.eve.characters(id);
        this.characters[id] = {
          name: line,
          corporation: charData['corporation_id']
        };
        const corpId = charData['corporation_id'];
        if (this.corporations[corpId]) { // Corporation exists in cache
          result.corporation = corpId;
        } else {
          // Get character's corporation data
          const corpData: any = await this.eve.corporations(corpId);
          this.corporations[corpId] = {
            name: corpData['name'],
            alliance: corpData['alliance_id'] || null,
            image: `http://image.eveonline.com/Corporation/${corpId}_128.png`
          };
          result.corporation = corpId;
          if (corpData['alliance_id']) { // Corporation has alliance
            const allianceId: number = corpData['alliance_id'];
            // Get character's alliance data
            if (!this.alliances[allianceId]) { // Alliance exists in cache
              const allianceData: any =
                await this.eve.alliances(allianceId);
              this.alliances[allianceId] = {
                name: allianceData['name'],
                corporations: null,
                image:
                  `http://image.eveonline.com/Alliance/${allianceId}_128.png`
              };
            }
            result.alliance = allianceId;
          }
        }
      }
    }
    return Promise.resolve(result);
  }

  async parse(localList) {
    const data = [];
    const lines = localList.split('\n');
    // Process each line to get corp and alliance info
    for (let i = 0; i < lines.length; i++) {
      data.push(this.processLine(lines[i]));
    }
    Promise.all(data).then((results) => {
      console.log(results);
      // Temporary frequency tables
      const parsedCorporations = {};
      const parsedAlliances = {};
      // Process each item into the frequency tables
      results.forEach((item) => {
        const corp = item.corporation;
        const alliance = item.alliance;
        if (corp && parsedCorporations[corp]) {
          parsedCorporations[corp].count++;
        } else if (corp) {
          parsedCorporations[corp] = {
            corporation: this.corporations[corp],
            count: 1
          };
        }
        if (alliance && parsedAlliances[alliance]) {
          parsedAlliances[alliance].count++;
        } else if (alliance) {
          parsedAlliances[alliance] = {
            alliance: this.alliances[alliance],
            count: 1
          };
        }
      });
      // Show the end-result
      this.displayCorporations = parsedCorporations;
      this.displayAlliances = parsedAlliances;
    });
  }
}
