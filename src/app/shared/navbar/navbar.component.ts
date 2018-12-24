import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'src/app/services/electron.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  constructor(public electron: ElectronService) { }

  ngOnInit() { }
}
