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

        console.log("Working123");

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
}