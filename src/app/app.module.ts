import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { PapaParseModule } from 'ngx-papaparse';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule, CustomReuseStrategy } from 'src/app/app-routing.module';
import { AppComponent } from 'src/app/app.component';
import { MyErrorHandler } from 'src/app/services/error.service';
import { HeaderComponent } from 'src/app/shared/header/header.component';
import { HomeComponent } from 'src/app/shared/home/home.component';
import { NavbarComponent } from 'src/app/shared/navbar/navbar.component';
import { EvePipe } from 'src/app/shared/pipes/eve.pipe';
import { ImagePipe } from 'src/app/shared/pipes/image.pipe';
import { UniversePipe } from 'src/app/shared/pipes/universe.pipe';
import { SearchComponent } from 'src/app/shared/search/search.component';
import { DirectionalScanComponent } from 'src/app/tools/directional-scan/directional-scan.component';
import { LocalScanComponent } from 'src/app/tools/local-scan/local-scan.component';
import { MarketComponent } from 'src/app/tools/market/market.component';
import { ProfileSyncComponent } from 'src/app/tools/profile-sync/profile-sync.component';
import { VNICompanionComponent } from 'src/app/tools/vni-companion/vni-companion.component';
import { ZkillListenerComponent } from 'src/app/tools/zkill-listener/zkill-listener.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HeaderComponent,
    HomeComponent,
    LocalScanComponent,
    DirectionalScanComponent,
    MarketComponent,
    ZkillListenerComponent,
    VNICompanionComponent,
    EvePipe,
    ImagePipe,
    UniversePipe,
    ProfileSyncComponent,
    SearchComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    PapaParseModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      timeOut: 2500,
      maxOpened: 5,
      autoDismiss: true,
      preventDuplicates: true,
      onActivateTick: true
    })
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    { provide: ErrorHandler, useClass: MyErrorHandler }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
