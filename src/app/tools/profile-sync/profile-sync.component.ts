import { Component, OnInit } from '@angular/core';
import { Selected } from 'src/app/models/Profile.model';
import { ConfigService } from 'src/app/services/config.service';
import { ElectronService } from 'src/app/services/electron.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-profile-sync',
  templateUrl: './profile-sync.component.html',
  styleUrls: ['./profile-sync.component.scss']
})
export class ProfileSyncComponent implements OnInit {
  profilesPath: string;
  accounts: string[] = [];
  characters: string[] = [];
  accountBindings: { [id: number]: string };
  name = '';
  s = Selected;
  constructor(private electron: ElectronService, private config: ConfigService, private alert: AlertService) { }

  ngOnInit() {
    this.profilesPath = this.config.default('profilesPath', null);
    this.accountBindings = this.config.default('profileAccountBindings', {});
    console.log(this.accountBindings);
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
    if (!this.electron.fs.existsSync(this.profilesPath)) { this.alert.warning('Folder does not exist.'); return; }
    // Synchronous to minimze UI defects.
    const result = this.electron.fs.readdirSync(this.profilesPath);
    const accounts = [];
    const characters = [];
    result.forEach((file) => {
      if (/core_user_[0-9]*.dat/.test(file)) {
        const account = {
          id: Number(file.substring(10, file.length - 4)),
          selected: Selected.None
        };
        accounts.push(account);
      } else if (/core_char_[0-9]*.dat/.test(file)) {
        const character = {
          id: Number(file.substring(10, file.length - 4)),
          selected: Selected.None
        };
        characters.push(character);
      }
    });
    this.accounts = accounts;
    this.characters = characters;
    console.log(this.accounts, this.characters);
  }

  select(item, selectionType: Selected) {
    const collection = this.accounts.includes(item) ? this.accounts : this.characters;
    if (selectionType === Selected.Primary) {
      collection.forEach((result: any) => {
        if (result['selected'] === Selected.Primary && result !== item) {
          result['selected'] = null;
        }
      });
    }
    item['selected'] = item['selected'] === selectionType ? null : selectionType;
  }

  bindName() {
    let selected = null;
    this.accounts.forEach((account) => {
      if (account['selected'] === Selected.Primary) {
        selected = account['id'];
      }
    });
    if (selected != null) {
      this.accountBindings[selected] = this.name;
      this.config.set('profileAccountBindings', this.accountBindings);
      this.name = null;
    }
  }
}


