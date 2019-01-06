import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/app/services/navigation.service';
import { ElectronService } from 'src/app/services/electron.service';
import { ConfigService } from 'src/app/services/config.service';
import { EveService } from 'src/app/services/eve.service';
import { FSWatcher } from 'fs';
import { UniverseService } from 'src/app/services/universe.service';
import { AlertService } from 'src/app/services/alert.service';
import * as chokidar from 'chokidar';
import { SuggestionService } from 'src/app/services/suggestion.service';

@Component({
  selector: 'app-vni-companion',
  templateUrl: './vni-companion.component.html',
  styleUrls: ['./vni-companion.component.scss']
})
export class VNICompanionComponent implements OnInit {
  // GroupIDs for faction/capital spawns
  readonly factionSpawns = [789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 807, 808, 809, 810, 811,
    812, 813, 814, 843, 844, 845, 846, 847, 848, 849, 850, 851, 852, 1285, 1286, 1287];
  readonly capitalSpawns = [1681, 1682, 1683, 1684, 1685, 1686, 1687, 1688, 1689, 1690, 1691, 1692];
  // RegExes for parsing log entries // regexr.com/45t6h
  readonly isBounty: RegExp = /\[.*\] \(bounty\)/g;
  readonly isCombat: RegExp = /\[.*\] \(combat\)/g;
  readonly getBounty: RegExp = /([\d]+(\,|\.))+[0-9]{2} ISK/g;
  readonly alertInterval = 30;
  fs = this.electron.fs; // Alias to reduce clutter
  inactiveTime = 600;
  logsPath: string;
  // Game logs - In-game activity
  gameLogWatcher: FSWatcher = null;
  gameLogFiles: {
    [file: string]:
    {
      id: number,
      name: string,
      isk: number,
      time: number,
      lastActive: number
    }
  } = {};
  characters = [];
  totalIsk = 0;
  // Chat logs - In-game chat messages
  chatLogWatcher: FSWatcher = null;
  channels = [];
  channelDetails: { [channelName: string]: { lastMessage: string } } = {};
  watchedSystem: number;
  numJumps = 10;
  matchExact = true;

  constructor(public config: ConfigService, private electron: ElectronService, private navigation: NavigationService,
    private eve: EveService, private universe: UniverseService, private alert: AlertService, public suggest: SuggestionService) { }

  ngOnInit() {
    // @ts-ignore
    window.$('app-vni-companion').bootstrapMaterialDesign();
    this.universe.waitUntilLoaded(() => {
      this.logsPath = this.config.default('logsPath', null);
      this.watchedSystem = this.config.default('watchedSystem', null);
      this.config.get('channels').forEach(channel => {
        this.channels.push(channel);
        this.channelDetails[channel] = { lastMessage: '' };
      });
      setInterval(this.incrementTime.bind(this), 1000);
    });
  }

  selectLogsFolder() {
    this.electron.remote.dialog.showOpenDialog({ properties: ['openDirectory'] }, (result) => {
      if (result && result.length > 0) {
        this.logsPath = result[0];
        this.config.set('logsPath', this.logsPath);
      }
    });
  }

  toggleGameLogsListener() {
    if (this.gameLogWatcher == null) {
      this.gameLogWatcher = this.parseGameLogs();
    } else {
      this.gameLogWatcher.close();
      this.gameLogWatcher = null;
    }
  }

  toggleChatLogsListener() {
    if (this.chatLogWatcher == null) {
      this.chatLogWatcher = this.parseChatLogs();
    } else {
      this.chatLogWatcher.close();
      this.chatLogWatcher = null;
    }
  }

  systemSelect(name) {
    this.watchedSystem = this.universe.getSystemId(name);
    this.config.set('watchedSystem', this.watchedSystem);
  }

  addChannel(channel) {
    if (!this.channels.includes(channel)) {
      this.channels.push(channel);
      this.channelDetails[channel] = { lastMessage: '' };
      this.config.set('channels', this.channels);
    } else {
      this.alert.warning('That channel already exists!');
    }
  }

  removeChannel(index) {
    this.channels.splice(index, 1);
    this.config.set('channels', this.channels);
  }

  gameLogsPath() {
    const path = this.electron.path.join(this.logsPath, 'Gamelogs') + this.electron.path.sep;
    if (!this.fs.existsSync(path)) {
      throw new Error('Gamelogs folder not found.');
    }
    return path;
  }

  chatLogsPath() {
    const path = this.electron.path.join(this.logsPath, 'Chatlogs') + this.electron.path.sep;
    if (!this.fs.existsSync(path)) {
      throw new Error('Chatlogs folder not found.');
    }
    return path;
  }

  incrementTime() {
    if (this.gameLogWatcher != null) {
      this.characters.forEach(character => {
        character.time++;
        if (character.time - character.lastActive >= this.inactiveTime) {
          if (character.time - character.lastActive % this.alertInterval === 0) {
            this.alert.playAlert('alert.wav');
            this.electron.flashFrame();
          }
        }
      });
    }
  }

