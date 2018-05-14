"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShipModel = /** @class */ (function () {
    function ShipModel(shipId, shipPosition, shipDirection, shipStats, colorFront, colorBack, shipActions) {
        this.shipId = shipId;
        this.shipPosition = shipPosition;
        this.shipDirection = shipDirection;
        this.shipStats = shipStats;
        this.colorFront = colorFront;
        this.colorBack = colorBack;
        this.shipActions = shipActions;
    }
    return ShipModel;
}());
exports.ShipModel = ShipModel;
var ShipPosition = /** @class */ (function () {
    function ShipPosition(xIndex, yIndex) {
        this.xIndex = xIndex;
        this.yIndex = yIndex;
    }
    return ShipPosition;
}());
exports.ShipPosition = ShipPosition;
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Left"] = 1] = "Left";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Right"] = 3] = "Right";
})(Direction = exports.Direction || (exports.Direction = {}));
var ShipDirection = /** @class */ (function () {
    function ShipDirection(dir) {
        this.dir = dir;
    }
    return ShipDirection;
}());
exports.ShipDirection = ShipDirection;
var shipStats = /** @class */ (function () {
    function shipStats(totalHp, attack, defence, range, shieldActive, shieldDirection) {
        this.totalHp = totalHp;
        this.attack = attack;
        this.defence = defence;
        this.range = range;
        this.shieldActive = shieldActive;
        this.shieldDirection = shieldDirection;
    }
    return shipStats;
}());
exports.shipStats = shipStats;
// Can make each department specific
var ShipDepartment = /** @class */ (function () {
    function ShipDepartment(leftWeapon, rightWeapon, leftEngine, rightEngine) {
        this.leftWeapon = leftWeapon;
        this.rightWeapon = rightWeapon;
        this.leftEngine = leftEngine;
        this.rightEngine = rightEngine;
    }
    ShipDepartment.getDepartment = function (shipPosition, shipDirection, fieldSize) {
        // top left quadrant
        var cordAX = shipPosition.xIndex - 0.5;
        var cordAY = shipPosition.yIndex - 0.5;
        // top right quadrant
        var cordBX = shipPosition.xIndex + 0.5;
        if (cordBX == fieldSize) {
            cordBX = cordBX - fieldSize;
        }
        ;
        var cordBY = shipPosition.yIndex - 0.5;
        // bottom left quadrant
        var cordCX = shipPosition.xIndex - 0.5;
        var cordCY = shipPosition.yIndex + 0.5;
        if (cordCY == fieldSize) {
            cordCY = cordCY - fieldSize;
        }
        ;
        // bottom right quadrant
        var cordDX = shipPosition.xIndex + 0.5;
        if (cordDX == fieldSize) {
            cordDX = cordDX - fieldSize;
        }
        ;
        var cordDY = shipPosition.yIndex + 0.5;
        if (cordDY == fieldSize) {
            cordDY = cordDY - fieldSize;
        }
        ;
        if (shipDirection.dir == Direction.Left) {
            var rightEngine = new Department(cordBX, cordBY, 1000, null);
            var leftEngine = new Department(cordDX, cordDY, 1000, null);
            var rightWeapon = new Department(cordAX, cordAY, 1000, null);
            var leftWeapon = new Department(cordCX, cordCY, 1000, null);
            return new ShipDepartment(leftWeapon, rightWeapon, leftEngine, rightEngine);
        }
        else if (shipDirection.dir == Direction.Right) {
            var leftWeapon = new Department(cordBX, cordBY, 1000, null);
            var rightWeapon = new Department(cordDX, cordDY, 1000, null);
            var leftEngine = new Department(cordAX, cordAY, 1000, null);
            var rightEngine = new Department(cordCX, cordCY, 1000, null);
            return new ShipDepartment(leftWeapon, rightWeapon, leftEngine, rightEngine);
        }
        else if (shipDirection.dir == Direction.Up) {
            var leftEngine = new Department(cordCX, cordCY, 1000, null);
            var leftWeapon = new Department(cordAX, cordAY, 1000, null);
            var rightEngine = new Department(cordDX, cordDY, 1000, null);
            var rightWeapon = new Department(cordBX, cordBY, 1000, null);
            return new ShipDepartment(leftWeapon, rightWeapon, leftEngine, rightEngine);
        }
        else if (shipDirection.dir == Direction.Down) {
            var rightWeapon = new Department(cordCX, cordCY, 1000, null);
            var rightEngine = new Department(cordAX, cordAY, 1000, null);
            var leftWeapon = new Department(cordDX, cordDY, 1000, null);
            var leftEngine = new Department(cordBX, cordBY, 1000, null);
            return new ShipDepartment(leftWeapon, rightWeapon, leftEngine, rightEngine);
        }
    };
    return ShipDepartment;
}());
exports.ShipDepartment = ShipDepartment;
var Department = /** @class */ (function () {
    function Department(xIndex, yIndex, health, character) {
        this.xIndex = xIndex;
        this.yIndex = yIndex;
        this.health = health;
        this.character = character;
    }
    return Department;
}());
exports.Department = Department;
var Character = /** @class */ (function () {
    function Character(name, question) {
        this.name = name;
    }
    return Character;
}());
exports.Character = Character;
var Action;
(function (Action) {
    Action[Action["FrontShield"] = 0] = "FrontShield";
    Action[Action["LeftShield"] = 1] = "LeftShield";
    Action[Action["BackShield"] = 2] = "BackShield";
    Action[Action["RightShield"] = 3] = "RightShield";
    Action[Action["ShootFront"] = 4] = "ShootFront";
    Action[Action["MoveFront"] = 5] = "MoveFront";
    Action[Action["RightTurn"] = 6] = "RightTurn";
    Action[Action["LeftTurn"] = 7] = "LeftTurn";
    Action[Action["DoNothing"] = 8] = "DoNothing";
})(Action = exports.Action || (exports.Action = {}));
var ShipActions = /** @class */ (function () {
    function ShipActions(act) {
        this.act = act;
    }
    return ShipActions;
}());
exports.ShipActions = ShipActions;
