import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/app/services/navigation.service';
import { ElectronService } from 'src/app/services/electron.service';
import { ConfigService } from 'src/app/services/config.service';
import { EveService } from 'src/app/services/eve.service';
import { FSWatcher } from 'fs';
import { UniverseService } from 'src/app/services/universe.service';
import { AlertService } from 'src/app/services/alert.service';

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
  gameLogWatcher: FSWatcher = null;
  gameLogFiles: {
    [fileName: string]:
    {
      id: number,
      name: string,
      fileName: string,
      filePath: string,
      size: number,
      isk: number,
      lastActive: number
    }
  } = {};
  characters = [];

  totalIsk = 0;

  constructor(public config: ConfigService, private electron: ElectronService, private navigation: NavigationService,
    private eve: EveService, private universe: UniverseService, private alert: AlertService) { }

  ngOnInit() {
    this.logsPath = this.config.default('logsPath', null);
    setInterval(this.incrementTime.bind(this), 1000);
  }

  selectLogsFolder() {
    this.electron.remote.dialog.showOpenDialog({ properties: ['openDirectory'] }, (result) => {
      if (result && result.length > 0) {
        console.log(result);
        this.logsPath = result[0];
        this.config.set('logsPath', this.logsPath);
      }
    });
  }

  startListeningGameLogs() {
    this.gameLogWatcher = this.parseGameLogs();
  }

  stopListeningGameLogs() {
    this.gameLogWatcher.close();
    this.gameLogWatcher = null;
  }

  gameLogsPath() {
    return this.electron.path.join(this.logsPath, 'Gamelogs') + this.electron.path.sep;
  }

  incrementTime() {
    if (this.gameLogWatcher != null) {
      this.characters.forEach(character => {
        character.lastActive++;
        if (character.lastActive >= this.inactiveTime && character.lastActive % this.alertInterval === 0) {
          this.alert.playAlert('alert.wav');
        }
      });
    }
  }

  parseGameLogs() {
    return this.fs.watch(this.gameLogsPath(), async (eventType, fileName) => {
      // const starttime = Date.now();
      if (!this.gameLogFiles[fileName]) {
        const filePath = this.gameLogsPath() + fileName;
        const name = this.fs.readFileSync(filePath).toString().split('\n')[2].split(': ')[1];
        this.gameLogFiles[fileName] = {
          id: null,
          name: name.trim(),
          fileName,
          filePath,
          size: this.fs.statSync(filePath).size,
          isk: 0,
          lastActive: 0
        };
        this.characters.push(this.gameLogFiles[fileName]);
        this.characters.sort((a, b) => a.name < b.name ? -1 : 1);
        const search = await this.eve.search(name, 'character', true);
        if (!(search && search['character'] && search['character'].length > 0)) { return; }
        const id = search['character'][0];
        this.gameLogFiles[fileName].id = id;
        console.log(this.gameLogFiles[fileName]);
      } else {
        this.electron.updateView();
        const changes = this.checkGameLogChanges(fileName);
        // console.log(changes);
        changes.forEach((change: string) => {
          if (change.length === 0) { return; }
          this.parseLogEntry(fileName, change);
        });
      }
      // console.log((Date.now() - starttime) / 1000);
    });
  }

  checkGameLogChanges(fileName: string): string[] {
    // Read only the changes that occur from when we last saw the file by looking at file sizes
    const filePath = this.gameLogFiles[fileName].filePath;
    const newFileSize = this.fs.statSync(filePath).size;
    const fileSize = this.gameLogFiles[fileName].size;
    const sizeDiff = newFileSize - fileSize;
    if (sizeDiff < 0) {
      this.gameLogFiles[fileName].size = newFileSize;
      return [];
    }
    const buffer = Buffer.alloc(sizeDiff);
    const fd = this.fs.openSync(filePath, 'r');
    this.fs.readSync(fd, buffer, 0, sizeDiff, fileSize);
    this.fs.closeSync(fd);
    this.gameLogFiles[fileName].size = newFileSize;
    // Remove XML tags and split by line
    return buffer.toString().replace(/<.*?>/g, '').split('\n');
  }

  parseLogEntry(fileName: string, logEntry: string) {
    const character = this.gameLogFiles[fileName];
    character.lastActive = 0;
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
