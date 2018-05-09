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
<<<<<<< HEAD
        console.log(numberOfPlayers);

        this.allBattleShip = this.gameService.createShip(Number(numberOfPlayers));
        this.battleField = this.allBattleShip.reduce((prev, curr) => {
            prev = this.gameService.updateGrid(curr, this.battleField, curr.colorFront, curr.colorBack)
            return prev;
        }, this.battleField);
=======
        let dir1 = this.gameService.randomDir();
        let x1 = this.gameService.randomCoor();
        let y1 = this.gameService.randomCoor();

       this.battleFieldP1 = this.gameService.createGame(this.battleField, x1, y1,'#990000','#cc0000', dir1);

        let dir2 /*Array<string>*/ = this.gameService.randomDir();
        let x2 = this.gameService.randomCoor();
        let y2 = this.gameService.randomCoor();
       this.battleFieldP2 = this.gameService.createGame(this.battleField, x2, y2,'#003399','#007399',dir2);
>>>>>>> f059dc3a3732902eef9b6476ea3e2268b3efaf5d

        console.log('Start the game');
    }

    move() {
        // this.renderMe = false;
        this.gameService.move();
    }
}