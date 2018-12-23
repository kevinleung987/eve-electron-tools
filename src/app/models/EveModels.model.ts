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

export class DisplayCorporation {
  corporation: EveCorporation;
  count: number;
  highlighted: boolean;
}

export class DisplayAlliance {
  alliance: EveAlliance;
  count: number;
  highlighted: boolean;
}
