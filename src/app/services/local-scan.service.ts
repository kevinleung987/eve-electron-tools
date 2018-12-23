import { Injectable } from '@angular/core';

import { EveAlliance, EveCharacter, EveCorporation, DisplayAlliance, DisplayCorporation } from '../models/EveModels.model';
import { EveService } from './eve.service';

@Injectable({ providedIn: 'root' })
export class LocalScanService {

  public characterMap: { [name: string]: number };
  public characters: { [id: number]: EveCharacter };
  public corporations: { [id: number]: EveCorporation };
  public alliances: { [id: number]: EveAlliance };
  public activeCorporations: { [id: number]: DisplayCorporation };
  public activeAlliances: { [id: number]: DisplayAlliance };
  public displayCorporations: DisplayCorporation[] = [];
  public displayAlliances: DisplayAlliance[] = [];
  public busy = false;

  constructor(private eve: EveService) {
    this.characterMap = {};
    this.characters = {};
    this.corporations = {};
    this.alliances = {};
    this.activeCorporations = {};
    this.activeAlliances = {};
  }

  async processLine(line: string): Promise<any> {
    const result = {
      corporation: null,
      alliance: null
    };
    if (this.characterMap[line]) {
      console.log('cache hit 1');
      const id = this.characterMap[line];
      result.corporation = this.characters[id].corporation;
      result.alliance = this.corporations[this.characters[id].corporation].alliance;
      return Promise.resolve(result);
    }
    // Search the character in ESI
    const searchData: any = await this.eve.search(line, 'character', true);
    // If the character exists in ESI
    if (searchData['character']) {
      const id = searchData['character'][0];
      this.characterMap[line] = id;
      if (this.characters[id]) { // Character exists in cache
        console.log('cache hit 2');
        result.corporation = this.characters[id].corporation;
        result.alliance = this.corporations[this.characters[id].corporation].alliance;
        return Promise.resolve(result);
      }
      // Find the character's id and corporation
      const charData: any = await this.eve.characters(id);
      const corpId = charData['corporation_id'];
      this.characters[id] = {
        name: line,
        corporation: corpId
      };
      if (this.corporations[corpId]) { // Corporation exists in cache
        console.log('cache hit 3');
        result.corporation = corpId;
        result.alliance = this.corporations[corpId].alliance;
        return Promise.resolve(result);
      }
      // Get character's corporation data
      const corpData: any = await this.eve.corporations(corpId);
      const allianceId: number = corpData['alliance_id'];
      this.corporations[corpId] = {
        name: corpData['name'],
        alliance: corpData['alliance_id'] || null,
        image: `http://image.eveonline.com/Corporation/${corpId}_128.png`
      };
      result.corporation = corpId;
      if (allianceId) { // Corporation has alliance
        // Get character's alliance data
        if (!this.alliances[allianceId]) { // Alliance exists in cache
          const allianceData: any = await this.eve.alliances(allianceId);
          this.alliances[allianceId] = {
            name: allianceData['name'],
            corporations: [],
            image:
              `http://image.eveonline.com/Alliance/${allianceId}_128.png`
          };
        }
        result.alliance = allianceId;
      }
    }
    return Promise.resolve(result);
  }

  getDisplayCorporations(): DisplayCorporation[] {
    const output: DisplayCorporation[] = [];
    Object.keys(this.activeCorporations).forEach(element => {
      if (this.activeCorporations[element] != null) {
        output.push(this.activeCorporations[element]);
      }
    });
    output.sort(function (a, b) { return b.count - a.count; });
    return output;
  }

  getDisplayAlliances(): DisplayAlliance[] {
    const output: DisplayAlliance[] = [];
    Object.keys(this.activeAlliances).forEach(element => {
      if (this.activeAlliances[element] != null) {
        output.push(this.activeAlliances[element]);
      }
    });
    output.sort(function (a, b) { return b.count - a.count; });
    return output;
  }

  async parse(localList) {
    this.busy = true;
    const data = [];
    const lines = localList.split('\n');
    // Process each line to get corp and alliance info
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.replace(/\s/g, '').length) {
        data.push(this.processLine(lines[i].trim()));
      }
    }
    Promise.all(data).then((results) => {
      // Temporary frequency tables
      const parsedCorporations = {};
      const parsedAlliances = {};
      // Process each item into the frequency tables
      results.forEach((item) => {
        const corp = item.corporation;
        const alliance = item.alliance;
        // Process corporation frequency
        if (corp && parsedCorporations[corp]) {
          parsedCorporations[corp].count++;
        } else if (corp) {
          parsedCorporations[corp] = {
            corporation: this.corporations[corp],
            count: 1,
            highlighted: false
          };
        }
        // Process alliance frequency
        if (alliance) {
          if (parsedAlliances[alliance]) {
            parsedAlliances[alliance].count++;
          } else {
            parsedAlliances[alliance] = {
              alliance: this.alliances[alliance],
              count: 1,
              highlighted: false
            };
          }
          // Link the alliance with it's corporation
          if (!this.alliances[alliance].corporations.includes(corp)) {
            this.alliances[alliance].corporations.push(corp);
          }
        }
      });
      this.activeCorporations = parsedCorporations;
      this.activeAlliances = parsedAlliances;
      this.displayCorporations = this.getDisplayCorporations();
      this.displayAlliances = this.getDisplayAlliances();
      this.busy = false;
    });
  }
}
