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
                public colorBack: string) {}
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

            const rightEngine = new Department(cordBX, cordBY, 1000, null,true);
            const leftEngine = new Department(cordDX, cordDY, 1000, null,true);
            const rightWeapon = new Department(cordAX, cordAY, 1000, null,true);
            const leftWeapon = new Department(cordCX, cordCY, 1000, null,true);
            return new ShipDepartment(  [rightEngine, leftEngine, leftWeapon, rightWeapon]  );
        } else if (shipDirection.dir == Direction.Right) {
            const leftWeapon = new Department(cordBX, cordBY, 1000, null,true);
            const rightWeapon = new Department(cordDX, cordDY, 1000, null,true);
            const leftEngine = new Department(cordAX, cordAY, 1000, null,true);
            const rightEngine = new Department(cordCX, cordCY, 1000, null,true);
            return new ShipDepartment( [rightEngine, leftEngine, leftWeapon, rightWeapon]  );
        } else if (shipDirection.dir == Direction.Up) {
            const leftEngine = new Department(cordCX, cordCY, 1000, null,true);
            const leftWeapon = new Department(cordAX, cordAY, 1000, null,true);
            const rightEngine = new Department(cordDX, cordDY, 1000, null,true);
            const rightWeapon = new Department(cordBX, cordBY, 1000, null,true);
            return new ShipDepartment( [rightEngine, leftEngine, leftWeapon, rightWeapon]  );
        }
        else if (shipDirection.dir == Direction.Down) {
            const rightWeapon = new Department(cordCX, cordCY, 1000, null,true);
            const rightEngine = new Department(cordAX, cordAY, 1000, null,true);
            const leftWeapon = new Department(cordDX, cordDY, 1000, null,true);
            const leftEngine = new Department(cordBX, cordBY, 1000, null,true);

            return new ShipDepartment( [rightEngine, leftEngine, leftWeapon, rightWeapon]  );
        }
    }

    static updateDepartment(shipPosition: ShipPosition, shipDirection: ShipDirection, fieldSize: number,ship:ShipModel ): ShipDepartment {
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

        let departRE = ship.shipDepartment.departmentArray[0];
        let departLE = ship.shipDepartment.departmentArray[1];
        let departLW = ship.shipDepartment.departmentArray[2];
        let departRW = ship.shipDepartment.departmentArray[3];

        if (shipDirection.dir == Direction.Left) {
            const rightEngine = new Department(cordBX, cordBY, departRE.health, departRE.character,departRE.alive);
            const leftEngine = new Department(cordDX, cordDY, departLE.health, departLE.character,departLE.alive);
            const rightWeapon = new Department(cordAX, cordAY,departRW.health, departRW.character,departRW.alive);
            const leftWeapon = new Department(cordCX, cordCY, departLW.health, departLW.character,departLW.alive);
            return new ShipDepartment(  [rightEngine, leftEngine, leftWeapon, rightWeapon]  );
        } else if (shipDirection.dir == Direction.Right) {
            const leftWeapon = new Department(cordBX, cordBY, departLW.health, departLW.character,departLW.alive);
            const rightWeapon = new Department(cordDX, cordDY, departRW.health, departRW.character,departRW.alive);
            const leftEngine = new Department(cordAX, cordAY,  departLE.health, departLE.character,departLE.alive);
            const rightEngine = new Department(cordCX, cordCY, departRE.health, departRE.character,departRE.alive);
            return new ShipDepartment( [rightEngine, leftEngine, leftWeapon, rightWeapon]  );
        } else if (shipDirection.dir == Direction.Up) {
            const leftEngine = new Department(cordCX, cordCY,  departLE.health, departLE.character,departLE.alive);
            const leftWeapon = new Department(cordAX, cordAY,  departLW.health, departLW.character,departLW.alive);
            const rightEngine = new Department(cordDX, cordDY,departRE.health, departRE.character,departRE.alive);
            const rightWeapon = new Department(cordBX, cordBY,departRW.health, departRW.character,departRW.alive);
            return new ShipDepartment( [rightEngine, leftEngine, leftWeapon, rightWeapon]  );
        }
        else if (shipDirection.dir == Direction.Down) {
            const rightWeapon = new Department(cordCX, cordCY,departRW.health, departRW.character,departRW.alive);
            const rightEngine = new Department(cordAX, cordAY,departRE.health, departRE.character,departRE.alive);
            const leftWeapon = new Department(cordDX, cordDY,  departLW.health, departLW.character,departLW.alive);
            const leftEngine = new Department(cordBX, cordBY, departLE.health, departLE.character,departLE.alive);
            return new ShipDepartment( [rightEngine, leftEngine, leftWeapon, rightWeapon]  );
        }
    }




}

export class Department {
    constructor(public xIndex: number, public yIndex: number, public health: number, public character: Character,public alive:boolean) {}
}

export class Character {
    constructor(public name: string, question: string[]) {}
}

export class CollisionInfo {
    constructor(public resultantMove: ShipPosition, public moveCount: number) {}
}
