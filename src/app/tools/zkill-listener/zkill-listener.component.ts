import { Component, OnInit } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { UniverseService } from '../../services/universe.service';

@Component({
  selector: 'app-zkill-listener',
  templateUrl: './zkill-listener.component.html',
  styleUrls: ['./zkill-listener.component.scss']
})
export class ZkillListenerComponent implements OnInit {
  private length = 10;
  private socket: WebSocketSubject<{}>;
  public listening = false;
  public mails = [];

  constructor(public universe: UniverseService) {
    this.mails.push({
      attackers: [
        {
          alliance_id: 99001634,
          character_id: 95108555,
          corporation_id: 342600165,
          damage_done: 1036,
          faction_id: 500004,
          final_blow: false,
          security_status: -4.3,
          ship_type_id: 11371,
          weapon_type_id: 11371
        },
        {
          alliance_id: 99001634,
          character_id: 1386146895,
          corporation_id: 342600165,
          damage_done: 1031,
          faction_id: 500004,
          final_blow: false,
          security_status: -9.4,
          ship_type_id: 11400,
          weapon_type_id: 2488
        },
        {
          alliance_id: 99001634,
          character_id: 1834740568,
          corporation_id: 342600165,
          damage_done: 940,
          faction_id: 500004,
          final_blow: false,
          security_status: -9.5,
          ship_type_id: 17703,
          weapon_type_id: 17703
        },
        {
          alliance_id: 99001634,
          character_id: 92574496,
          corporation_id: 342600165,
          damage_done: 572,
          faction_id: 500004,
          final_blow: true,
          security_status: -9.4,
          ship_type_id: 37480,
          weapon_type_id: 24473
        },
        {
          alliance_id: 99001634,
          character_id: 2114242763,
          corporation_id: 98534111,
          damage_done: 75,
          faction_id: 500004,
          final_blow: false,
          security_status: 2.9,
          ship_type_id: 608,
          weapon_type_id: 608
        },
        {
          alliance_id: 99001634,
          character_id: 96210406,
          corporation_id: 98472511,
          damage_done: 0,
          faction_id: 500004,
          final_blow: false,
          security_status: 4.8,
          ship_type_id: 17841,
          weapon_type_id: 3178
        },
        {
          alliance_id: 99001634,
          character_id: 826803624,
          corporation_id: 342600165,
          damage_done: 0,
          faction_id: 500004,
          final_blow: false,
          security_status: -2.4,
          ship_type_id: 34562,
          weapon_type_id: 2889
        }
      ],
      final_blow: {
        alliance_id: 99001634,
        character_id: 92574496,
        corporation_id: 342600165,
        damage_done: 572,
        faction_id: 500004,
        final_blow: true,
        security_status: -9.4,
        ship_type_id: 37480,
        weapon_type_id: 24473
      },
      killmail_id: 72883408,
      killmail_time: '2018-10-12T21:21:43Z',
      solar_system_id: 30045337,
      victim: {
        alliance_id: 1728396456,
        character_id: 95384934,
        corporation_id: 685495596,
        damage_taken: 3654,
        items: [
          { flag: 11, item_type_id: 22291, quantity_dropped: 1, singleton: 0 },
          { flag: 93, item_type_id: 31788, quantity_destroyed: 1, singleton: 0 },
          { flag: 5, item_type_id: 24473, quantity_dropped: 200, singleton: 0 },
          { flag: 30, item_type_id: 24473, quantity_dropped: 41, singleton: 0 },
          { flag: 5, item_type_id: 45998, quantity_destroyed: 1, singleton: 0 },
          { flag: 28, item_type_id: 10631, quantity_destroyed: 1, singleton: 0 },
          { flag: 22, item_type_id: 6003, quantity_destroyed: 1, singleton: 0 },
          { flag: 5, item_type_id: 28682, quantity_destroyed: 1, singleton: 0 },
          { flag: 94, item_type_id: 31788, quantity_destroyed: 1, singleton: 0 },
          { flag: 29, item_type_id: 24473, quantity_destroyed: 41, singleton: 0 },
          { flag: 5, item_type_id: 24471, quantity_destroyed: 400, singleton: 0 },
          { flag: 21, item_type_id: 4027, quantity_dropped: 1, singleton: 0 },
          { flag: 27, item_type_id: 24473, quantity_destroyed: 41, singleton: 0 },
          { flag: 27, item_type_id: 10631, quantity_destroyed: 1, singleton: 0 },
          { flag: 92, item_type_id: 26929, quantity_destroyed: 1, singleton: 0 },
          { flag: 30, item_type_id: 10631, quantity_destroyed: 1, singleton: 0 },
          { flag: 28, item_type_id: 24473, quantity_destroyed: 41, singleton: 0 },
          { flag: 5, item_type_id: 27333, quantity_destroyed: 600, singleton: 0 },
          { flag: 5, item_type_id: 28668, quantity_dropped: 50, singleton: 0 },
          { flag: 29, item_type_id: 10631, quantity_destroyed: 1, singleton: 0 },
          { flag: 5, item_type_id: 27321, quantity_dropped: 600, singleton: 0 },
          { flag: 20, item_type_id: 3831, quantity_dropped: 1, singleton: 0 },
          { flag: 5, item_type_id: 27327, quantity_destroyed: 600, singleton: 0 },
          { flag: 5, item_type_id: 24475, quantity_dropped: 400, singleton: 0 },
          { flag: 12, item_type_id: 22291, quantity_dropped: 1, singleton: 0 },
          { flag: 5, item_type_id: 27315, quantity_dropped: 600, singleton: 0 },
          { flag: 19, item_type_id: 448, quantity_dropped: 1, singleton: 0 },
          { flag: 5, item_type_id: 2817, quantity_dropped: 600, singleton: 0 }
        ],
        position: { x: -354341337679.15, y: 2626453461078.7, z: 468978037092.21 },
        ship_type_id: 602
      },
      zkb: {
        locationID: 50016326,
        hash: 'ce0abbe614ec6e5d1020964eebc6974157df3b16',
        fittedValue: 3046246.98,
        totalValue: 12498114.01,
        points: 1,
        npc: false,
        solo: false,
        awox: false,
        esi:
          'https://esi.evetech.net/latest/killmails/72883408/ce0abbe614ec6e5d1020964eebc6974157df3b16/',
        url: 'https://zkillboard.com/kill/72883408/'
      }
    });
    console.log(this.mails[0]);
  }

  ngOnInit() { }

  start() {
    this.socket = new WebSocketSubject('wss://zkillboard.com:2096');
    this.socket.next({ action: 'sub', channel: 'killstream' });
    console.log('Started listening to WebSocket.');
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
          this.mails.shift();
        }
      },
      err => {
        console.error(err);
        this.listening = false;
      });
  }

  stop() {
    this.socket.unsubscribe();
    console.log('Stopped listening to WebSocket.');
    this.listening = false;
  }

  clear() { this.mails = []; }
}
