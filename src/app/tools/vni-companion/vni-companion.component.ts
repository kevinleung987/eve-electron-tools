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
  logsPath: string;
  gameLogWatcher: FSWatcher = null;
  gameLogFiles: { [fileName: string]: { id: number, name: string, filePath: string, size: number, isk: number } } = {};
  characters = [];
  fs = this.electron.fs;

  constructor(private config: ConfigService, private electron: ElectronService, private navigation: NavigationService,
    private eve: EveService) { }

  ngOnInit() {
    this.logsPath = this.config.default('logsPath', null);
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
  }

  gameLogsPath() {
    return this.electron.path.join(this.logsPath, 'Gamelogs') + this.electron.path.sep;
  }

  parseGameLogs() {
    return this.fs.watch(this.gameLogsPath(), async (eventType, filename) => {
      // const starttime = Date.now();
      if (!this.gameLogFiles[filename]) {
        const filePath = this.gameLogsPath() + filename;
        const name = this.fs.readFileSync(filePath).toString().split('\n')[2].split(': ')[1];
        this.gameLogFiles[filename] = {
          id: null,
          name,
          filePath,
          size: this.fs.statSync(filePath).size,
          isk: 0
        };
        this.characters.push(this.gameLogFiles[filename]);
        const search = await this.eve.search(name, 'character', true);
        if (!(search && search['character'] && search['character'].length > 0)) { return; }
        const id = search['character'][0];
        this.gameLogFiles[filename].id = id;
        console.log(this.gameLogFiles[filename]);
      } else {
        this.gameLogFiles[filename].isk++;
        this.electron.updateView();
        console.log(this.checkGameLogChanges(filename));
      }
      // console.log((Date.now() - starttime) / 1000);
    });
  }

  checkGameLogChanges(filename: string): string[] {
    // https://stackoverflow.com/questions/38190773/node-js-monitor-file-for-changes-and-parse-them/38191024#38191024
    // Read only the changes that occur from when we last saw the file by looking at file sizes
    const filePath = this.gameLogFiles[filename].filePath;
    const newFileSize = this.fs.statSync(filePath).size;
    const fileSize = this.gameLogFiles[filename].size;
    const sizeDiff = newFileSize - fileSize;
    if (sizeDiff < 0) {
      this.gameLogFiles[filename].size = newFileSize;
      return [];
    }
    const buffer = Buffer.alloc(sizeDiff);
    const fd = this.fs.openSync(filePath, 'r');
    this.fs.readSync(fd, buffer, 0, sizeDiff, fileSize);
    this.fs.closeSync(fd);
    this.gameLogFiles[filename].size = newFileSize;
    return buffer.toString().replace(/ *\<[^)]*\> */g, '').split('\n');
  }
}
