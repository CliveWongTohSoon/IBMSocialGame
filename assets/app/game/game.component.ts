import {Component} from "@angular/core";
import {ShipModel} from "./ship-model";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {GameService} from "./game.service";


@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
    providers: [GameService]
})

export class GameComponent {

    text: string = 'Right';
    disabledBool = true;

    battleField: BattleFieldModel;
    allBattleShip: ShipModel[];

    renderMe = true;





    renderBackgroundColor(col: TableContent) {
        if (col.color) {
            return col.color;
        }
        return 'white';
    }

    constructor(private gameService: GameService) {
        gameService.init(25).subscribe(battleField => this.battleField = battleField);
    }



    start(numberOfPlayers: string) {
        // randomDir();
        console.log(numberOfPlayers);

        console.log("Working!");

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
        this.gameService.move(ship, this.battleField.rowGrid.length);
        //this.gameService.checkCollision(ship, this.battleField.rowGrid.length);
    }

    shieldUp(ship: ShipModel) {
        this.gameService.shield(ship,0)
    }

    shieldLeft(ship: ShipModel) {
        this.gameService.shield(ship,1)
    }

    shieldDown(ship: ShipModel) {
        this.gameService.shield(ship,2)
    }

    shieldRight(ship: ShipModel) {
        this.gameService.shield(ship,3)
    }

    shoot(ship:ShipModel){
        this.gameService.shoot(ship, this.battleField.rowGrid.length);
    }

    // fullTurns(){
    //     let turn: number;
    //     let i : number;
    //     let relevantShips: ShipModel [];
    //     for (turn = 1; turn <= 3; turn++){
    //         relevantShips = this.allBattleShip.filter (aShip => (aShip.shipActions.act[(turn-1)] == Action.FrontShield));
    //         for (i = 0; i < relevantShips.length; i++){
    //             this.shieldUp(relevantShips[i])
    //         }
    //         relevantShips = this.allBattleShip.filter (aShip => (aShip.shipActions.act[(turn-1)] == Action.LeftShield));
    //         for (i = 0; i < relevantShips.length; i++){
    //             this.shieldLeft(relevantShips[i])
    //         }
    //         relevantShips = this.allBattleShip.filter (aShip => (aShip.shipActions.act[(turn-1)] == Action.BackShield));
    //         for (i = 0; i < relevantShips.length; i++){
    //             this.shieldDown(relevantShips[i])
    //         }
    //         relevantShips = this.allBattleShip.filter (aShip => (aShip.shipActions.act[(turn-1)] == Action.RightShield));
    //         for (i = 0; i < relevantShips.length; i++){
    //             this.shieldRight(relevantShips[i])
    //         }
    //         relevantShips = this.allBattleShip.filter (aShip => (aShip.shipActions.act[(turn-1)] == Action.ShootFront));
    //         for (i = 0; i < relevantShips.length; i++){
    //             //this.shoot(relevantShips[i])
    //         }
    //         relevantShips = this.allBattleShip.filter (aShip => (aShip.shipActions.act[(turn-1)] == Action.MoveFront));
    //         for (i = 0; i < relevantShips.length; i++){
    //             this.move(relevantShips[i])
    //         }
    //         relevantShips = this.allBattleShip.filter (aShip => (aShip.shipActions.act[(turn-1)] == Action.RightTurn));
    //         for (i = 0; i < relevantShips.length; i++){
    //             this.rotateRight(relevantShips[i])
    //         }
    //         relevantShips = this.allBattleShip.filter (aShip => (aShip.shipActions.act[(turn-1)] == Action.LeftTurn));
    //         for (i = 0; i < relevantShips.length; i++){
    //             this.rotateLeft(relevantShips[i])
    //         }
    //         //this.gameService.checkCollision()
    //         // check for ships with the same x,y coordinate!!!!
    //     }
    // }
}





