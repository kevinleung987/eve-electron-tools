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
    // Unfortunately needs to be synchronous to minimze UI defects.
    const result = this.electron.fs.readdirSync(this.profilesPath);
    const accounts = [];
    const characters = [];
    result.forEach((file) => {
      if (/core_user_[0-9]*.dat/.test(file)) {
        const account = {
          id: file.substring(10, file.length - 4),
          primary: false,
          secondary: false
        };
        accounts.push(account);
      } else if (/core_char_[0-9]*.dat/.test(file)) {
        const character = {
          id: file.substring(10, file.length - 4),
          primary: false,
          secondary: false
        };
        characters.push(character);
      }
    });
    this.accounts = accounts;
    this.characters = characters;
    console.log(this.accounts, this.characters);
  }

  select(item, isAccount: boolean) {
    if (isAccount) {
      this.accounts.forEach(account => {
        account['primary'] = false;
      });
    } else {
      this.characters.forEach(character => {
        character['primary'] = false;
      });
    }

    item['primary'] = true;
  }
}
