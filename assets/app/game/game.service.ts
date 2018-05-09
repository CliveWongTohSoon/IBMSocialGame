import {Injectable} from "@angular/core";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {ShipDirection, ShipModel, ShipPosition} from "./ship-model";
import {Direction} from "./ship-model";

@Injectable()
export class GameService {

    battleField: BattleFieldModel;
    allBattleShips: ShipModel[];

    init(length: number): BattleFieldModel {

        let rowContent: Array<TableContent[]> = [];


        for (let i = 0; i < length; i++) {
            let colContent: TableContent[] = [];
            for (let j = 0; j < length; j++) {
                const column = new TableContent(i, null);
                colContent.push(column);
            }
            rowContent.push(colContent);
        }

        this.battleField = new BattleFieldModel(rowContent);
        return this.battleField;
    }

    randomDir(): number{
        return Math.floor(Math.random() * 3);
    }


    randomCoor(max: number) { //adjustment: number, prevX: number):number {
        // var x;

        return Math.floor((Math.random() * max)) + 0.5; // (9 + adjustment)) + prevX + 8) + 0.5;
    }

    updateGrid(currentShip: ShipModel, prevBattleField: BattleFieldModel, colorFront: string, colorBack): BattleFieldModel {
        return BattleFieldModel.renderGrid(currentShip.shipDepartment, prevBattleField, currentShip.colorFront, currentShip.colorBack);
    }

    // Create an array ship
    // updateGrid => reduce =>

    createShip(numberOfShips: number): ShipModel[] {
        //
        const maxY = this.battleField.rowGrid.length;
        const maxX = this.battleField.rowGrid[0].length;

        return this.allBattleShips = Array.apply(null, {length: numberOfShips})
            .map((_, i) => {
                const randomColorBack = this.genRandomColor();
                const randomColorFront = this.shadeColor(randomColorBack, 20);
                const randomX = this.randomCoor(maxX), randomY = this.randomCoor(maxY);
                const initShipPosition = new ShipPosition(randomX, randomY);
                const randomDir = this.randomDir();
                const initShipDirection = new ShipDirection(randomDir);
                return new ShipModel('Clive', initShipPosition, initShipDirection, null, randomColorFront, randomColorBack);
            });
    }

    genRandomColor(): string {
        return '#'+(Math.random()*0xFFFFFF<<0).toString(16) === '#FFFFFF' ? '#990000' : '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    }

    shadeColor(color, percent) {
        const f = parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }

    updateShip() {

    }

    worldRound(position:number, fieldSize: number) {
        let newValue;
        if (position >= fieldSize) {
            newValue = position - fieldSize;
        }
        else if (position < 0) {
            newValue = position + fieldSize;
        }
        else {
            newValue = position
        }
        return newValue;
    }

    move(positionX:number,positionY:number, direction: Direction, fieldSizeX:number, fieldSizeY:number){
        let newX;
        let newY;

        if (direction == Direction.Up) {
            newY = positionY - 1;
            newX = positionX;

        }
        else if (direction == Direction.Down) {
            newY = positionY + 1;
            newX = positionX;
        }
        else if (direction == Direction.Right) {
            newX = positionX + 1;
            newY = positionY;
        }
        else if (direction == Direction.Left) {
            newX = positionX - 1;
            newY = positionY;
        }
        newX = this.worldRound(newX, fieldSizeX);
        newY = this.worldRound(newY, fieldSizeY);
        return {x:newX, y:newY};
    }


}