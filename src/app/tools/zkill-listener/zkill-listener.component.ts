import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import {
  InvolvedFilterType,
  LocationFilterType,
  ShipFilterType,
  WhichType,
  ZkillMail,
  Character,
  Filter,
} from 'src/app/models/Zkill.model';
import { AlertService } from 'src/app/services/alert.service';
import { ConfigService } from 'src/app/services/config.service';
import { ElectronService } from 'src/app/services/electron.service';
import { SuggestionService } from 'src/app/services/suggestion.service';
import { UniverseService } from 'src/app/services/universe.service';
import { environment } from 'src/environments/environment';
import { EveService } from 'src/app/services/eve.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-zkill-listener',
  templateUrl: './zkill-listener.component.html',
  styleUrls: ['./zkill-listener.component.scss']
})
export class ZkillListenerComponent implements OnInit {
  listening = false;
  length = 5;
  mails: ZkillMail[] = [];
  checked = { filters: true, hideSettings: false, alerts: false, matchAll: false };
  // Filter-related variables
  numFiltered = 0;
  // Filters
  filters: {
    active: boolean, type: Filter, description: string, whichType?: WhichType,
    filterType: ShipFilterType | LocationFilterType | InvolvedFilterType,
    filterFunc: ((mail: ZkillMail) => boolean)
  }[] = [];
  // Bindings to Enums for template
  filterType = Filter;
  whichType = WhichType;
  shipFilterType = ShipFilterType;
  locationFilterType = LocationFilterType;
  involvedFilterType = InvolvedFilterType;

  private socket: WebSocketSubject<{}>;

  constructor(private config: ConfigService, private electron: ElectronService,
    private alert: AlertService, public universe: UniverseService, public suggest: SuggestionService, private eve: EveService) { }

  ngOnInit() {
    // @ts-ignore
    window.$('app-zkill-listener').bootstrapMaterialDesign();
    if (this.config.isDemo()) {
      this.mails.push(environment.zkillExample);
      console.log(this.mails[0]);
    }
  }

  start() {
    this.socket = new WebSocketSubject('wss://zkillboard.com:2096');
    this.socket.next({ action: 'sub', channel: 'killstream' });
    this.listening = true;
    this.socket.subscribe(
      (message: ZkillMail) => {
        // Add explicit final_blow field for quick access
        message['attackers'].forEach(attacker => {
          if (attacker['final_blow']) {
            message['final_blow'] = attacker;
          }
        });
        if (!this.checked.filters || (this.checked.filters && this.applyFilters(message))) {
          this.mails.unshift(message);
          if (this.checked.alerts) { this.playAlert(); }
        }
        console.log(message, this.applyFilters(message));
        if (this.mails.length > this.length) {
          this.mails.pop();
        }
      },
      err => {
        console.error(err);
        this.listening = false;
      });
    this.alert.success('Started listening to zKillboard.');
  }

  stop() {
    this.socket.unsubscribe();
    this.alert.info('Stopped listening to zKillboard.');
    this.listening = false;
  }

  clear() {
    this.mails = [];
    this.numFiltered = 0;
    this.alert.success('Cleared Results.');
  }

  openLink(url: string) { this.electron.openUrl(url); }

  playAlert() {
    const audio = new Audio();
    audio.src = 'assets/alert.wav';
    audio.load();
    audio.play();
  }

  addFilter(type: Filter) {
    let filterType;
    switch (type) {
      case Filter.Ship: filterType = ShipFilterType.Ship;
        break;
      case Filter.Location: filterType = LocationFilterType.Region;
        break;
      case Filter.Involved: filterType = InvolvedFilterType.Alliance;
        break;
    }
    this.filters.push({
      active: false,
      type,
      description: '',
      whichType: WhichType.Victim,
      filterType,
      filterFunc: null
    });
  }

  deleteFilter(index: number) {
    this.filters.splice(index, 1);
  }

  getSource(filterType) {
    switch (filterType) {
      case ShipFilterType.Ship: return this.suggest.typeNames;
      case ShipFilterType.ShipGroup: return this.suggest.groupNames;
      case LocationFilterType.Region: return this.suggest.regionNames;
      case LocationFilterType.System: return this.suggest.systemNames;
      default: return null;
    }
  }

