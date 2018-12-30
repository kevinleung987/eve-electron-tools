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
  checked = { filters: true, ship: true, location: true, involved: true, alerts: true, matchAll: false };
  // Filter-related variables
  numFiltered = 0;
  filtersHidden = false;
  filterSettings = {
    ship: { whichType: WhichType.Victim, filterType: ShipFilterType.Ship },
    location: { filterType: LocationFilterType.Region },
    involved: { whichType: WhichType.Victim, filterType: InvolvedFilterType.Character },
  };
  // Filter functions
  activeFilters: {
    ship?: ((mail: ZkillMail) => boolean),
    location?: ((mail: ZkillMail) => boolean),
    involved?: ((mail: ZkillMail) => boolean)
  } = {};
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
        this.mails.unshift(message);
        console.log(message);
        console.log(this.applyFilters(message));
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
    this.alert.success('Cleared killmails.');
  }

  openLink(url: string) { this.electron.openUrl(url); }

  onSubmitShip(event) {
    // Create filter function, store the id to filter for in closure
    let filterFunc: ((typeId: number) => boolean) = null;
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
        this.activeFilters.ship = (mail: ZkillMail) => filterFunc(mail.victim.ship_type_id);
        break;
      case WhichType.Attacker:
        this.activeFilters.ship = (mail: ZkillMail) => {
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
    console.log('Match:', this.applyFilters(this.mails[0]));
  }

  onSubmitLocation(event) {
    switch (this.filterSettings.location.filterType) {
      case LocationFilterType.Region:
        const filterRegionId = this.universe.getRegionId(event);
        this.activeFilters.location = (mail: ZkillMail) => {
          const regionId = this.universe.getSystemRegion(mail.solar_system_id);
          return regionId === filterRegionId;
        };
        break;
      case LocationFilterType.System:
        const filterSystemId = this.universe.getSystemId(event);
        this.activeFilters.location = (mail: ZkillMail) => {
          return mail.solar_system_id === filterSystemId;
        };
        break;
    }
    console.log('Match:', this.applyFilters(this.mails[0]));
  }

  async onSubmitInvolved(event) {
    // Create filter function, store the id to filter for in closure
    let filterFunc: ((character: Character) => boolean) = null;
    let filterToken: string;
    switch (this.filterSettings.involved.filterType) {
      case InvolvedFilterType.Character: filterToken = 'character'; break;
      case InvolvedFilterType.Corporation: filterToken = 'corporation'; break;
      case InvolvedFilterType.Alliance: filterToken = 'alliance'; break;
    }
    const searchResult = await this.eve.search(event, filterToken, true);
    if (searchResult[filterToken] == null) { this.alert.error(`No ${filterToken} found.`); return; }
    const filterId = searchResult[filterToken][0];
    filterFunc = (character: Character) => (character[filterToken + '_id'] === filterId);
    // How we apply filterFunc depends on whether we're filltering for Victim/Attacker
    switch (this.filterSettings.involved.whichType) {
      case WhichType.Victim:
        this.activeFilters.involved = (mail: ZkillMail) => filterFunc(mail.victim);
        break;
      case WhichType.Attacker:
        this.activeFilters.involved = (mail: ZkillMail) => {
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
    console.log('Match:', this.applyFilters(this.mails[0]));
  }

  applyFilters(mail: ZkillMail): boolean {
    let filtered = false;
    Object.keys(this.activeFilters).forEach(filterType => {
      if (this.activeFilters[filterType] != null && this.activeFilters[filterType](mail)) {
        filtered = true;

      }
    });
    if (filtered) {
      this.numFiltered++;
    }
    return filtered;
  }
}
