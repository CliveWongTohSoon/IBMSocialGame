"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var ship_model_1 = require("./ship-model");
var game_service_1 = require("./game.service");
var GameComponent = /** @class */ (function () {
    function GameComponent(gameService) {
        var _this = this;
        this.gameService = gameService;
        this.text = 'Right';
        this.disabledBool = true;
        this.renderMe = true;
        gameService.init(25).subscribe(function (battleField) { return _this.battleField = battleField; });
    }
    GameComponent.prototype.renderBackgroundColor = function (col) {
        if (col.color) {
            return col.color;
        }
        return 'white';
    };
    GameComponent.prototype.start = function (numberOfPlayers) {
        var _this = this;
        // randomDir();
        console.log(numberOfPlayers);
        console.log("Working");
        this.gameService.createShip(Number(numberOfPlayers))
            .subscribe(function (allBattleShip) { return _this.allBattleShip = allBattleShip; });
    };
    GameComponent.prototype.rotateRight = function (ship) {
        console.log('Rotating...');
        this.gameService.rotate(ship, true);
    };
    GameComponent.prototype.rotateLeft = function (ship) {
        console.log('Rotating...');
        this.gameService.rotate(ship, false);
    };
    GameComponent.prototype.move = function (ship) {
        this.gameService.move(ship, this.battleField.rowGrid.length);
        //this.gameService.checkCollision(ship, this.battleField.rowGrid.length);
    };
    GameComponent.prototype.shieldUp = function (ship) {
        this.gameService.shield(ship, 0);
    };
    GameComponent.prototype.shieldLeft = function (ship) {
        this.gameService.shield(ship, 1);
    };
    GameComponent.prototype.shieldDown = function (ship) {
        this.gameService.shield(ship, 2);
    };
    GameComponent.prototype.shieldRight = function (ship) {
        this.gameService.shield(ship, 3);
    };
    GameComponent.prototype.fullTurns = function () {
        var turn;
        var i;
        var relevantShips;
        for (turn = 1; turn <= 3; turn++) {
            relevantShips = this.allBattleShip.filter(function (aShip) { return (aShip.shipActions.act[(turn - 1)] == ship_model_1.Action.FrontShield); });
            for (i = 0; i < relevantShips.length; i++) {
                this.shieldUp(relevantShips[i]);
            }
            relevantShips = this.allBattleShip.filter(function (aShip) { return (aShip.shipActions.act[(turn - 1)] == ship_model_1.Action.LeftShield); });
            for (i = 0; i < relevantShips.length; i++) {
                this.shieldLeft(relevantShips[i]);
            }
            relevantShips = this.allBattleShip.filter(function (aShip) { return (aShip.shipActions.act[(turn - 1)] == ship_model_1.Action.BackShield); });
            for (i = 0; i < relevantShips.length; i++) {
                this.shieldDown(relevantShips[i]);
            }
            relevantShips = this.allBattleShip.filter(function (aShip) { return (aShip.shipActions.act[(turn - 1)] == ship_model_1.Action.RightShield); });
            for (i = 0; i < relevantShips.length; i++) {
                this.shieldRight(relevantShips[i]);
            }
            relevantShips = this.allBattleShip.filter(function (aShip) { return (aShip.shipActions.act[(turn - 1)] == ship_model_1.Action.ShootFront); });
            for (i = 0; i < relevantShips.length; i++) {
                //this.Shoot(relevantShips[i])
            }
            relevantShips = this.allBattleShip.filter(function (aShip) { return (aShip.shipActions.act[(turn - 1)] == ship_model_1.Action.MoveFront); });
            for (i = 0; i < relevantShips.length; i++) {
                this.move(relevantShips[i]);
            }
            relevantShips = this.allBattleShip.filter(function (aShip) { return (aShip.shipActions.act[(turn - 1)] == ship_model_1.Action.RightTurn); });
            for (i = 0; i < relevantShips.length; i++) {
                this.rotateRight(relevantShips[i]);
            }
            relevantShips = this.allBattleShip.filter(function (aShip) { return (aShip.shipActions.act[(turn - 1)] == ship_model_1.Action.LeftTurn); });
            for (i = 0; i < relevantShips.length; i++) {
                this.rotateLeft(relevantShips[i]);
            }
            //this.gameService.checkCollision()
            // check for ships with the same x,y coordinate!!!!
        }
    };
    GameComponent = __decorate([
        core_1.Component({
            selector: 'app-game',
            templateUrl: './game.component.html',
            styleUrls: ['./game.component.css'],
            providers: [game_service_1.GameService]
        }),
        __metadata("design:paramtypes", [game_service_1.GameService])
    ], GameComponent);
    return GameComponent;
}());
exports.GameComponent = GameComponent;
