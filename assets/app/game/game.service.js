"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var battle_field_model_1 = require("./battle-field-model");
var ship_model_1 = require("./ship-model");
var ship_model_2 = require("./ship-model");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
var GameService = /** @class */ (function () {
    function GameService() {
    }
    // --------------------------------- CREATE OBSERVABLE ---------------------------------------------------------- //
    GameService.prototype.init = function (length) {
        var rowContent = [];
        for (var i = 0; i < length; i++) {
            var colContent = [];
            for (var j = 0; j < length; j++) {
                var column = new battle_field_model_1.TableContent(i, null);
                colContent.push(column);
            }
            rowContent.push(colContent);
        }
        this.battleField = new battle_field_model_1.BattleFieldModel(rowContent);
        return Observable_1.Observable.of(this.battleField);
    };
    GameService.prototype.createShip = function (numberOfShips) {
        var _this = this;
        var maxX = this.battleField.rowGrid[0].length / (numberOfShips * 2);
        var maxY = this.battleField.rowGrid.length;
        this.allBattleShips = Array.apply(null, { length: numberOfShips })
            .map(function (_, i) {
            var randomColorBack = _this.genRandomColor();
            var randomColorFront = _this.shadeColor(randomColorBack, 20);
            var randomX = _this.randomCoor(maxX, 2 * i * maxX), randomY = _this.randomCoor(maxY, 0);
            var initShipPosition = new ship_model_1.ShipPosition(randomX, randomY);
            var randomDir = _this.randomDir(4);
            var initShipDirection = new ship_model_1.ShipDirection(randomDir);
            var initShipStat = new ship_model_1.shipStats(5, 5, 5, 5, false, 0);
            var initActions = new ship_model_1.ShipActions(null);
            var newShip = new ship_model_1.ShipModel(_this.uidGenerator(), initShipPosition, initShipDirection, initShipStat, randomColorFront, randomColorBack, initActions);
            newShip.shipDepartment = ship_model_1.ShipDepartment.getDepartment(initShipPosition, initShipDirection, _this.battleField.rowGrid.length);
            i++;
            return newShip;
        });
        this.updateGridWithAllShip();
        console.log("LOL");
        console.log(this.allBattleShips.length);
        return Observable_1.Observable.of(this.allBattleShips);
    };
    GameService.prototype.updateGridWithAllShip = function () {
        var _this = this;
        this.battleField.rowGrid.map(function (col) { return col.map(function (c) { return c.color = null; }); });
        this.battleField = this.allBattleShips.reduce(function (prev, curr) {
            prev = _this.updateGrid(curr);
            return prev;
        }, this.battleField);
    };
    GameService.prototype.updateGrid = function (currentShip) {
        return battle_field_model_1.BattleFieldModel.renderGrid(currentShip.shipDepartment, this.battleField, currentShip.colorFront, currentShip.colorBack);
    };
    GameService.prototype.genRandomColor = function () {
        var randomColor = "#" + ('00000' + (Math.random() * (1 << 24) | 0).toString(16)).slice(-6);
        randomColor === '#FFFFF' ? '#990000' : '#' + randomColor;
        return randomColor;
    };
    GameService.prototype.shadeColor = function (color, percent) {
        return '#000000';
        // const f = parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        // return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    };
    GameService.prototype.updateShip = function (ship, newPosition, newDirection) {
        ship.shipPosition = newPosition;
        ship.shipDirection = newDirection;
        ship.shipDepartment = ship_model_1.ShipDepartment.getDepartment(newPosition, newDirection, this.battleField.rowGrid.length);
        this.updateGridWithAllShip();
    };
    GameService.prototype.worldRound = function (position, fieldSize) {
        var newPosition = position;
        if (position.xIndex >= fieldSize) {
            newPosition.xIndex = position.xIndex - fieldSize;
        }
        else if (position.xIndex < 0) {
            newPosition.xIndex = position.xIndex + fieldSize;
        }
        if (position.yIndex >= fieldSize) {
            newPosition.yIndex = position.yIndex - fieldSize;
        }
        else if (position.yIndex < 0) {
            newPosition.yIndex = position.yIndex + fieldSize;
        }
        return newPosition;
    };
    GameService.prototype.move = function (ship, fieldSize) {
        var newPosition = new ship_model_1.ShipPosition(ship.shipPosition.xIndex, ship.shipPosition.yIndex);
        if (ship.shipDirection.dir == ship_model_2.Direction.Up) {
            console.log('Enter up');
            newPosition.yIndex = newPosition.yIndex - 1;
        }
        else if (ship.shipDirection.dir == ship_model_2.Direction.Down) {
            console.log('Enter down');
            newPosition.yIndex = newPosition.yIndex + 1;
        }
        else if (ship.shipDirection.dir == ship_model_2.Direction.Right) {
            console.log('Enter right');
            newPosition.xIndex = newPosition.xIndex + 1;
        }
        else if (ship.shipDirection.dir == ship_model_2.Direction.Left) {
            console.log('Enter left');
            newPosition.xIndex = newPosition.xIndex - 1;
        }
        newPosition = this.worldRound(newPosition, fieldSize);
        this.updateShip(ship, newPosition, ship.shipDirection);
        this.checkCollision(ship, fieldSize);
    };
    GameService.prototype.checkCollision = function (ship, fieldSize) {
        var collidedShip1 = this.allBattleShips.filter(function (aShip) { return (((Math.abs(aShip.shipPosition.xIndex - ship.shipPosition.xIndex) <= 1) || (Math.abs(aShip.shipPosition.xIndex - ship.shipPosition.xIndex) == 24)) && ((Math.abs(aShip.shipPosition.yIndex - ship.shipPosition.yIndex) <= 1) || (Math.abs(aShip.shipPosition.yIndex - ship.shipPosition.yIndex) == 24))) && aShip.shipId !== ship.shipId; })[0];
        var collidedShip2 = this.allBattleShips.filter(function (aShip) { return (((Math.abs(aShip.shipPosition.xIndex - ship.shipPosition.xIndex) <= 1) || (Math.abs(aShip.shipPosition.xIndex - ship.shipPosition.xIndex) == 24)) && ((Math.abs(aShip.shipPosition.yIndex - ship.shipPosition.yIndex) <= 1) || (Math.abs(aShip.shipPosition.yIndex - ship.shipPosition.yIndex) == 24))) && aShip.shipId !== ship.shipId; })[1];
        console.log(collidedShip1);
        console.log(collidedShip2);
        if (collidedShip1) {
            collidedShip1.shipDirection.dir = ship.shipDirection.dir;
            ship.shipDirection.dir += 2;
            if (ship.shipDirection.dir > 3)
                ship.shipDirection.dir -= 4;
            console.log("shipDir =" + ship.shipDirection.dir);
            var kickback = Math.floor(Math.random() * 3 + 3);
            var i = 0;
            if (collidedShip2) {
                collidedShip2.shipDirection.dir = ship.shipDirection.dir;
                while (i < kickback) {
                    this.move(collidedShip1, fieldSize);
                    this.move(collidedShip2, fieldSize);
                    this.move(ship, fieldSize);
                    i++;
                }
                collidedShip2.shipDirection.dir = this.randomDir(4);
                this.updateShip(collidedShip2, collidedShip2.shipPosition, ship.shipDirection);
                collidedShip1.shipDirection.dir = this.randomDir(4);
                this.updateShip(collidedShip1, collidedShip1.shipPosition, ship.shipDirection);
            }
            else {
                while (i < kickback) {
                    this.move(collidedShip1, fieldSize);
                    this.move(ship, fieldSize);
                    i++;
                }
                collidedShip1.shipDirection.dir = this.randomDir(4);
                this.updateShip(collidedShip1, collidedShip1.shipPosition, ship.shipDirection);
            }
            var newPosition = new ship_model_1.ShipPosition(ship.shipPosition.xIndex, ship.shipPosition.yIndex);
            var spinDistance = Math.floor(Math.random() * 5) - 3;
            console.log(spinDistance);
            if (ship.shipDirection.dir == ship_model_2.Direction.Up || ship.shipDirection.dir == ship_model_2.Direction.Down) {
                newPosition.xIndex = newPosition.xIndex + spinDistance;
            }
            else if (ship.shipDirection.dir == ship_model_2.Direction.Left || ship.shipDirection.dir == ship_model_2.Direction.Right) {
                newPosition.yIndex = newPosition.yIndex + spinDistance;
            }
            newPosition = this.worldRound(newPosition, fieldSize);
            ship.shipDirection.dir = this.randomDir(4);
            this.updateShip(ship, newPosition, ship.shipDirection);
        }
    };
    GameService.prototype.randomCollisionDir = function () {
        return Math.floor(Math.random() * 3);
    };
    GameService.prototype.rotate = function (ship, clockwise) {
        var newDirection = new ship_model_1.ShipDirection(ship.shipDirection.dir);
        if (clockwise) {
            if (newDirection.dir == 0) {
                newDirection.dir = 3;
            }
            else {
                newDirection.dir = ship.shipDirection.dir - 1;
            }
        }
        else {
            if (newDirection.dir == 3) {
                newDirection.dir = 0;
            }
            else {
                newDirection.dir = ship.shipDirection.dir + 1;
            }
        }
        this.updateShip(ship, ship.shipPosition, newDirection);
    };
    GameService.prototype.shield = function (ship, shieldDirection) {
        ship.shipStats.shieldActive = true;
        ship.shipStats.shieldDirection = shieldDirection;
        this.updateGridWithAllShip();
        console.log("shieldActive: " + ship.shipStats.shieldActive);
        console.log("shieldDirection " + ship.shipStats.shieldDirection);
    };
    // if(ship.ShipStats.shieldActive == 1 && ship.ShipStats.defence !=0) {
    //   NewShieldDirection = ship.ShipStats.shieldDirection + ship.shipDirection.dir;
    //   if (NewShieldDirection >=4){
    //       NewShieldDirection = NewShieldDirection%4;
    //   }
    GameService.prototype.randomDir = function (range) {
        return Math.floor(Math.random() * range);
    };
    GameService.prototype.randomCoor = function (max, start) {
        return Math.floor((Math.random() * max) + start) + 0.5; // + (prevPos + range)) (9 + adjustment)) + prevX + 8) + 0.5;
    };
    GameService.prototype.uidGenerator = function () {
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    };
    GameService.prototype.updateHealth = function (shooterShip, victimShip, affectedDep, shoot, turn) {
        var damage = shooterShip.shipStats.attack;
        if (victimShip.shipStats.shieldActive == true && shoot == true) {
            damage = this.shootShieldCheck(shooterShip, victimShip, damage);
        }
        else if (victimShip.shipStats.shieldActive == true && shoot == false) {
            damage = this.collisionShieldCheck(shooterShip, victimShip, damage, turn);
        }
        // if victimShip.shipDepartment[affectedDep].health < damage){
        //     victimShip.shipDepartment[affectedDep].health = 0;
        // }
        // else{
        //     victimShip.shipDepartment[affectedDep].health = victimShip.shipDepartment[affectedDep].health - damage;
        // }
        if (affectedDep == 0) {
            if (victimShip.shipDepartment.leftWeapon.health < damage) {
                victimShip.shipDepartment.leftWeapon.health = 0;
            }
            else {
                victimShip.shipDepartment.leftWeapon.health = victimShip.shipDepartment.leftWeapon.health - damage;
            }
        }
        if (affectedDep == 1) {
            if (victimShip.shipDepartment.rightWeapon.health < damage) {
                victimShip.shipDepartment.rightWeapon.health = 0;
            }
            else {
                victimShip.shipDepartment.rightWeapon.health = victimShip.shipDepartment.rightWeapon.health - damage;
            }
        }
        if (affectedDep == 2) {
            if (victimShip.shipDepartment.leftEngine.health < damage) {
                victimShip.shipDepartment.leftEngine.health = 0;
            }
            else {
                victimShip.shipDepartment.leftEngine.health = victimShip.shipDepartment.leftEngine.health - damage;
            }
        }
        if (affectedDep == 3) {
            if (victimShip.shipDepartment.rightEngine.health < damage) {
                victimShip.shipDepartment.rightEngine.health = 0;
            }
            else {
                victimShip.shipDepartment.rightEngine.health = victimShip.shipDepartment.rightEngine.health - damage;
            }
        }
    };
    GameService.prototype.shootShieldCheck = function (shooterShip, victimShip, damage) {
        var shieldGridDirection;
        // let enemyDirection: Direction = 4;
        var reducedDamage = damage;
        shieldGridDirection = victimShip.shipDirection.dir + victimShip.shipStats.shieldDirection;
        if (shieldGridDirection > 3) {
            shieldGridDirection = shieldGridDirection - 4;
        }
        if (Math.abs(shieldGridDirection - shooterShip.shipDirection.dir) == 2) {
            reducedDamage = damage * (1 - victimShip.shipStats.defence);
        }
        // let xDiff = victimShip.shipPosition.xIndex - shooterShip.shipPosition.xIndex;
        // let yDiff = victimShip.shipPosition.xIndex - shooterShip.shipPosition.yIndex;
        // if (Math.abs(xDiff) < 1) {
        //     if (yDiff > 0) {
        //         enemyDirection = Direction.Up;
        //     }
        //     else {
        //         enemyDirection = Direction.Down;
        //     }
        // }
        // else if (Math.abs(yDiff) < 1) {
        //     if (xDiff > 0) {
        //         enemyDirection = Direction.Left;
        //     }
        //     else {
        //         enemyDirection = Direction.Right;
        //     }
        // }
        //
        // if (shieldGridDirection == enemyDirection) {
        //     reducedDamage = damage * (1 - victimShip.shipStats.defence);
        // }
        return reducedDamage;
    };
    GameService.prototype.collisionShieldCheck = function (updatingShip, referShip, damage, turn) {
        var shieldGridDirection;
        var reducedDamage = damage;
        var xdiff = updatingShip.shipPosition.xIndex - referShip.shipPosition.xIndex;
        var ydiff = updatingShip.shipPosition.yIndex - referShip.shipPosition.yIndex;
        shieldGridDirection = updatingShip.shipDirection.dir + updatingShip.shipStats.shieldDirection;
        if (shieldGridDirection > 3) {
            shieldGridDirection = shieldGridDirection - 4;
        }
        if (referShip.shipActions.act[turn - 1] == ship_model_1.Action.MoveFront) {
            if (Math.abs(shieldGridDirection - referShip.shipDirection.dir) == 2) {
                reducedDamage = damage * (1 - updatingShip.shipStats.defence);
            }
        }
        else if (referShip.shipActions.act[turn - 1] == ship_model_1.Action.RightTurn || referShip.shipActions.act[turn - 1] == ship_model_1.Action.LeftTurn) {
            if (xdiff > 0) {
                if (shieldGridDirection == ship_model_2.Direction.Left) {
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
            else if (xdiff < 0) {
                if (shieldGridDirection == ship_model_2.Direction.Right) {
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
            if (ydiff > 0) {
                if (shieldGridDirection == ship_model_2.Direction.Up) {
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
            else if (ydiff < 0) {
                if (shieldGridDirection == ship_model_2.Direction.Down) {
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
        }
        else if (updatingShip.shipActions.act[turn - 1] == ship_model_1.Action.MoveFront) {
            if (updatingShip.shipDirection.dir == shieldGridDirection) {
                reducedDamage = damage * (1 - updatingShip.shipStats.defence);
            }
        }
        else if (updatingShip.shipActions.act[turn - 1] == ship_model_1.Action.LeftTurn || updatingShip.shipActions.act[turn - 1] == ship_model_1.Action.RightTurn) {
            if (xdiff > 0) {
                if (shieldGridDirection == ship_model_2.Direction.Left) {
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
            else if (xdiff < 0) {
                if (shieldGridDirection == ship_model_2.Direction.Right) {
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
            if (ydiff > 0) {
                if (shieldGridDirection == ship_model_2.Direction.Up) {
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
            else if (ydiff < 0) {
                if (shieldGridDirection == ship_model_2.Direction.Down) {
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
        }
        return reducedDamage;
    };
    GameService.prototype.inputAction = function (ship, act, turn) {
        var maxActions = 3;
        if (ship.shipActions.act.length >= maxActions) {
            return false;
        }
        else {
            ship.shipActions.act[(turn - 1)] = act;
            return true;
        }
    };
    GameService = __decorate([
        core_1.Injectable()
    ], GameService);
    return GameService;
}());
exports.GameService = GameService;
