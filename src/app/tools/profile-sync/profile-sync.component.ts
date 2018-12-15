import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/config.service';
import { ElectronService } from 'src/app/services/electron.service';

@Component({
  selector: 'app-profile-sync',
  templateUrl: './profile-sync.component.html',
  styleUrls: ['./profile-sync.component.scss']
})
export class ProfileSyncComponent implements OnInit {
  profilesPath: string;
  accounts: string[] = [];
  characters: string[] = [];
  constructor(private electron: ElectronService, private config: ConfigService) { }

  ngOnInit() {
    this.profilesPath = this.config.get('profilesPath');
    if (this.profilesPath) {
      this.parseProfiles();
    }
  }

  selectFolder() {
    this.electron.remote.dialog.showOpenDialog({ properties: ['openDirectory'] }, (result) => {
      if (result && result.length > 0) {
        console.log(result);
        this.profilesPath = result[0];
        this.config.set('profilesPath', this.profilesPath);
        this.parseProfiles();
      }
    });
  }

  openProfilesFolder() {
    this.electron.remote.shell.openItem(this.profilesPath);
  }

  parseProfiles() {
    this.electron.fs.readdir(this.profilesPath, (error, result) => {
      const accounts = [];
      const characters = [];
      result.forEach((file) => {
        if (/core_user_[0-9]*.dat/.test(file)) {
          accounts.push(file.substring(10, file.length - 4));
        } else if (/core_char_[0-9]*.dat/.test(file)) {
          characters.push(file.substring(10, file.length - 4));
        }
      });
      this.accounts = accounts;
      this.characters = characters;
      this.electron.updateView('Parse profile directory.');
      console.log(this.accounts, this.characters);
    });
  }
}
