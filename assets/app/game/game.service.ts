import {Injectable} from "@angular/core";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {ShipDepartment, ShipDirection, ShipModel, ShipPosition, shipStats} from "./ship-model";
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
        const maxX = this.battleField.rowGrid[0].length/(numberOfShips * 2);
        const maxY = this.battleField.rowGrid.length;

        this.allBattleShips = Array.apply(null, {length: numberOfShips})
            .map((_, i) => {
                const randomColorBack = this.genRandomColor();
                const randomColorFront = this.shadeColor(randomColorBack, 20);
                const randomX = this.randomCoor(maxX, 2*i*maxX), randomY = this.randomCoor(maxY,0);
                const initShipPosition = new ShipPosition(randomX, randomY);
                const randomDir = this.randomDir(4);
                const initShipDirection = new ShipDirection(randomDir);
                const  initShipStat = new shipStats(5,5,5,5,false,0);
                const newShip = new ShipModel(this.uidGenerator(), initShipPosition, initShipDirection, initShipStat,randomColorFront, randomColorBack);
                newShip.shipDepartment = ShipDepartment.getDepartment(initShipPosition, initShipDirection, this.battleField.rowGrid.length);
                i++;

                return newShip;
            });

        this.updateGridWithAllShip();
        console.log("LOL");
        console.log(this.allBattleShips.length);
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
        var randomColor = "#" + ('00000' + (Math.random() * (1 << 24) | 0).toString(16)).slice(-6);
        randomColor === '#FFFFF' ? '#990000' : '#' + randomColor;

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

    worldRound(position: ShipPosition, fieldSize: number): ShipPosition {
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

    move(ship: ShipModel, fieldSize: number) {
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

        newPosition = this.worldRound(newPosition, fieldSize);
        this.updateShip(ship, newPosition, ship.shipDirection);

        this.checkCollision(ship,fieldSize);

    }

    checkCollision(ship: ShipModel, fieldSize : number,) {

        const collidedShip = this.allBattleShips.filter(aShip => (((Math.abs(aShip.shipPosition.xIndex - ship.shipPosition.xIndex)<=1) || (Math.abs(aShip.shipPosition.xIndex - ship.shipPosition.xIndex)==24)) && ((Math.abs(aShip.shipPosition.yIndex - ship.shipPosition.yIndex)<=1) || (Math.abs(aShip.shipPosition.yIndex - ship.shipPosition.yIndex)==24))) && aShip.shipId !== ship.shipId)[0];
        console.log(collidedShip);

        if(collidedShip) {

            collidedShip.shipDirection.dir = ship.shipDirection.dir;

            if(ship.shipDirection.dir == Direction.Up){
                const possibleDir = [1,2,3];
                ship.shipDirection.dir = possibleDir[this.randomDir(3)];
            }
            else if(ship.shipDirection.dir == Direction.Left){
                const possibleDir = [0,2,3];
                ship.shipDirection.dir = possibleDir[this.randomDir(3)];
            }
            else if(ship.shipDirection.dir == Direction.Down){
                const possibleDir = [0,1,3];
                ship.shipDirection.dir = possibleDir[this.randomDir(3)];
            }
            else if(ship.shipDirection.dir == Direction.Right){
                const possibleDir = [0,1,2];
                ship.shipDirection.dir = possibleDir[this.randomDir(3)];
            }

            const kickback = Math.floor(Math.random() * 3 + 3);
            var i =0;
            while (i < kickback) {
                this.move(ship, fieldSize);
                this.move(collidedShip, fieldSize);
                i++;
            }
            ship.shipDirection.dir = this.randomDir(4);
            collidedShip.shipDirection.dir = this.randomDir(4);
        }
    }

    randomCollisionDir(): number{
         return Math.floor(Math.random() * 3);
    }

    rotate(ship: ShipModel, clockwise: boolean) {
        let newDirection: ShipDirection = new ShipDirection(ship.shipDirection.dir);
        if (clockwise) {
            if (newDirection.dir == 0) {
                newDirection.dir = 3;
            }
            else {
                newDirection.dir = ship.shipDirection.dir - 1;
            }
        }
        else {
            if (newDirection.dir == 3) {
                newDirection.dir = 0;
            }
            else {
                newDirection.dir = ship.shipDirection.dir + 1;
            }
        }
        this.updateShip(ship, ship.shipPosition, newDirection);
    }

    shield(ship: ShipModel, shieldDirection: Direction) {

        ship.shipStats.shieldActive = true;
        ship.shipStats.shieldDirection = shieldDirection;

        this.updateGridWithAllShip();

        console.log("shieldActive: " + ship.shipStats.shieldActive);
        console.log("shieldDirection " + ship.shipStats.shieldDirection);

    }


    // if(ship.ShipStats.shieldActive == 1 && ship.ShipStats.defence !=0) {

    //   NewShieldDirection = ship.ShipStats.shieldDirection + ship.shipDirection.dir;

    //   if (NewShieldDirection >=4){
    //       NewShieldDirection = NewShieldDirection%4;
    //   }



    randomDir(range : number): number{
        return Math.floor(Math.random() * range);

    }


    randomCoor(max: number, start: number){ //}, prevPos : number, range : number){
        return Math.floor((Math.random() * max) + start) + 0.5; // + (prevPos + range)) (9 + adjustment)) + prevX + 8) + 0.5;
    }

    uidGenerator(): string {
        const S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    updateHealth(shooterShip: ShipModel, victimShip: ShipModel, affectedDep: number, damage: number) {
        if (victimShip.shipStats.shieldActive == true) {
            damage = this.shieldCheck(shooterShip, victimShip, damage)
        }
        // if victimShip.shipDepartment[affectedDep].health < shooterShip.shipStats.attack){
        //     victimShip.shipDepartment[affectedDep].health = 0;
        // }
        // else{
        //     victimShip.shipDepartment[affectedDep].health = victimShip.shipDepartment[affectedDep].health - damage;
        // }
        if (affectedDep == 0) {
            if (victimShip.shipDepartment.leftWeapon.health < shooterShip.shipStats.attack) {
                victimShip.shipDepartment.leftWeapon.health = 0;
            }
            else{
                victimShip.shipDepartment.leftWeapon.health = victimShip.shipDepartment.leftWeapon.health - damage;
            }
        }
        if (affectedDep == 1) {
            if (victimShip.shipDepartment.rightWeapon.health < shooterShip.shipStats.attack) {
                victimShip.shipDepartment.rightWeapon.health = 0;
            }
            else{
                victimShip.shipDepartment.rightWeapon.health = victimShip.shipDepartment.rightWeapon.health - damage;
            }
        }
        if (affectedDep == 2) {
            if (victimShip.shipDepartment.leftEngine.health < shooterShip.shipStats.attack) {
                victimShip.shipDepartment.leftEngine.health = 0;
            }
            else{
                victimShip.shipDepartment.leftEngine.health = victimShip.shipDepartment.leftEngine.health - damage;
            }
        }
        if (affectedDep == 3) {
            if (victimShip.shipDepartment.rightEngine.health < shooterShip.shipStats.attack) {
                victimShip.shipDepartment.rightEngine.health = 0;
            }
            else{
                victimShip.shipDepartment.rightEngine.health = victimShip.shipDepartment.rightEngine.health - damage;
            }
        }
    }

    shieldCheck(shooterShip: ShipModel, victimShip: ShipModel, damage: number) {
        let shieldGridDirection: Direction;
        let enemyDirection: Direction = 4;
        let reducedDamage = damage;
        shieldGridDirection = victimShip.shipDirection.dir + victimShip.shipStats.shieldDirection;
        if (shieldGridDirection > 3) {
            shieldGridDirection = shieldGridDirection - 4;
        }
        let xDiff = victimShip.shipPosition.xIndex - shooterShip.shipPosition.xIndex;
        let yDiff = victimShip.shipPosition.xIndex - shooterShip.shipPosition.yIndex;
        if (Math.abs(xDiff) < 1) {
            if (yDiff > 0) {
                enemyDirection = Direction.Up;
            }
            else {
                enemyDirection = Direction.Down;
            }
        }
        else if (Math.abs(yDiff) < 1) {
            if (xDiff > 0) {
                enemyDirection = Direction.Left;
            }
            else {
                enemyDirection = Direction.Right;
            }
        }

        if (shieldGridDirection == enemyDirection) {
            reducedDamage = damage * (1 - victimShip.shipStats.defence);
        }
        return reducedDamage;
    }
}