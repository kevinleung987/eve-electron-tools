import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'src/app/services/electron.service';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-profile-sync',
  templateUrl: './profile-sync.component.html',
  styleUrls: ['./profile-sync.component.scss']
})
export class ProfileSyncComponent implements OnInit {
  constructor(private electron: ElectronService, private config: ConfigService) { }

  ngOnInit() {
  }
}
