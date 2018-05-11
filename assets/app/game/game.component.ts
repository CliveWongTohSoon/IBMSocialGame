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

    constructor(private gameService: GameService) {
        gameService.init(25).subscribe(battleField => this.battleField = battleField);
    }

    renderBackgroundColor(col: TableContent) {
        if (col.color) {
            return col.color;
        }
        return 'white';
    }

    start(numberOfPlayers: string) {
        // randomDir();
        console.log(numberOfPlayers);
        console.log("Working");

        this.gameService.createShip(Number(numberOfPlayers))
            .subscribe(allBattleShip => this.allBattleShip = allBattleShip);
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
    }

    shieldUp(ship: ShipModel) {
        this.gameService.shield(ship, 0)
    }

    shieldLeft(ship: ShipModel) {
        this.gameService.shield(ship, 1)
    }

    shieldDown(ship: ShipModel) {
        this.gameService.shield(ship, 2)
    }

    shieldRight(ship: ShipModel) {
        this.gameService.shield(ship, 3)
    }
}