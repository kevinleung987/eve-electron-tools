import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'src/app/services/electron.service';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  constructor(public electron: ElectronService, private router: Router, private alert: AlertService) { }

  ngOnInit() { }

  navigate(route: string) {
    if (this.electron.isElectron) {
      this.router.navigate([route]);
    } else {
      this.alert.warning('This feature is only available in the Desktop Client, you can download it from the GitHub Releases page.');
    }
  }
}
