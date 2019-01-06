export class ConfigFile {
  isDemo = true;
  profilesPath = '';
  profileAccountBindings: { [id: number]: string } = {};
  logsPath = '';
  watchedSystem = -1;
  channels = [];
}
