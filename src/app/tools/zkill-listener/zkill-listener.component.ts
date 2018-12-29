import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { ZkillMail } from 'src/app/models/Zkill.model';
import { AlertService } from 'src/app/services/alert.service';
import { ConfigService } from 'src/app/services/config.service';
import { ElectronService } from 'src/app/services/electron.service';
import { UniverseService } from 'src/app/services/universe.service';
import { environment } from 'src/environments/environment';
import { SuggestionService } from 'src/app/services/suggestion.service';

@Component({
  selector: 'app-zkill-listener',
  templateUrl: './zkill-listener.component.html',
  styleUrls: ['./zkill-listener.component.scss']
})
export class ZkillListenerComponent implements OnInit {
  listening = false;
  mails: ZkillMail[] = [];
  private length = 5;
  private socket: WebSocketSubject<{}>;
  private activeFilters: {
    ship?: ((mail: ZkillMail) => boolean),
    location?: ((mail: ZkillMail) => boolean),
    involved?: ((mail: ZkillMail) => boolean)
  } = {};
  filterTypes = {
    ship: { whichType: 'victim', filterType: 'ship' },
    location: { filterType: 'region' },
    involved: { whichType: 'victim', filterType: 'character' },
  };
  filtersHidden = false;
  shipChecked = true;
  locationChecked = true;
  involvedChecked = true;

  constructor(private config: ConfigService, private electron: ElectronService,
    private alert: AlertService, public universe: UniverseService,
    private suggest: SuggestionService) { }

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

  getSuggestions(type: string) {
    switch (type) {
      case 'ship':
        switch (this.filterTypes.ship.filterType) {
          case 'ship':
            return this.suggest.typeNames;
          case 'group':
            return this.suggest.groupNames;
        }
        break;
      case 'location':
        switch (this.filterTypes.location.filterType) {
          case 'region':
            return this.suggest.regionNames;
          case 'system':
            return this.suggest.systemNames;
        }
        break;
    }
  }
}
