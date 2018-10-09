import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { UniverseService } from '../services/universe.service';

@Component({
  selector: 'app-zkill-watcher',
  templateUrl: './zkill-watcher.component.html',
  styleUrls: ['./zkill-watcher.component.scss']
})
export class ZkillWatcherComponent implements OnInit {

  private socket: WebSocketSubject<{}>;
  public listening = false;
  public mails = [];

  constructor(public universe: UniverseService) {

  }

  ngOnInit() {

  }

  start() {
    this.socket = new WebSocketSubject('wss://zkillboard.com:2096');
    this.socket.next({ 'action': 'sub', 'channel': 'killstream' });
    console.log('Connection Started.');
    this.socket.subscribe(
      (message) => {
        if (this.mails.length > 10) {
          this.mails.shift();
        }
        this.mails.push(message);
        console.log(message);
      },
      (err) => console.error(err)
    );
    this.listening = true;
  }

  stop() {
    this.socket.unsubscribe();
    console.log('Connection Stopped.');
    this.listening = false;
  }

  clear() {
    this.mails = [];
  }

}
