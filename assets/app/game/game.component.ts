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

    battleFieldP1: BattleFieldModel;
    battleFieldP2: BattleFieldModel;
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

<<<<<<< HEAD
        let dir2 = this.gameService.randomDir();
        let x2 = this.gameService.randomCoor();
        let y2 = this.gameService.randomCoor();
       this.battleFieldP2 = this.gameService.createGame(this.battleField, x2, y2,'#003399','#007399',dir2[0], dir2[1], dir2[2], dir2[3]);
=======
        this.allBattleShip = this.gameService.createShip(Number(numberOfPlayers));
        this.battleField = this.allBattleShip.reduce((prev, curr) => {
            prev = this.gameService.updateGrid(curr, this.battleField, curr.colorFront, curr.colorBack)
            return prev;
        }, this.battleField);
>>>>>>> f0745e1cee49e4405b95f97facfebe51ea0ff47a

        console.log('Start the game');
    }

    rotate() {
        console.log('Rotating...');
    }

    move(ship: ShipModel) {
        // this.renderMe = false;
        console.log(ship);
        this.gameService.move(ship,this.battleField.rowGrid.length);
    }
}