  onSubmitShip(event, index: number) {
    const filter = this.filters[index];
    // Create filter function, store the id to filter for in closure
    let filterFunc: ((typeId: number) => boolean) = null;
    filter.description = `${filter.whichType}'s ${filter.filterType} must be ${event}`;
    switch (filter.filterType) {
      case ShipFilterType.Ship:
        const filterTypeId = this.universe.getTypeId(event);
        filterFunc = (typeId: number) => (typeId === filterTypeId);
        break;
      case ShipFilterType.ShipGroup:
        const filterGroupId = this.universe.getGroupId(event);
        filterFunc = (typeId: number) => (this.universe.getTypeGroup(typeId) === filterGroupId);
        break;
    }
    // How we apply filterFunc depends on whether we're filltering for Victim/Attacker
    switch (filter.whichType) {
      case WhichType.Victim:
        filter.filterFunc = (mail: ZkillMail) => filterFunc(mail.victim.ship_type_id);
        break;
      case WhichType.Attacker:
        filter.filterFunc = (mail: ZkillMail) => {
          let filtered = false;
          mail.attackers.forEach(attacker => {
            if (filterFunc(attacker.ship_type_id)) {
              filtered = true;
            }
          });
          return filtered;
        };
        break;
    }
    filter.active = true;
  }

  onSubmitLocation(event, index: number) {
    const filter = this.filters[index];
    filter.description = `${filter.filterType} must be ${event}`;
    switch (filter.filterType) {
      case LocationFilterType.Region:
        const filterRegionId = this.universe.getRegionId(event);
        filter.filterFunc = (mail: ZkillMail) => {
          const regionId = this.universe.getSystemRegion(mail.solar_system_id);
          return regionId === filterRegionId;
        };
        break;
      case LocationFilterType.System:
        const filterSystemId = this.universe.getSystemId(event);
        filter.filterFunc = (mail: ZkillMail) => {
          return mail.solar_system_id === filterSystemId;
        };
        break;
    }
    filter.active = true;
  }

  async onSubmitInvolved(event, index: number) {
    const filter = this.filters[index];
    // Create filter function, store the id to filter for in closure
    let filterFunc: ((character: Character) => boolean);
    let filterToken: string;
    // Name for the filter-description
    let getNameFunc: ((id: number) => Promise<any>);
    let name: string;
    switch (filter.filterType) {
      case InvolvedFilterType.Character: filterToken = 'character'; getNameFunc = this.eve.characters.bind(this.eve); break;
      case InvolvedFilterType.Corporation: filterToken = 'corporation'; getNameFunc = this.eve.corporations.bind(this.eve); break;
      case InvolvedFilterType.Alliance: filterToken = 'alliance'; getNameFunc = this.eve.alliances.bind(this.eve); break;
    }
    // Get the id of what is being filtered
    const searchResult = await this.eve.search(event, filterToken, true);
    if (searchResult[filterToken] == null) { this.alert.error(`No ${filterToken} found.`); return; }
    const filterId = searchResult[filterToken][0];
    filterFunc = (character: Character) => (character[filterToken + '_id'] === filterId);
    // Get the name of what is being filtered
    const nameResult = await getNameFunc(filterId);
    name = nameResult['name'];
    filter.description = `${filter.whichType}'s ${filter.filterType} must be ${name}[${filterId}]`;
    // How we apply filterFunc depends on whether we're filltering for Victim/Attacker
    switch (filter.whichType) {
      case WhichType.Victim:
        filter.filterFunc = (mail: ZkillMail) => filterFunc(mail.victim);
        break;
      case WhichType.Attacker:
        filter.filterFunc = (mail: ZkillMail) => {
          let filtered = false;
          mail.attackers.forEach(attacker => {
            if (filterFunc(attacker)) {
              filtered = true;
            }
          });
          return filtered;
        };
        break;
    }
    filter.active = true;
  }

  onSubmitValue(event, index: number) {
    const value = Number(event);
    const filter = this.filters[index];
    filter.description = `Value must be equal to or greater than ${new DecimalPipe('en-us').transform(event)} ISK`;
    filter.filterFunc = (mail: ZkillMail) => {
      return mail.zkb.totalValue >= value;
    };
    filter.active = true;
  }

  applyFilters(mail: ZkillMail): boolean {
    let numActive = 0;
    this.filters.forEach(filter => { if (filter.active) { numActive++; } });
    if (numActive === 0) { return true; }
    // True until a filter fails if in match-all mode, False until made True by a filter in match-any mode
    let filterMatch = this.checked.matchAll;
    this.filters.forEach(filter => {
      if (filter.active === true) {
        if (this.checked.matchAll) {
          filterMatch = filterMatch && filter.filterFunc(mail);
        } else {
          filterMatch = filter.filterFunc(mail) ? true : filterMatch;
        }
      }
    });
    if (!filterMatch) {
      this.numFiltered++;
    }
    return filterMatch;
  }
}
