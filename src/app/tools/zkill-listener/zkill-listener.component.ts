import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import {
  Character,
  Filter,
  InvolvedFilterType,
  LocationFilterType,
  ShipFilterType,
  WhichType,
  ZkillMail,
} from 'src/app/models/Zkill.model';
import { AlertService } from 'src/app/services/alert.service';
import { ConfigService } from 'src/app/services/config.service';
import { ElectronService } from 'src/app/services/electron.service';
import { EveService } from 'src/app/services/eve.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { SuggestionService } from 'src/app/services/suggestion.service';
import { UniverseService } from 'src/app/services/universe.service';
import { Demo } from 'src/app/util/demo';

@Component({
  selector: 'app-zkill-listener',
  templateUrl: './zkill-listener.component.html',
  styleUrls: ['./zkill-listener.component.scss']
})
export class ZkillListenerComponent implements OnInit {
  readonly zkillUrl = 'wss://zkillboard.com:2096';
  // Bindings to Enums for template
  readonly filterType = Filter;
  readonly whichType = WhichType;
  readonly shipFilterType = ShipFilterType;
  readonly locationFilterType = LocationFilterType;
  readonly involvedFilterType = InvolvedFilterType;

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
  // Web-socket connection to zkillboard
  private socket: WebSocketSubject<{}>;

  constructor(private config: ConfigService, private electron: ElectronService,
    private alert: AlertService, public universe: UniverseService, public suggest: SuggestionService,
    private eve: EveService, private navigation: NavigationService) { }

  ngOnInit() {
    // @ts-ignore
    window.$('app-zkill-listener').bootstrapMaterialDesign();
    if (this.config.isDemo()) {
      this.universe.waitUntilLoaded(() => {
        this.mails.push(Demo.zkillExample);
        console.log(this.mails[0]);
      });
    }
  }

  start() {
    this.socket = new WebSocketSubject(this.zkillUrl);
    this.socket.next({ action: 'sub', channel: 'killstream' });
    this.socket.subscribe(
      (message: ZkillMail) => {
        // Add explicit final_blow field for quick access
        message.attackers.forEach(attacker => {
          if (attacker.final_blow) {
            message.final_blow = attacker;
          }
        });
        if (!this.checked.filters || (this.checked.filters && this.applyFilters(message))) {
          this.mails.unshift(message);
          if (this.checked.alerts) { this.alert.playAlert('alert.wav'); }
        }
        if (this.mails.length > this.length) {
          this.mails.pop();
        }
      },
      (err: Error) => {
        this.listening = false;
        throw err;
      });
    this.listening = true;
    this.alert.success('Started listening to zKillboard.');
  }

  stop() {
    this.socket.unsubscribe();
    this.listening = false;
    this.alert.info('Stopped listening to zKillboard.');
  }

  deleteMail(event: Event, index: number) {
    this.mails.splice(index, 1);
    // Prevent default context-menu on some browsers
    event.preventDefault();
    event.stopPropagation();
  }

  clear() {
    this.mails = [];
    this.numFiltered = 0;
    this.alert.success('Cleared Results.');
  }

  openLink(url: string) { this.electron.openUrl(url); }

  addFilter(type: Filter) {
    let filterType;
    switch (type) {
      case Filter.Ship: filterType = ShipFilterType.Ship;
        break;
      case Filter.Location: filterType = LocationFilterType.System;
        break;
      case Filter.Involved: filterType = InvolvedFilterType.Alliance;
        break;
    }
    // Empty, in-active filter
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
    // Create filter function, store filter parameter in function closure
    let filterFunc: ((typeId: number) => boolean) = null;
    filter.description = `${filter.whichType}'s ${filter.filterType} must be ${event}`;
    switch (filter.filterType) {
      case ShipFilterType.Ship: // Filter against typeId
        const filterTypeId = this.universe.getTypeId(event);
        filterFunc = (typeId: number) => (typeId === filterTypeId);
        break;
      case ShipFilterType.ShipGroup: // Filter against groupId
        const filterGroupId = this.universe.getGroupId(event);
        filterFunc = (typeId: number) => (this.universe.getTypeGroup(typeId) === filterGroupId);
        break;
    }
    // How we apply filterFunc depends on whether we're filltering for Victim/Attacker
    switch (filter.whichType) {
      case WhichType.Victim: // Filter against single Charcter, the Victim
        filter.filterFunc = (mail: ZkillMail) => filterFunc(mail.victim.ship_type_id);
        break;
      case WhichType.Attacker: // Filter against all Attackers
        filter.filterFunc = (mail: ZkillMail) => {
          for (let i = 0; i < mail.attackers.length; i++) {
            if (filterFunc(mail.attackers[i].ship_type_id)) { return true; }
          }
          return false;
        };
        break;
    }
    filter.active = true;
  }

