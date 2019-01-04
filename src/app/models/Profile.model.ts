export enum Selected {
  Primary,
  Secondary,
  None
}

export class Profile {
  id: number;
  selected: Selected;
  fileName: string;
  filePath: string;
  mtime: Date;
}
