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
        //
        // if (Number(numberOfPlayers) == 1) {
        //     this.gameService.init(25)
        //         .subscribe(battleField => {
        //             this.battleField = battleField;
        //             this.gameService.createShip(Number(numberOfPlayers+1))
        //                 .subscribe(allBattleShip => this.allBattleShip = allBattleShip);
        //         });
        // }

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

    // rotateRight(ship: ShipModel) {
    //     console.log('Rotating...');
    //     this.gameService.rotate(ship, true);
    // }
    //
    // rotateLeft(ship: ShipModel) {
    //     console.log('Rotating...');
    //     this.gameService.rotate(ship, false);
    // }
    //
    // move(ship: ShipModel) {
    //     this.gameService.move(ship);
    //     //this.gameService.checkCollision(ship, this.battleField.rowGrid.length);
    // }
    //
    // shieldUp(ship: ShipModel) {
    //     this.gameService.shield(ship, 0);
    // }
    //
    // shieldLeft(ship: ShipModel) {
    //     this.gameService.shield(ship, 1);
    // }
    //
    // shieldDown(ship: ShipModel) {
    //     this.gameService.shield(ship,2)
    // }
    //
    // shieldRight(ship: ShipModel) {
    //     this.gameService.shield(ship,3)
    // }
    //
    // shoot(ship:ShipModel){
    //     this.gameService.shoot(ship);
    // }

    relativePosition(ship:ShipModel){
        this.gameService.relativePosition(ship,this.battleField.rowGrid.length);
    }

    inputMove(ship:ShipModel){
        this.gameService.inputMove(ship);
    }

    inputRotateLeft(ship:ShipModel){
        this.gameService.inputRotateLeft(ship);
    }

    inputRotateRight(ship:ShipModel){
        this.gameService.inputRotateRight(ship);
    }

    inputShoot(ship:ShipModel){
        this.gameService.inputShoot(ship);
    }

    inputShieldUp(ship:ShipModel){
        this.gameService.inputShieldUp(ship);
    }

    inputShieldDown(ship:ShipModel){
        this.gameService.inputShieldDown(ship);
    }

    inputShieldLeft(ship:ShipModel){
        this.gameService.inputShieldLeft(ship);
    }

    inputShieldRight(ship:ShipModel){
        this.gameService.inputShieldRight(ship);
    }

    fullTurns(){
        this.gameService.fullTurns();
    }



    ngOnInit() {
        // this.gameService.createShipFromSocket().subscribe(console.log);
        this.gameService.createShipFromSocket().subscribe(shipModel => {
            const numberOfPlayers = shipModel.length;
            // if (numberOfPlayers <= 2) {
            //     this.gameService.init(25)
            //         .subscribe(battleField => {
            //             this.battleField = battleField;
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

            // this.fullTurns();

        });
    }
}





