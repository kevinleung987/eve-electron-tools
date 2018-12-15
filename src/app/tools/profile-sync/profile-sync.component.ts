import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'src/app/services/electron.service';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-profile-sync',
  templateUrl: './profile-sync.component.html',
  styleUrls: ['./profile-sync.component.scss']
})
export class ProfileSyncComponent implements OnInit {
  profilesPath: string;
  constructor(private electron: ElectronService, private config: ConfigService) { }

  ngOnInit() {
    this.profilesPath = this.config.get('profilesPath');
  }

  selectFolder() {
    this.electron.remote.dialog.showOpenDialog({ properties: ['openDirectory'] }, (result) => {
      if (result.length > 0) {
        console.log(result);
        this.profilesPath = result[0];
        this.config.set('profilesPath', this.profilesPath);
      }
    });
  }
}
