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
        this.battleField = gameService.init(25);
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

        this.allBattleShip = this.gameService.createShip(Number(numberOfPlayers));
        this.battleField = this.gameService.updateGridWithShip(this.allBattleShip, this.battleField);

        console.log('Start the game');
    }

    rotate() {
        console.log('Rotating...');
    }

    move(ship: ShipModel) {
        // this.renderMe = false;
        // console.log('Before: ', this.battleField.rowGrid);
        // console.log('Previous ship position', ship.shipPosition);
        const updatedShip = this.gameService.move(ship, this.battleField.rowGrid.length);
        this.battleField = this.gameService.updateGrid(updatedShip, this.battleField);
        // console.log('After: ', this.battleField.rowGrid);
        // console.log('Next ship position', updatedShip.shipPosition);
    }
}