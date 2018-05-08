import {Injectable} from "@angular/core";
import {BattleFieldModel, TableContent} from "./battle-field-model";

@Injectable()
export class GameService {

    battleField: BattleFieldModel;

    init(): BattleFieldModel {
        const rowContent = Array
            .apply(null, Array(25))
            .map((_, index) => new TableContent(index, 'white', null));

        const columnContent = Array
            .apply(null, Array(25))
            .map((_, index) => new TableContent(index, 'white', null));

        this.battleField = new BattleFieldModel(rowContent, columnContent);
        return this.battleField;
    }

    createGame(): BattleFieldModel {
        this.battleField.colGrid[10].backgroundColor = 'red';
        return this.battleField;
    }
}