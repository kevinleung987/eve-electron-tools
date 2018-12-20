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
  s = Selected;
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
          selected: Selected.None
        };
        accounts.push(account);
      } else if (/core_char_[0-9]*.dat/.test(file)) {
        const character = {
          id: file.substring(10, file.length - 4),
          selected: Selected.None
        };
        characters.push(character);
      }
    });
    this.accounts = accounts;
    this.characters = characters;
    console.log(this.accounts, this.characters);
  }

  select(item, key: Selected) {
    const collection = this.accounts.includes(item) ? this.accounts : this.characters;
    if (key === Selected.Primary) {
      collection.forEach((result: any) => {
        if (result['selected'] === Selected.Primary && result !== item) {
          result['selected'] = null;
        }
      });
    }
    item['selected'] = item['selected'] === key ? null : key;
  }
}

enum Selected {
  Primary,
  Secondary,
  None
}
