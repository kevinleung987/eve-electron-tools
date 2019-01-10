import { Injectable } from '@angular/core';
import { DisplayAlliance, DisplayCorporation, EveAlliance, EveCharacter, EveCorporation, } from 'src/app/models/EveModels.model';
import { EveService } from 'src/app/services/eve.service';
import { ImagePipe } from '../shared/pipes/image.pipe';

@Injectable({ providedIn: 'root' })
export class LocalScanService {
  // Cached requests
  public characterMap: { [name: string]: number };
  public characters: { [id: number]: EveCharacter };
  public corporations: { [id: number]: EveCorporation };
  public alliances: { [id: number]: EveAlliance };
  // Current results
  public activeCorporations: { [id: number]: DisplayCorporation };
  public activeAlliances: { [id: number]: DisplayAlliance };
  public displayCorporations: DisplayCorporation[] = [];
  public displayAlliances: DisplayAlliance[] = [];
  // Statistics
  public total = 0;
  public progress = 0;
  public cacheStats = { character: [0, 0], corporation: [0, 0], alliance: [0, 0] }; // Hits/Misses
  public runTime = 0;
  public busy = false;

  constructor(private eve: EveService) {
    this.characterMap = {};
    this.characters = {};
    this.corporations = {};
    this.alliances = {};
    this.activeCorporations = {};
    this.activeAlliances = {};
  }

  async parse(localList: string, parallel: boolean) {
    this.busy = true;
    const startTime = new Date().getTime();
    this.reset();
    const data = [];
    const lines = localList.split('\n');
    this.total = lines.length;
    // Process each line to get corp and alliance info
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.replace(/\s/g, '').length) {
        const tempData = parallel ? this.processLine(lines[i].trim()) : await this.processLine(lines[i].trim());
        data.push(tempData);
        this.progress++;
      }
    }
    // Temporary frequency tables
    const parsedCorporations = {};
    const parsedAlliances = {};
    const results = parallel ? await Promise.all(data) : data;
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

    const time = (new Date().getTime() - startTime) / 1000;
    this.runTime = time;
  }

  async processLine(line: string): Promise<any> {
    const result = {
      corporation: null,
      alliance: null
    };
    if (this.characterMap[line]) {
      this.cacheStats.character[0]++;
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
        this.cacheStats.character[0]++;
        result.corporation = this.characters[id].corporation;
        result.alliance = this.corporations[this.characters[id].corporation].alliance;
        return Promise.resolve(result);
      }
      // Find the character's id and corporation
      const charData: any = await this.eve.characters(id);
      this.cacheStats.character[1]++;
      const corpId = charData['corporation_id'];
      this.characters[id] = {
        name: line,
        corporation: corpId
      };
      if (this.corporations[corpId]) { // Corporation exists in cache
        this.cacheStats.corporation[0]++;
        result.corporation = corpId;
        result.alliance = this.corporations[corpId].alliance;
        return Promise.resolve(result);
      }
      // Get character's corporation data
      const corpData: any = await this.eve.corporations(corpId);
      this.cacheStats.corporation[1]++;
      const allianceId: number = corpData['alliance_id'];
      this.corporations[corpId] = {
        name: corpData['name'],
        alliance: corpData['alliance_id'] || null,
        image: new ImagePipe().transform(corpId, 'corporation', 128)
      };
      result.corporation = corpId;
      if (allianceId) { // Corporation has alliance
        // Get character's alliance data
        if (!this.alliances[allianceId]) { // Alliance exists in cache
          const allianceData: any = await this.eve.alliances(allianceId);
          this.cacheStats.alliance[1]++;
          this.alliances[allianceId] = {
            name: allianceData['name'],
            corporations: [],
            image: new ImagePipe().transform(allianceId, 'alliance', 128)
          };
        } else {
          this.cacheStats.alliance[0]++;
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

  reset() {
    this.activeCorporations = {};
    this.activeAlliances = {};
    this.displayCorporations = [];
    this.displayAlliances = [];
    this.progress = 0;
    this.total = 0;
    this.cacheStats = { character: [0, 0], corporation: [0, 0], alliance: [0, 0] };
    this.runTime = 0;
  }
}