  parseGameLogs() {
    return chokidar.watch(this.gameLogsPath(), {
      persistent: true,
      usePolling: true,
      interval: 100,
    }).on('error', error => console.log(`Watcher error: ${error}`))
      .on('ready', () => this.alert.success('Game Log Scanner initialized. Ready for changes.'))
      .on('raw', async (event, path, details) => {
        if (!this.gameLogFiles[path]) {
          const name = this.fs.readFileSync(path).toString().split('\n')[2].split(': ')[1];
          this.gameLogFiles[path] = {
            id: null,
            name: name.trim(),
            isk: 0,
            time: 0,
            lastActive: 0
          };
          this.characters.push(this.gameLogFiles[path]);
          this.characters.sort((a, b) => a.name < b.name ? -1 : 1);
          const search = await this.eve.search(name, 'character', true);
          if (!(search && search['character'] && search['character'].length > 0)) { return; }
          const id = search['character'][0];
          this.gameLogFiles[path].id = id;
          console.log(this.gameLogFiles[path]);
        } else {
          const changes = this.checkLogChanges(path, details);
          changes.forEach((change: string) => {
            this.parseGameLogEntry(path, change);
          });
        }
      });
  }

  parseChatLogs() {
    return chokidar.watch(this.chatLogsPath(), {
      persistent: true,
      usePolling: true,
      interval: 100,
    }).on('error', error => console.log(`Watcher error: ${error}`))
      .on('ready', () => this.alert.success('Chat Log Scanner initialized. Ready for changes.'))
      .on('raw', (event, path, details) => {
        const channel = this.electron.path.basename(path).replace(/_\d*_\d*.txt/g, '');
        if (this.channels.includes(channel)) {
          this.checkLogChanges(path, details, 'ucs2').forEach(item => {
            let message = item.match(/> .*/g)[0];
            message = message.substring(2, message.length);
            // Don't parse message if its a duplicate produced by multiple listeners/FSWatcher bug
            if (this.channelDetails[channel].lastMessage !== message) {
              this.channelDetails[channel].lastMessage = message;
              message.split(' ').forEach(token => {
                if (token.length >= 3) {
                  const match = this.suggest.match(this.suggest.systemNames, token, this.matchExact ? 'EQUALS' : 'STARTS_WITH');
                  if (match) {
                    const system = this.universe.getSystemId(match);
                    const distance = this.navigation.getShortestRoute(this.watchedSystem, system).length;
                    console.log(distance);
                    if (distance <= this.numJumps) {
                      this.alert.playAlert('alert.wav');
                      this.electron.flashFrame();
                    }
                  }
                }
              });
            }
          });
        }
      });
  }

  checkLogChanges(path: any, changeDetails, encoding: string = 'utf8'): string[] {
    // Read only the changes that occur from when we last saw the file by looking at file sizes
    const newFileSize = changeDetails.curr.size;
    const fileSize = changeDetails.prev.size;
    const sizeDiff = newFileSize - fileSize;
    if (sizeDiff < 0) {
      return [];
    }
    const buffer = Buffer.alloc(sizeDiff);
    const fd = this.fs.openSync(path, 'r');
    this.fs.readSync(fd, buffer, 0, sizeDiff, fileSize);
    this.fs.closeSync(fd);
    // Remove XML tags and split by line
    let lines = buffer.toString(encoding).replace(/<.*?>/g, '').split('\n');
    // Remove carriage return on Windows
    lines = lines.map(line => line.replace(/[\n\r]+/g, ''));
    lines = lines.filter((line) => line.length > 0);
    return lines;
  }

  parseGameLogEntry(fileName: string, logEntry: string) {
    const character = this.gameLogFiles[fileName];
    character.lastActive = character.time;
    if (this.isBounty.test(logEntry)) {
      let bounty = logEntry.match(this.getBounty)[0];
      // Extract just the number
      bounty = bounty.substring(0, bounty.length - 4).replace(/\,/g, '');
      character.isk += Number(bounty);
      this.totalIsk += Number(bounty);
    } else if (this.isCombat.test(logEntry)) {
      if (/from (\w|\s)* -/g.test(logEntry)) { // Taking damage from
        let attacker = logEntry.match(/from .+? -/g)[0];
        attacker = attacker.substring(5, attacker.length - 2);
        const groupId = this.universe.getTypeGroup(this.universe.getTypeId(attacker));
        if (this.capitalSpawns.includes(groupId)) {
          this.alert.playAlert('alert.wav');
          this.electron.flashFrame();
        } else if (this.factionSpawns.includes(groupId)) {
          this.alert.playAlert('cash.mp3');
          this.electron.flashFrame();
        }
      }
    }
  }
}
