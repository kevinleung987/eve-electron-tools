import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LocalScanComponent } from './local-scan/local-scan.component';

const routes: Routes = [
  {path: '', component: LocalScanComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
