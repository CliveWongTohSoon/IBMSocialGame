export class ShipModel {

    constructor(public shipPosition: ShipPosition,
                public shipDirection: ShipDirection,
                public shipStats: ShipStats,
                public weaponLeft: WeaponLeft,
                public weaponRight: WeaponRight,
                public engineLeft: EngineLeft,
                public engineRight: EngineRight) {}
}

export class WeaponLeft {
    constructor(public xIndex: number, public yIndex: number, public health: number, public life: boolean){}
}

export class ShipPosition {
    constructor(public xIndex: number, public yIndex: number) {}
}

export class ShipDirection {
    constructor(public left: boolean, public right: boolean, public front: boolean, public back: boolean) {}
}

export class ShipStats {
    constructor(public totalHp: number,
                public attack: number,
                public defence: number,
                public dep: ShipDepartment) {}
}

// Can make each department specific
export class ShipDepartment {
    constructor(public navDep: Department, public engineerDep: Department) {}
}

export class Department {
    constructor(public health: number, public character: Character) {}
}

export class Character {
    constructor(public name: string, question: string[]) {}
}