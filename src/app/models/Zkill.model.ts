export enum Filter {
  Ship = 'Ship',
  Location = 'Location',
  Involved = 'Involved',
  Value = 'Value'
}

export enum WhichType {
  Victim = 'Victim',
  Attacker = 'Attacker'
}

export enum ShipFilterType {
  Ship = 'Ship',
  ShipGroup = 'Ship Group'
}

export enum LocationFilterType {
  Region = 'Region',
  System = 'System'
}

export enum InvolvedFilterType {
  Character = 'Character',
  Corporation = 'Corporation',
  Alliance = 'Alliance'
}

export class ZkillMail {
  attackers: Attacker[];
  killmail_id: number;
  killmail_time: string;
  solar_system_id: number;
  victim: Victim;
  zkb: Zkb;
  final_blow: Attacker;
}

export class Character {
  alliance_id: number;
  character_id: number;
  corporation_id: number;
  ship_type_id: number;
}

export class Attacker extends Character {
  damage_done: number;
  final_blow: boolean;
  security_status: number;
  weapon_type_id: number;
}

export class Victim extends Character {
  damage_taken: number;
  items: Item[];
  position: Position;
}

export class Item {
  flag: number;
  item_type_id: number;
  quantity_dropped?: number;
  singleton: number;
  quantity_destroyed?: number;
}

export class Position {
  x: number;
  y: number;
  z: number;
}

export class Zkb {
  locationID: number;
  hash: string;
  fittedValue: number;
  totalValue: number;
  points: number;
  npc: boolean;
  solo: boolean;
  awox: boolean;
  esi: string;
  url: string;
}
