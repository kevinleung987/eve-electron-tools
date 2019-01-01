import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import {
  InvolvedFilterType,
  LocationFilterType,
  ShipFilterType,
  WhichType,
  ZkillMail,
  Character,
} from 'src/app/models/Zkill.model';
import { AlertService } from 'src/app/services/alert.service';
import { ConfigService } from 'src/app/services/config.service';
import { ElectronService } from 'src/app/services/electron.service';
import { SuggestionService } from 'src/app/services/suggestion.service';
import { UniverseService } from 'src/app/services/universe.service';
import { environment } from 'src/environments/environment';
import { EveService } from 'src/app/services/eve.service';

@Component({
  selector: 'app-zkill-listener',
  templateUrl: './zkill-listener.component.html',
  styleUrls: ['./zkill-listener.component.scss']
})
export class ZkillListenerComponent implements OnInit {
  listening = false;
  length = 5;
  mails: ZkillMail[] = [];
  checked = { filters: false, hideSettings: false, ship: false, location: false, involved: false, alerts: false, matchAll: false };
  // Filter-related variables
  numFiltered = 0;
  filterSettings = {
    ship: { whichType: WhichType.Victim, filterType: ShipFilterType.Ship },
    location: { filterType: LocationFilterType.Region },
    involved: { whichType: WhichType.Victim, filterType: InvolvedFilterType.Character },
  };
  // Filter functions
  activeFilters: {
    ship: { description: string, filterFunc: ((mail: ZkillMail) => boolean) },
    location: { description: string, filterFunc: ((mail: ZkillMail) => boolean) },
    involved: { description: string, filterFunc: ((mail: ZkillMail) => boolean) }
  } = { ship: null, location: null, involved: null };
  // Bindings to Enums for template
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
        if (this.checked.filters && this.applyFilters(message)) {
          this.mails.unshift(message);
          if (this.checked.alerts) { this.playAlert(); }
        } else if (!this.checked.filters) {
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

  onSubmitShip(event) {
    // Create filter function, store the id to filter for in closure
    let filterFunc: ((typeId: number) => boolean) = null;
    const description = `${this.filterSettings.ship.whichType}'s ${this.filterSettings.ship.filterType} must be ${event}`;
    switch (this.filterSettings.ship.filterType) {
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
    switch (this.filterSettings.ship.whichType) {
      case WhichType.Victim:
        this.activeFilters.ship = { description, filterFunc: (mail: ZkillMail) => filterFunc(mail.victim.ship_type_id) };
        break;
      case WhichType.Attacker:
        this.activeFilters.ship = {
          description, filterFunc: (mail: ZkillMail) => {
            let filtered = false;
            mail.attackers.forEach(attacker => {
              if (filterFunc(attacker.ship_type_id)) {
                filtered = true;
              }
            });
            return filtered;
          }
        };
        break;
    }
    // console.log('Match:', this.applyFilters(this.mails[0]));
  }

  onSubmitLocation(event) {
    const description = `${this.filterSettings.location.filterType} must be ${event}`;
    switch (this.filterSettings.location.filterType) {
      case LocationFilterType.Region:
        const filterRegionId = this.universe.getRegionId(event);
        this.activeFilters.location = {
          description, filterFunc: (mail: ZkillMail) => {
            const regionId = this.universe.getSystemRegion(mail.solar_system_id);
            return regionId === filterRegionId;
          }
        };
        break;
      case LocationFilterType.System:
        const filterSystemId = this.universe.getSystemId(event);
        this.activeFilters.location = {
          description, filterFunc: (mail: ZkillMail) => {
            return mail.solar_system_id === filterSystemId;
          }
        };
        break;
    }
    // console.log('Match:', this.applyFilters(this.mails[0]));
  }

  async onSubmitInvolved(event) {
    // Create filter function, store the id to filter for in closure
    let filterFunc: ((character: Character) => boolean);
    let filterToken: string;
    // Name for the filter-description
    let getNameFunc: ((id: number) => Promise<any>);
    let name: string;
    switch (this.filterSettings.involved.filterType) {
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
    const description =
      `${this.filterSettings.involved.whichType}'s ${this.filterSettings.involved.filterType} must be ${name}[${filterId}]`;
    // How we apply filterFunc depends on whether we're filltering for Victim/Attacker
    switch (this.filterSettings.involved.whichType) {
      case WhichType.Victim:
        this.activeFilters.involved = { description, filterFunc: (mail: ZkillMail) => filterFunc(mail.victim) };
        break;
      case WhichType.Attacker:
        this.activeFilters.involved = {
          description, filterFunc: (mail: ZkillMail) => {
            let filtered = false;
            mail.attackers.forEach(attacker => {
              if (filterFunc(attacker)) {
                filtered = true;
              }
            });
            return filtered;
          }
        };
        break;
    }
    // console.log('Match:', this.applyFilters(this.mails[0]));
  }

  applyFilters(mail: ZkillMail): boolean {
    // No filters are active
    if (this.activeFilters.ship == null && this.activeFilters.location == null && this.activeFilters.involved == null) {
      return true;
    }
    // True until a filter fails if in match-all mode, False until made True by a filter in match-any mode
    let filterMatch = this.checked.matchAll;
    Object.keys(this.activeFilters).forEach(filterType => {
      if (this.activeFilters[filterType] != null) {
        if (this.checked.matchAll) {
          filterMatch = filterMatch && this.activeFilters[filterType].filterFunc(mail);
        } else {
          filterMatch = this.activeFilters[filterType].filterFunc(mail) ? true : filterMatch;
        }
      }
    });
    if (!filterMatch) {
      this.numFiltered++;
    }
    return filterMatch;
  }
}
