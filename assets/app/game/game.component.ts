import {Component, OnInit} from "@angular/core";
import {ShipModel, Action, ShipAction} from "./ship-model";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {GameService} from "./game.service";

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
    providers: [GameService]
})

export class GameComponent implements OnInit {

    text: string = 'Right';
    disabledBool = true;

    battleField: BattleFieldModel;
    allBattleShip: ShipModel[];

    constructor(private gameService: GameService) {
        gameService.init(25).subscribe(battleField => this.battleField = battleField);
    }

    renderBackgroundColor(col: TableContent) {
        return col.color ? col.color : 'white';
    }

    start(numberOfPlayers: string) {
        // randomDir();
        console.log(numberOfPlayers);

        console.log("Working");

        if (Number(numberOfPlayers) <= 2) {
            this.gameService.init(25)
                .subscribe(battleField => {
                    this.battleField = battleField;
                    this.gameService.createShip(Number(numberOfPlayers))
                        .subscribe(allBattleShip => this.allBattleShip = allBattleShip);
                });
        }

        else if (Number(numberOfPlayers) == 3) {
            this.gameService.init(30)
                .subscribe(battleField => {
                    this.battleField = battleField;
                    this.gameService.createShip(Number(numberOfPlayers))
                        .subscribe(allBattleShip => this.allBattleShip = allBattleShip);
                });
        }

       else if (Number(numberOfPlayers) >= 4) {
            this.gameService.init(36)
                .subscribe(battleField => {
                    this.battleField = battleField;
                    this.gameService.createShip(Number(numberOfPlayers))
                        .subscribe(allBattleShip => this.allBattleShip = allBattleShip);
                });
        }

        this.fullTurns();

    }

    rotateRight(ship: ShipModel) {
        console.log('Rotating...');
        this.gameService.rotate(ship, true);
    }

    rotateLeft(ship: ShipModel) {
        console.log('Rotating...');
        this.gameService.rotate(ship, false);
    }

    move(ship: ShipModel) {
        this.gameService.move(ship);
        //this.gameService.checkCollision(ship, this.battleField.rowGrid.length);
    }

    shieldUp(ship: ShipModel) {
        this.gameService.shield(ship, 0);
    }

    shieldLeft(ship: ShipModel) {
        this.gameService.shield(ship, 1);
    }

    shieldDown(ship: ShipModel) {
        this.gameService.shield(ship,2)
    }

    shieldRight(ship: ShipModel) {
        this.gameService.shield(ship,3)
    }

    shoot(ship:ShipModel){
        this.gameService.shoot(ship);
    }

    relativePosition(ship:ShipModel){
        this.gameService.relativePosition(ship,this.battleField.rowGrid.length);
    }

    inputAction(ship: ShipModel, act: Action):boolean{
        let maxActions = 3;
        if (ship.shipAction.act.length >= maxActions){
            console.log("Length" + ship.shipAction.act.length);
            return false;
        } else {
            ship.shipAction.act.push(act);
            return true;
        }
    }

    inputShieldUp(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.FrontShield);
        if (valid == false){
            console.log('Too many actions')
        }
    }
    inputShieldLeft(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.LeftShield);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    inputShieldRight(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.RightShield);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    inputShieldDown(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.BackShield);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    inputShoot(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.ShootFront);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    inputMove(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.MoveFront);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    inputRotateRight(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.RightTurn);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    inputRotateLeft(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.LeftTurn);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    inputDoNothing(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.DoNothing);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    fullTurns() {
        let turn: number;
        let i : number;
        for (turn = 1; turn <= 3; turn++) {
            for (i = 0; i < this.allBattleShip.length; i++) {
                if (this.allBattleShip[i].shipAction.act[(turn - 1)] == Action.FrontShield) {
                    this.shieldUp(this.allBattleShip[i]);
                }
            }
            for (i = 0; i < this.allBattleShip.length; i++) {
                if (this.allBattleShip[i].shipAction.act[(turn - 1)] == Action.LeftShield) {
                    this.shieldLeft(this.allBattleShip[i]);
                }
            }
            for (i = 0; i < this.allBattleShip.length; i++) {
                if (this.allBattleShip[i].shipAction.act[(turn - 1)] == Action.BackShield) {
                    this.shieldDown(this.allBattleShip[i]);
                }
            }
            for (i = 0; i < this.allBattleShip.length; i++) {
                if (this.allBattleShip[i].shipAction.act[(turn - 1)] == Action.RightShield) {
                    this.shieldRight(this.allBattleShip[i]);
                }
            }
            for (i = 0; i < this.allBattleShip.length; i++) {
                if (this.allBattleShip[i].shipAction.act[(turn - 1)] == Action.ShootFront) {
                    this.shoot(this.allBattleShip[i]);
                }
            }
            for (i = 0; i < this.allBattleShip.length; i++) {
                for (let k = 0; k < 4; k++) {
                    if (this.allBattleShip[i].shipDepartment.departmentArray[k].health <= 0) {
                        this.allBattleShip[i].shipDepartment.departmentArray[k].alive = false;
                    }
                }
            }
            for (i = 0; i < this.allBattleShip.length; i++) {
                if (this.allBattleShip[i].shipAction.act[(turn - 1)] == Action.MoveFront) {
                    this.move(this.allBattleShip[i]);
                }
            }
            for (i = 0; i < this.allBattleShip.length; i++) {
                if (this.allBattleShip[i].shipAction.act[(turn - 1)] == Action.RightTurn) {
                    this.rotateRight(this.allBattleShip[i]);
                }
            }
            for (i = 0; i < this.allBattleShip.length; i++) {
                if (this.allBattleShip[i].shipAction.act[(turn - 1)] == Action.LeftTurn) {
                    this.rotateLeft(this.allBattleShip[i]);
                }
            }
            this.gameService.checkCollision(this.battleField.rowGrid.length, turn);
            this.gameService.performCollision(this.battleField.rowGrid.length, turn);
            for (i = 0; i < this.allBattleShip.length; i++) {
                for (let k = 0; k < 4; k++) {
                    if (this.allBattleShip[i].shipDepartment.departmentArray[k].health <= 0) {
                        this.allBattleShip[i].shipDepartment.departmentArray[k].alive = false;
                    }
                }
                this.allBattleShip[i].shipStats.shieldActive = false;
            }

            // check for ships with the same x,y coordinate!!!!
            // shield deassert
        }

        // reset all action
        this.allBattleShip.map(ship => {
            ship.shipAction = new ShipAction([]);
        });
    }

    ngOnInit() {
        // this.gameService.createShipFromSocket().subscribe(console.log);
        this.gameService.createShipFromSocket().subscribe(shipModel => {
            const numberOfPlayers = shipModel.length;
            // if (numberOfPlayers <= 2) {
            //     this.gameService.init(25)
            //         .subscribe(battleField => {
            //             this.battleField = battleField;
            //         });
            // } else if (numberOfPlayers === 3) {
            //     this.gameService.init(30)
            //         .subscribe(battleField => {
            //             this.battleField = battleField;
            //         });
            // } else if (numberOfPlayers >= 4) {
            //     this.gameService.init(36)
            //         .subscribe(battleField => {
            //             this.battleField = battleField;
            //         });
            // }

            this.allBattleShip = shipModel;
            this.fullTurns();
        });
    }
}