  onSubmitLocation(event, index: number, numJumps = 0) {
    const filter = this.filters[index];
    switch (filter.filterType) {
      case LocationFilterType.Region: // Filter against mail's region
        const filterRegionId = this.universe.getRegionId(event);
        filter.description = `Region must be ${event}`;
        filter.filterFunc = (mail: ZkillMail) => {
          const regionId = this.universe.getSystemRegion(mail.solar_system_id);
          return regionId === filterRegionId;
        };
        break;
      case LocationFilterType.System: // Filter against mail's system
        const filterSystemId = this.universe.getSystemId(event);
        filter.description =
          `System must be within ${numJumps} jumps of ${event}[${this.universe.getSystemRegionName(filterSystemId)}]`;
        filter.filterFunc = (mail: ZkillMail) => {
          const route = this.navigation.getShortestRoute(filterSystemId, mail.solar_system_id);
          return route.length <= numJumps;
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
    // Bind used so the functions are run under the context of EveService
    switch (filter.filterType) {
      case InvolvedFilterType.Character: filterToken = 'character'; getNameFunc = this.eve.characters.bind(this.eve); break;
      case InvolvedFilterType.Corporation: filterToken = 'corporation'; getNameFunc = this.eve.corporations.bind(this.eve); break;
      case InvolvedFilterType.Alliance: filterToken = 'alliance'; getNameFunc = this.eve.alliances.bind(this.eve); break;
    }
    // Search for id of the filtered subject
    const searchResult = await this.eve.search(event, filterToken, true);
    if (searchResult[filterToken] == null) { this.alert.error(`No ${filterToken} found.`); return; }
    const filterId = searchResult[filterToken][0];
    filterFunc = (character: Character) => (character[filterToken + '_id'] === filterId);
    // Get name of the filtered subject
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
          for (let i = 0; i < mail.attackers.length; i++) {
            const attacker = mail.attackers[i];
            if (filterFunc(attacker)) { return true; }
          }
          return false;
        };
        break;
    }
    filter.active = true;
  }

  onSubmitValue(event, index: number) {
    const value = Number(event);
    const filter = this.filters[index];
    filter.description = `Value must be greater than or equal to ${new DecimalPipe('en-us').transform(event)} ISK`;
    filter.filterFunc = (mail: ZkillMail) => (mail.zkb.totalValue >= value);
    filter.active = true;
  }

  applyFilters(mail: ZkillMail): boolean {
    // Only filter the mail if we have at least one active filter
    let numActive = 0;
    this.filters.forEach(filter => { if (filter.active) { numActive++; } });
    if (numActive === 0) { return true; }
    // True until a filter fails in match-all mode, False until made True by a filter in match-any mode
    let filterMatch = this.checked.matchAll;
    for (let i = 0; i < this.filters.length; i++) {
      const filter = this.filters[i];
      if (filter.active === true) {
        if (this.checked.matchAll) {
          filterMatch = filterMatch && filter.filterFunc(mail);
        } else {
          filterMatch = filter.filterFunc(mail) ? true : filterMatch;
        }
      }
    }
    if (!filterMatch) {
      this.numFiltered++;
    }
    return filterMatch;
  }
}
