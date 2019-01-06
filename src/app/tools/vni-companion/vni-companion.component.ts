import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/app/services/navigation.service';
import { ElectronService } from 'src/app/services/electron.service';
import { ConfigService } from 'src/app/services/config.service';
import { EveService } from 'src/app/services/eve.service';
import { FSWatcher } from 'fs';

@Component({
  selector: 'app-vni-companion',
  templateUrl: './vni-companion.component.html',
  styleUrls: ['./vni-companion.component.scss']
})
export class VNICompanionComponent implements OnInit {
  // RegExes for parsing log entries // regexr.com/45t6h
  readonly isBounty: RegExp = /\[.*\] \(bounty\)/g;
  readonly isCombat: RegExp = /\[.*\] \(combat\)/g;
  readonly getBounty: RegExp = /([\d]+(\,|\.))+[0-9]{2} ISK/g;

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
  fs = this.electron.fs; // Alias to reduce clutter

  constructor(public config: ConfigService, private electron: ElectronService, private navigation: NavigationService,
    private eve: EveService) { }

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
    this.characters.forEach(character => {
      character.lastActive++;
    });
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
    // https://stackoverflow.com/questions/38190773/node-js-monitor-file-for-changes-and-parse-them/38191024#38191024
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
      bounty = bounty.substring(0, bounty.length - 4).replace(/\,/g, '');
      console.log(bounty);
      character.isk += Number(bounty);
    } else if (this.isCombat.test(logEntry)) { // <b>.*?<\/b>

      if (/to (\w|\s)* -/g.test(logEntry)) {// Dealing damage to

      } else if (/from (\w|\s)* -/g.test(logEntry)) {// Taking damage from

      }
    }
  }
}
