import {Injectable} from "@angular/core";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {ShipDepartment, ShipDirection, ShipModel, ShipPosition} from "./ship-model";
import {Direction} from "./ship-model";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/of";

@Injectable()
export class GameService {

    battleField: BattleFieldModel;
    allBattleShips: ShipModel[];

    // --------------------------------- CREATE OBSERVABLE ---------------------------------------------------------- //
    init(length: number): Observable<BattleFieldModel> {
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
        return Observable.of(this.battleField);
    }

    createShip(numberOfShips: number): Observable<ShipModel[]> {
        const maxY = this.battleField.rowGrid.length;
        const maxX = this.battleField.rowGrid[0].length;

        this.allBattleShips = Array.apply(null, {length: numberOfShips})
            .map((_, i) => {
                const randomColorBack = this.genRandomColor();
                const randomColorFront = this.shadeColor(randomColorBack, 20);
                const randomX = this.randomCoor(maxX), randomY = this.randomCoor(maxY);
                const initShipPosition = new ShipPosition(randomX, randomY);
                const randomDir = this.randomDir();
                const initShipDirection = new ShipDirection(randomDir);
                const newShip = new ShipModel(this.uidGenerator(), initShipPosition, initShipDirection, null, randomColorFront, randomColorBack);
                newShip.shipDepartment = ShipDepartment.getDepartment(initShipPosition, initShipDirection, this.battleField.rowGrid.length);
                return newShip;
            });

        this.updateGridWithAllShip();
        return Observable.of(this.allBattleShips);
    }

    updateGridWithAllShip() {
        this.battleField.rowGrid.map(col => col.map(c => c.color = null));

        this.battleField = this.allBattleShips.reduce((prev, curr) => {
            prev = this.updateGrid(curr);
            return prev;
        }, this.battleField);
    }

    updateGrid(currentShip: ShipModel): BattleFieldModel {
        return BattleFieldModel.renderGrid(currentShip.shipDepartment, this.battleField, currentShip.colorFront, currentShip.colorBack);
    }

    genRandomColor(): string {
        var randomColor = "#" + ('00000' +(Math.random()*(1<<24)|0).toString(16)).slice(-6);
        randomColor === '#FFFFF' ? '#990000' : '#' +randomColor;
        return randomColor;
    }

    shadeColor(color, percent) {
        return '#000000';
        // const f = parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        // return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }


    updateShip(ship: ShipModel, newPosition: ShipPosition, newDirection: ShipDirection) {
        ship.shipPosition = newPosition;
        ship.shipDirection = newDirection;
        ship.shipDepartment = ShipDepartment.getDepartment(newPosition, newDirection, this.battleField.rowGrid.length);
        this.updateGridWithAllShip();
    }

    worldRound(position:ShipPosition, fieldSize: number): ShipPosition {
        let newPosition: ShipPosition = position;

        if (position.xIndex >= fieldSize) {
            newPosition.xIndex = position.xIndex - fieldSize;
        } else if (position.xIndex < 0) {
            newPosition.xIndex = position.xIndex + fieldSize;
        }

        if (position.yIndex >= fieldSize) {
            newPosition.yIndex = position.yIndex - fieldSize;
        } else if (position.yIndex < 0) {
            newPosition.yIndex = position.yIndex + fieldSize;
        }

        return newPosition;
    }

    move(ship: ShipModel, fieldSize:number) {
        let newPosition: ShipPosition = new ShipPosition(ship.shipPosition.xIndex, ship.shipPosition.yIndex);
        // console.log('Previous position:', newPosition);
        if (ship.shipDirection.dir == Direction.Up) {
            console.log('Enter up');
            newPosition.yIndex = newPosition.yIndex - 1;
        } else if (ship.shipDirection.dir == Direction.Down) {
            console.log('Enter down');
            newPosition.yIndex = newPosition.yIndex + 1;
        } else if (ship.shipDirection.dir == Direction.Right) {
            console.log('Enter right');
            newPosition.xIndex = newPosition.xIndex + 1;
        } else if (ship.shipDirection.dir == Direction.Left) {
            console.log('Enter left');
            newPosition.xIndex = newPosition.xIndex - 1;
        }
        // console.log('New position: ', newPosition);
        newPosition = this.worldRound(newPosition, fieldSize);
        this.updateShip(ship, newPosition, ship.shipDirection);
    }

    rotate(ship:ShipModel, clockwise: boolean){
        let newDirection:ShipDirection = new ShipDirection(ship.shipDirection.dir);
        if (clockwise){
            if (newDirection.dir == 0){
                newDirection.dir = 3;
            }
            else {
                newDirection.dir = ship.shipDirection.dir - 1;
            }
        }
        else{
            if(newDirection.dir == 3){
                newDirection.dir = 0;
            }
            else {
                newDirection.dir = ship.shipDirection.dir + 1;
            }
        }
        this.updateShip(ship, ship.shipPosition, newDirection);
    }

    shield(ship:ShipModel, shieldDirection:Direction) {

        let newShip = ship;
        newShip.shipStats.shieldActive = true;
        newShip.shipStats.shieldDirection = shieldDirection;

        return newShip;
    }

       // if(ship.ShipStats.shieldActive == 1 && ship.ShipStats.defence !=0) {

         //   NewShieldDirection = ship.ShipStats.shieldDirection + ship.shipDirection.dir;

         //   if (NewShieldDirection >=4){
         //       NewShieldDirection = NewShieldDirection%4;
         //   }



    randomDir(): number{
        return Math.floor(Math.random() * 4);
    }


    randomCoor(max: number) { //adjustment: number, prevX: number):number {
        return Math.floor((Math.random() * max)) + 0.5; // (9 + adjustment)) + prevX + 8) + 0.5;
    }

    uidGenerator(): string {
        const S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
}