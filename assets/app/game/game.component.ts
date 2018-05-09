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
    battleFieldP1: BattleFieldModel;
    battleFieldP2: BattleFieldModel;
    renderMe = true;

    constructor(private gameService: GameService) {
        this.battleField = gameService.init(25);
    }

    renderBackgroundColor(col: TableContent) {
        // console.log(col);
        if (col.color) {
            return col.color;
        }
        return 'white';
    }

    main() {
       // randomDir();
        let dir1 = this.gameService.randomDir();
        let x1 = this.gameService.randomCoor();
        let y1 = this.gameService.randomCoor();

       this.battleFieldP1 = this.gameService.createGame(this.battleField, x1, y1,'#990000','#cc0000', dir1[0], dir1[1], dir1[2], dir1[3]);

        let dir2: Array<string> = this.gameService.randomDir();
        let x2 = this.gameService.randomCoor();
        let y2 = this.gameService.randomCoor();
       this.battleFieldP2 = this.gameService.createGame(this.battleField, x2, y2,'#003399','#007399',dir2[0], dir2[1], dir2[2], dir2[3]);

        console.log('Start the game');
    }

    move() {
        // this.renderMe = false;
        this.gameService.move();
    }
}