export class ShipModel {
    public shipDepartment: ShipDepartment;
    constructor(public shipId: string,
                public shipPosition: ShipPosition,
                public shipDirection: ShipDirection,
                public shipStats: ShipStats,
                public colorFront: string,
                public colorBack: string) {
        this.shipDepartment = ShipDepartment.getDepartment(shipPosition, shipDirection);
    }
}

export class ShipPosition {
    constructor(public xIndex: number, public yIndex: number) {}
}


export class ShipDirection {
    constructor(public left: string, public right: string, public front: string, public back: string) {}
}

export class ShipStats {
    constructor(public totalHp: number,
                public attack: number,
                public defence: number,
                public range: number) {}
}

// Can make each department specific
export class ShipDepartment {
    constructor(public leftWeapon: Department,
                public rightWeapon: Department,
                public leftEngine: Department,
                public rightEngine: Department) {}

    static getDepartment(shipPosition: ShipPosition, shipDirection: ShipDirection): ShipDepartment {
        let cordAX = shipPosition.xIndex - 0.5;
        let cordAY = shipPosition.yIndex - 0.5;
        let cordBX = shipPosition.xIndex + 0.5;
        let cordBY = shipPosition.yIndex - 0.5;
        let cordCX = shipPosition.xIndex - 0.5;
        let cordCY = shipPosition.yIndex + 0.5;
        let cordDX = shipPosition.xIndex + 0.5;
        let cordDY = shipPosition.yIndex + 0.5;
       // console.log(shipDirection);

        if (shipDirection.left=='y') {
            const rightEngine = new Department(cordDX, cordDY, 1000, null);
            const leftEngine = new Department(cordCX, cordCY, 1000, null);
            const rightWeapon = new Department(cordBX, cordBY, 1000, null);
            const leftWeapon = new Department(cordAX, cordAY, 1000, null);
            return new ShipDepartment(leftWeapon, rightWeapon, leftEngine, rightEngine);
        }
        else if (shipDirection.right=='y') {
            const leftWeapon = new Department(cordDX, cordDY, 1000, null);
            const rightWeapon = new Department(cordCX, cordCY, 1000, null);
            const leftEngine = new Department(cordBX, cordBY, 1000, null);
            const rightEngine = new Department(cordAX, cordAY, 1000, null);
            return new ShipDepartment(leftWeapon, rightWeapon, leftEngine, rightEngine);
        }
        else if (shipDirection.front=='y') {
            const leftEngine = new Department(cordDX, cordDY, 1000, null);
            const leftWeapon = new Department(cordCX, cordCY, 1000, null);
            const rightEngine = new Department(cordBX, cordBY, 1000, null);
            const rightWeapon = new Department(cordAX, cordAY, 1000, null);
            return new ShipDepartment(leftWeapon, rightWeapon, leftEngine, rightEngine);
        }
        else if (shipDirection.back=='y') {
            const rightWeapon = new Department(cordDX, cordDY, 1000, null);
            const rightEngine = new Department(cordCX, cordCY, 1000, null);
            const leftWeapon = new Department(cordBX, cordBY, 1000, null);
            const leftEngine = new Department(cordAX, cordAY, 1000, null);
            return new ShipDepartment(leftWeapon, rightWeapon, leftEngine, rightEngine);
        }
    }
}

export class Department {
    constructor(public xIndex: number, public yIndex: number, public health: number, public character: Character) {}
}

export class Character {
    constructor(public name: string, question: string[]) {}
}