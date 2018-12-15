import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-profile-sync',
  templateUrl: './profile-sync.component.html',
  styleUrls: ['./profile-sync.component.scss']
})
export class ProfileSyncComponent implements OnInit {
  constructor(private electron: ElectronService) { }

  ngOnInit() {
    const fs = this.electron.remote.require('fs');
    fs.readFile('F:/dev/eve-electron-tools/README.md', 'utf8', (err, data) => {
      console.log(data);
    });
  }
}
