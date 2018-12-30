import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import {
  FilterType,
  InvolvedFilterType,
  LocationFilterType,
  ShipFilterType,
  WhichType,
  ZkillMail,
} from 'src/app/models/Zkill.model';
import { AlertService } from 'src/app/services/alert.service';
import { ConfigService } from 'src/app/services/config.service';
import { ElectronService } from 'src/app/services/electron.service';
import { SuggestionService } from 'src/app/services/suggestion.service';
import { UniverseService } from 'src/app/services/universe.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-zkill-listener',
  templateUrl: './zkill-listener.component.html',
  styleUrls: ['./zkill-listener.component.scss']
})
export class ZkillListenerComponent implements OnInit {
  listening = false;
  mails: ZkillMail[] = [];
  filterSettings = {
    ship: { whichType: WhichType.Victim, filterType: ShipFilterType.Ship },
    location: { filterType: LocationFilterType.Region },
    involved: { whichType: WhichType.Victim, filterType: InvolvedFilterType.Character },
  };
  filtersHidden = false;
  shipChecked = true;
  locationChecked = true;
  involvedChecked = true;
  // Bindings to enums for template
  whichType = WhichType;
  filterType = FilterType;
  shipFilterType = ShipFilterType;
  locationFilterType = LocationFilterType;
  involvedFilterType = InvolvedFilterType;
  private length = 5;
  private socket: WebSocketSubject<{}>;
  private activeFilters: {
    ship?: ((mail: ZkillMail) => boolean),
    location?: ((mail: ZkillMail) => boolean),
    involved?: ((mail: ZkillMail) => boolean)
  } = {};

  constructor(private config: ConfigService, private electron: ElectronService,
    private alert: AlertService, public universe: UniverseService, public suggest: SuggestionService) { }

  ngOnInit() {
    // @ts-ignore
    window.$('app-zkill-listener').bootstrapMaterialDesign();
    if (this.config.isDemo()) {
      this.mails.push(environment.zkillExample);
      console.log(this.mails);
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
    this.alert.success('Cleared killmails.');
  }

  openLink(url: string) { this.electron.openUrl(url); }

  onSubmit(event, type: string) {
    console.log(event, type);
  }
}
