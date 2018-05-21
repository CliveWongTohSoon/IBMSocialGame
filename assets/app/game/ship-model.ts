export class ShipModel {
    public shipDepartment: ShipDepartment;
    //public collidedShip: Array<ShipPosition>;
    //public collidedShipId: string[];
    public collisionInfo: CollisionInfo;
    public shipAction: ShipAction;
    constructor(public shipId: string,
                public shipPosition: ShipPosition,
                public shipDirection: ShipDirection,
                public shipStats: ShipStats,
                public colorFront: string,
                public colorBack: string) {
    }
}

export class ShipPosition {
    constructor(public xIndex: number, public yIndex: number) {}
}

export enum Direction {
    Up,
    Left,
    Down,
    Right
}

export class ShipDirection {
    constructor(public dir: Direction) {}
}

export class ShipStats {
    constructor(public totalHp: number,
                public attack: number,
                public attackRange: number,
                public defence: number,
                public range: number,
                public shieldActive: boolean,
                public shieldDirection: Direction) {}

}

export enum Action {
    FrontShield,
    LeftShield,
    BackShield,
    RightShield,
    ShootFront,
    MoveFront,
    RightTurn,
    LeftTurn,
    DoNothing
}

export class ShipAction {
    constructor(public act: Action[]) {}
}
// Can make each department specific
export class ShipDepartment {
    // constructor(public leftWeapon: Department,
    //             public rightWeapon: Department,
    //             public leftEngine: Department,
    //             public rightEngine: Department) {}
    constructor(public departmentArray: Department[]){}

    static getDepartment(shipPosition: ShipPosition, shipDirection: ShipDirection, fieldSize: number ): ShipDepartment {
        // top left quadrant
        let cordAX = shipPosition.xIndex - 0.5;
        let cordAY = shipPosition.yIndex - 0.5;

        // top right quadrant
        let cordBX = shipPosition.xIndex + 0.5;
        if (cordBX == fieldSize){cordBX = cordBX - fieldSize};
        let cordBY = shipPosition.yIndex - 0.5;

        // bottom left quadrant
        let cordCX = shipPosition.xIndex - 0.5;
        let cordCY = shipPosition.yIndex + 0.5;
        if (cordCY == fieldSize){cordCY = cordCY - fieldSize};

        // bottom right quadrant
        let cordDX = shipPosition.xIndex + 0.5;
        if (cordDX == fieldSize){cordDX = cordDX - fieldSize};
        let cordDY = shipPosition.yIndex + 0.5;
        if (cordDY == fieldSize){cordDY = cordDY - fieldSize};

        if (shipDirection.dir == Direction.Left) {
            const rightEngine = new Department(cordBX, cordBY, deptArray[0].health, null);
            const leftEngine = new Department(cordDX, cordDY, deptArray[1].health, null);
            const rightWeapon = new Department(cordAX, cordAY, deptArray[3].health, null);
            const leftWeapon = new Department(cordCX, cordCY, deptArray[2].health, null);
            return new ShipDepartment(  [rightEngine, leftEngine, leftWeapon, rightWeapon]  );
        } else if (shipDirection.dir == Direction.Right) {
            const leftWeapon = new Department(cordBX, cordBY, deptArray[2].health, null);
            const rightWeapon = new Department(cordDX, cordDY, deptArray[3].health, null);
            const leftEngine = new Department(cordAX, cordAY, deptArray[1].health, null);
            const rightEngine = new Department(cordCX, cordCY, deptArray[0].health, null);
            return new ShipDepartment( [rightEngine, leftEngine, leftWeapon, rightWeapon]  );
        } else if (shipDirection.dir == Direction.Up) {
            const leftEngine = new Department(cordCX, cordCY, deptArray[1].health, null);
            const leftWeapon = new Department(cordAX, cordAY, deptArray[2].health, null);
            const rightEngine = new Department(cordDX, cordDY, deptArray[0].health, null);
            const rightWeapon = new Department(cordBX, cordBY, deptArray[3].health, null);
            return new ShipDepartment( [rightEngine, leftEngine, leftWeapon, rightWeapon]  );
        } else if (shipDirection.dir == Direction.Down) {
            const rightWeapon = new Department(cordCX, cordCY, deptArray[3].health, null);
            const rightEngine = new Department(cordAX, cordAY, deptArray[0].health, null);
            const leftWeapon = new Department(cordDX, cordDY, deptArray[2].health, null);
            const leftEngine = new Department(cordBX, cordBY, deptArray[1].health, null);
            return new ShipDepartment( [rightEngine, leftEngine, leftWeapon, rightWeapon]  );
        }
    }
}

export class Department {
    constructor(public xIndex: number, public yIndex: number, public health: number, public character: Character) {}
}

export class Character {
    constructor(public name: string, question: string[]) {}
}

export class CollisionInfo {
    constructor(public resultantMove: ShipPosition, public moveCount: number) {}
}
