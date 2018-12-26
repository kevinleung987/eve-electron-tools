import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { AlertService } from 'src/app/services/alert.service';
import { ConfigService } from 'src/app/services/config.service';
import { ElectronService } from 'src/app/services/electron.service';
import { UniverseService } from 'src/app/services/universe.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-zkill-listener',
  templateUrl: './zkill-listener.component.html',
  styleUrls: ['./zkill-listener.component.scss']
})
export class ZkillListenerComponent implements OnInit {
  private length = 5;
  private socket: WebSocketSubject<{}>;
  public listening = false;
  public mails = [];

  constructor(private config: ConfigService, private electron: ElectronService, private alert: AlertService,
    public universe: UniverseService) { }

  ngOnInit() {
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
      message => {
        message['attackers'].forEach(element => {
          if (element['final_blow']) {
            message['final_blow'] = element;
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

  openLink(url: string) {
    this.electron.openUrl(url);
  }
}
