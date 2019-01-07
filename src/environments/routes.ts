import { ProfileSyncComponent } from 'src/app/tools/profile-sync/profile-sync.component';
import { VNICompanionComponent } from 'src/app/tools/vni-companion/vni-companion.component';

export const extraRoutes = [
  { path: 'profile-sync', component: ProfileSyncComponent },
  { path: 'vni-companion', component: VNICompanionComponent },
];
