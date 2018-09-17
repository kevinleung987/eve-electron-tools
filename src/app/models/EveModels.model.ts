export class EveCharacter {
  name: string;
  corporation: number;
}

export class EveCorporation {
  name: string;
  alliance: number;
  image: string;
}

export class EveAlliance {
  name: string;
  corporations: Array<number>;
  image: string;
}
