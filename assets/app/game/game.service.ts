import {Injectable} from "@angular/core";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {
    ShipDepartment,
    ShipDirection,
    ShipModel,
    ShipPosition,
    ShipStats,
    CollisionInfo,
    ShipAction,
    Action,
    ShipPhase
} from "./ship-model";
import {Direction} from "./ship-model";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/of";
import * as io from 'socket.io-client';
import {Instruction, InstructionModel} from "./instruction-model";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import "rxjs/add/operator/take";

@Injectable()
export class GameService {
    private socket: SocketIOClient.Socket;

    constructor(private http: HttpClient) {
        this.socket = io();
    }

    /***********************************************
     * Test For IBM Personality Analysis
     * *********************************************/


    /**********************************************
     * Test for Raspberry Pi
     * ********************************************/
    test(shipId, instructionArray) {
        this.socket.emit('instruction_server', {
            shipId: shipId
            // instruction0: instructionArray[0],
            // instruction1: instructionArray[1],
            // instruction2: instructionArray[2]
        });
    }

    // ----------------------------- Data for all components -------------------------------------------------------- //
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
        // Make battleField an Observable, so whenever the battleField model changes, it will update
        return Observable.of(this.battleField);
    }

    createShipFromSocket(): Observable<ShipModel[]> {
        // this.socket.on('start', data => console.log(data));
        let observable = new Observable<ShipModel[]>(observer => {
            this.socket.on('start', data => {
                console.log('Entered Start');
                const allShips: ShipModel[] = Object.keys(data).map(key => {
                    // console.log(key, data[key]);
                    const shipId = data[key]['shipId'],
                        randomX = data[key]['x'],
                        randomY = data[key]['y'],
                        randomDir = data[key]['dir'],
                        reHealth = data[key]['reHealth'],
                        leHealth = data[key]['leHealth'],
                        lwHealth = data[key]['lwHealth'],
                        rwHealth = data[key]['rwHealth'],
                        reAlive = data[key]['reAlive'],
                        leAlive = data[key]['leAlive'],
                        lwAlive = data[key]['lwAlive'],
                        rwAlive = data[key]['rwAlive'],


                        phase = this.getPhase(data[key]['phase']); // Should give Start initially
                    // console.log(data);

                    const start = phase !== ShipPhase.End; // Check what I can do with this

                    const randomColorBack = this.genRandomColor();
                    const randomColorFront = this.shadeColor(randomColorBack, 20);
                    const initShipPosition = new ShipPosition(randomX, randomY);
                    const initShipDirection = new ShipDirection(randomDir);

                    // TODO:- Change initShipStat to dynamically change according to emotion

                    // TODO:- Update the health points of department
                    const initShipStat = new ShipStats(1234, 500, 5, 0, 5, false, 0);

                    const newShip = new ShipModel(shipId, initShipPosition, initShipDirection, initShipStat, phase, randomColorFront, randomColorBack);
                    newShip.shipDepartment = ShipDepartment.updateDepartmentHealth(
                        initShipPosition, initShipDirection, this.battleField.rowGrid.length,
                        reHealth, leHealth, lwHealth, rwHealth, reAlive, leAlive, lwAlive, rwAlive
                    );
                    const newShipPosition = new ShipPosition(0, 0);
                    newShip.collisionInfo = new CollisionInfo(newShipPosition, 0);
                    newShip.shipAction = new ShipAction(Array.apply(null, {length: 0})
                        .map(_ => Action.DoNothing)
                    );

                    return start ? newShip : null;
                })
                    .filter(ship => ship !== null);

                this.allBattleShips = allShips;
                this.updateGridWithAllShip();
                observer.next(allShips);
            });
            return () => {
                this.socket.disconnect()
            };
        });
        return observable;
    }

    getPhase(phase: string): ShipPhase {
        if (phase === 'start') return ShipPhase.Start;
        else if (phase === 'end') return ShipPhase.End;
        else if (phase === 'action') return ShipPhase.Action;
        else if (phase === 'report') return ShipPhase.Report;
    }

    // // TODO:- OLD
    // createShip(numberOfShips: number): Observable<ShipModel[]> {
    //     const maxX = this.battleField.rowGrid[0].length/(numberOfShips * 2);
    //     const maxY = this.battleField.rowGrid.length;
    //
    //     this.allBattleShips = Array.apply(null, {length: numberOfShips})
    //         .map((_, i) => {
    //             const randomColorBack = this.genRandomColor();
    //             const randomColorFront = this.shadeColor(randomColorBack, 20);
    //             const randomX = this.randomCoor(maxX, 2*i*maxX), randomY = this.randomCoor(maxY,0);
    //             const initShipPosition = new ShipPosition(randomX, randomY);
    //             const randomDir = this.randomDir(4);
    //             const initShipDirection = new ShipDirection(randomDir);
    //
    //             const initShipStat = new ShipStats(1000,500,5,0.5,5,false,0);
    //             const newShip = new ShipModel(this.uidGenerator(), initShipPosition, initShipDirection,  initShipStat, randomColorFront, randomColorBack);
    //             newShip.shipDepartment = ShipDepartment.getDepartment(initShipPosition, initShipDirection, this.battleField.rowGrid.length);
    //             const newShipPosition = new ShipPosition(0,0);
    //             newShip.collisionInfo = new CollisionInfo(newShipPosition, 0);
    //             newShip.shipAction = new ShipAction(Array.apply(null, {length: 0})
    //                 .map(_ => null));
    //             return newShip;
    //         });
    //     this.updateGridWithAllShip();
    //     return Observable.of(this.allBattleShips);
    // }

    listenToInstruction(): Observable<InstructionModel> {
        let observable = new Observable<ShipModel[]>(observer => {
            this.socket.on('instruction_client', instructionData => {
                // console.log('Entered Instruction_Client', instructionData);
                observer.next(instructionData);
            });
            return () => {
                this.socket.disconnect()
            };
        });
        return observable;
    }

    // ------------------------------------- Static functions ------------------------------------------------------- //
    getInstruction(instruction: string): Instruction {
        if (instruction === 'move') return Instruction.Move;
        else if (instruction === 'turnLeft') return Instruction.TurnLeft;
        else if (instruction === 'turnRight') return Instruction.TurnRight;
        else if (instruction === 'shoot') return Instruction.Shoot;
        else if (instruction === 'shieldLeft') return Instruction.ShieldLeft;
        else if (instruction === 'shieldRight') return Instruction.ShieldRight;
        else if (instruction === 'shieldBack') return Instruction.ShieldBack;
        else if (instruction === 'shieldFront') return Instruction.ShieldFront;
        else return Instruction.DoNothing
    }

    executeInstruction(ship: ShipModel, instruction: Instruction) {
        if (instruction === Instruction.Move) this.move(ship);
        else if (instruction === Instruction.ShieldFront) this.shield(ship, Direction.Up);
        else if (instruction === Instruction.ShieldBack) this.shield(ship, Direction.Down);
        else if (instruction === Instruction.ShieldRight) this.shield(ship, Direction.Right);
        else if (instruction === Instruction.ShieldLeft) this.shield(ship, Direction.Left);
        else if (instruction === Instruction.Shoot) this.shoot(ship);
        else if (instruction === Instruction.TurnRight) this.rotate(ship, true);
        else if (instruction === Instruction.TurnLeft) this.rotate(ship, false);
    }

    // --------------------------------------- Update Data ---------------------------------------------------------- //
    updateGridWithAllShip() {
        // Clear the map
        this.battleField.rowGrid.map(col => col.map(c => c.color = null));

        this.battleField = this.allBattleShips.reduce((prev, curr) => {
            prev = this.updateGrid(curr);
            return prev;
        }, this.battleField);
    }

    updateGrid(currentShip: ShipModel): BattleFieldModel {
        return BattleFieldModel.renderGrid(currentShip.shipDepartment, this.battleField, currentShip.colorFront, currentShip.colorBack);
    }

    // TODO:-  Just need to update the final position to the cloud
    updateShip(ship: ShipModel, newPosition: ShipPosition, newDirection: ShipDirection) {
        ship.shipPosition = newPosition;
        ship.shipDirection = newDirection;
        ship.shipDepartment = ShipDepartment.updateDepartment(newPosition, newDirection, this.battleField.rowGrid.length, ship);
        this.updateGridWithAllShip();
    }

    worldRound(position: ShipPosition, fieldSize: number): ShipPosition {
        let newPosition: ShipPosition = position;
        newPosition.xIndex = this.mod(position.xIndex, fieldSize);
        newPosition.yIndex = this.mod(position.yIndex, fieldSize);
        return newPosition;
    }

    mod(n, m) {
        return ((n % m) + m) % m;
    }

    move(ship: ShipModel) {
        const fieldSize = this.battleField.rowGrid.length;
        let newPosition: ShipPosition = new ShipPosition(ship.shipPosition.xIndex, ship.shipPosition.yIndex);
        let dir = ship.shipDirection.dir;

        if (dir == Direction.Up) {
            console.log('Enter up');
            newPosition.yIndex = newPosition.yIndex - 1;
        } else if (dir == Direction.Down) {
            console.log('Enter down');
            newPosition.yIndex = newPosition.yIndex + 1;
        } else if (dir == Direction.Right) {
            console.log('Enter right');
            newPosition.xIndex = newPosition.xIndex + 1;
        } else if (dir == Direction.Left) {
            console.log('Enter left');
            newPosition.xIndex = newPosition.xIndex - 1;
        }

        newPosition = this.worldRound(newPosition, fieldSize);

        this.updateShip(ship, newPosition, ship.shipDirection);
    }

    performCollision(fieldSize: number, turn: number) {
        var validCheck = false;
        var i = 0;

        for (i = 0; i < this.allBattleShips.length; i++) {
            if (this.allBattleShips[i].collisionInfo.moveCount > 0) {
                validCheck = true;
            }
        }
        while (validCheck == true) {
            for (i = 0; i < this.allBattleShips.length; i++) {
                if (this.allBattleShips[i].collisionInfo.moveCount > 0) {
                    this.allBattleShips[i].shipPosition.xIndex += this.allBattleShips[i].collisionInfo.resultantMove.xIndex;
                    this.allBattleShips[i].shipPosition.yIndex += this.allBattleShips[i].collisionInfo.resultantMove.yIndex;
                    this.allBattleShips[i].shipPosition = this.worldRound(this.allBattleShips[i].shipPosition, fieldSize);
                    this.allBattleShips[i].collisionInfo.moveCount--;
                    this.updateShip(this.allBattleShips[i], this.allBattleShips[i].shipPosition, this.allBattleShips[i].shipDirection);
                }
            }

            this.checkCollision(fieldSize, turn);
            validCheck = false;
            for (i = 0; i < this.allBattleShips.length; i++) {
                if (this.allBattleShips[i].collisionInfo.moveCount > 0) {
                    validCheck = true;
                }
            }
        }
        for (i = 0; i < this.allBattleShips.length; i++) {
            this.allBattleShips[i].collisionInfo.resultantMove.xIndex = 0;
            this.allBattleShips[i].collisionInfo.resultantMove.yIndex = 0;
        }
    }

    checkCollision(fieldSize: number, turn: number) {
        var resultant: ShipPosition = new ShipPosition(0, 0);

        for (let i = 0; i < this.allBattleShips.length; i++) {
            for (let j = 0; j < this.allBattleShips.length; j++) {
                if ((((Math.abs(this.allBattleShips[i].shipPosition.xIndex - this.allBattleShips[j].shipPosition.xIndex) <= 1) || (Math.abs(this.allBattleShips[i].shipPosition.xIndex - this.allBattleShips[j].shipPosition.xIndex) == fieldSize - 1)) && ((Math.abs(this.allBattleShips[i].shipPosition.yIndex - this.allBattleShips[j].shipPosition.yIndex) <= 1) || (Math.abs(this.allBattleShips[i].shipPosition.yIndex - this.allBattleShips[j].shipPosition.yIndex) == fieldSize - 1))) && this.allBattleShips[i].shipId !== this.allBattleShips[j].shipId) {
                    checkCollisionHit(this.allBattleShips[i], this.allBattleShips[j], turn);
                    if (this.allBattleShips[i].shipPosition.xIndex - this.allBattleShips[j].shipPosition.xIndex == 0 && this.allBattleShips[i].shipPosition.yIndex - this.allBattleShips[j].shipPosition.yIndex == 0) {
                        assignResultant(this.allBattleShips[i]);
                    }
                    resultant.xIndex = this.allBattleShips[i].shipPosition.xIndex - this.allBattleShips[j].shipPosition.xIndex;
                    resultant.yIndex = this.allBattleShips[i].shipPosition.yIndex - this.allBattleShips[j].shipPosition.yIndex;

                    if (Math.abs(resultant.xIndex) == fieldSize - 1) {
                        resultant.xIndex = -1 * adjustOverflow(resultant.xIndex);
                    }
                    if (Math.abs(resultant.yIndex) == fieldSize - 1) {
                        resultant.yIndex = -1 * adjustOverflow(resultant.yIndex);
                    }

                    this.allBattleShips[i].collisionInfo.resultantMove.xIndex += resultant.xIndex;
                    this.allBattleShips[i].collisionInfo.resultantMove.yIndex += resultant.yIndex;

                    if (Math.abs(this.allBattleShips[i].collisionInfo.resultantMove.xIndex) > 1) {
                        this.allBattleShips[i].collisionInfo.resultantMove.xIndex = adjustOverflow(this.allBattleShips[i].collisionInfo.resultantMove.xIndex);
                    }
                    if (Math.abs(this.allBattleShips[i].collisionInfo.resultantMove.yIndex) > 1) {
                        this.allBattleShips[i].collisionInfo.resultantMove.yIndex = adjustOverflow(this.allBattleShips[i].collisionInfo.resultantMove.yIndex);
                    }

                    this.allBattleShips[i].collisionInfo.moveCount = Math.floor(Math.random() * 3 + 3);

                }
            }
        }

        function checkCollisionHit(rammerShip: ShipModel, victimShip: ShipModel, turn: number) {
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    if (rammerShip.shipDepartment.departmentArray[i].xIndex == victimShip.shipDepartment.departmentArray[j].xIndex && rammerShip.shipDepartment.departmentArray[i].yIndex == victimShip.shipDepartment.departmentArray[j].yIndex) {
                        updateCollisionHealth(rammerShip, i, victimShip, j, turn);
                    }
                }
            }

            function updateCollisionHealth(rammerShip: ShipModel, affectedRammerDep: number, victimShip: ShipModel, affectedVictimDep: number, turn: number) {
                let damage: number;
                damage = 300;
                if (rammerShip.shipDepartment.departmentArray[affectedRammerDep].alive == false) {
                    damage = 50 / 100 * damage;
                }

                if (victimShip.shipStats.shieldActive == true) {
                    damage = this.collisionShieldCheck(victimShip, rammerShip, damage, turn);
                }

                console.log("DAMAGE" + damage);
                if (victimShip.shipDepartment.departmentArray[affectedVictimDep].health < damage) {
                    victimShip.shipDepartment.departmentArray[affectedVictimDep].health = 0;
                }
                else {
                    victimShip.shipDepartment.departmentArray[affectedVictimDep].health = victimShip.shipDepartment.departmentArray[affectedVictimDep].health - damage;
                }
            }
        }

        function assignResultant(ship: ShipModel) {
            let dir = ship.shipDirection.dir;
            if (ship.collisionInfo.moveCount == 0) {
                if (dir == Direction.Up) {
                    ship.collisionInfo.resultantMove.yIndex = 1;
                } else if (dir == Direction.Down) {
                    ship.collisionInfo.resultantMove.yIndex = -1;
                } else if (dir == Direction.Right) {
                    ship.collisionInfo.resultantMove.xIndex = -1;
                } else if (dir == Direction.Left) {
                    ship.collisionInfo.resultantMove.xIndex = 1;
                }
            }
            else {
                console.log("ELSE");
                ship.collisionInfo.resultantMove.xIndex *= -1;
                ship.collisionInfo.resultantMove.yIndex *= -1;
            }
        }

        function adjustOverflow(overflow: number): number {
            return Math.abs(overflow) / overflow;
        }
    }

    rotate(ship: ShipModel, clockwise: boolean) {
        let dir = ship.shipDirection.dir;
        let newDirection;
        if (clockwise) {
            newDirection = this.mod(dir - 1, 4);
        }
        else {
            newDirection = this.mod(dir + 1, 4);
        }
        this.updateShip(ship, ship.shipPosition, new ShipDirection(newDirection));
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


    randomDir(range: number): number {
        return Math.floor(Math.random() * range);
    }

    shoot(ship: ShipModel) {
        for (let l = 2; l < 4; l++) {
            loopAttackRange:
                for (let i = 1; i < ship.shipStats.attackRange + 1; i++) { //check all attack range
                    for (let j = 0; j < this.allBattleShips.length; j++) { // check all ships (for being attacked)
                        for (let k = 0; k < 4; k++) { //check all four department being hit, also 4 directions. directions are anti-clockwise, and four department are clockwise
                            let defendShip = this.allBattleShips[j];
                            let defendDepart = defendShip.shipDepartment.departmentArray[k];
                            let attackDepart = ship.shipDepartment.departmentArray[l];

                            let bothDepartExist: boolean = (defendDepart.health > 0) && (attackDepart.health > 0);
                            //let bothDepartExist:boolean = (defendDepart.alive) && (attackDepart.alive);
                            //once you implement the changing of alive, uncomment the line above and comment old bothDepartmentExist

                            let positionCorrectUp: boolean = ((attackDepart.yIndex - i) == defendDepart.yIndex) && (attackDepart.xIndex == defendDepart.xIndex);
                            let positionCorrectDown: boolean = ((attackDepart.yIndex + i) == defendDepart.yIndex) && (attackDepart.xIndex == defendDepart.xIndex);
                            let positionCorrectLeft: boolean = ((attackDepart.xIndex - i) == defendDepart.xIndex) && (attackDepart.yIndex == defendDepart.yIndex);
                            let positionCorrectRight: boolean = ((attackDepart.xIndex + i) == defendDepart.xIndex) && (attackDepart.yIndex == defendDepart.yIndex);

                            switch (ship.shipDirection.dir) { //check four attacking ship direction
                                case Direction.Up:
                                    if (positionCorrectUp && bothDepartExist) {
                                        this.updateShootHealth(ship, defendShip, k);
                                        console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                        break loopAttackRange;
                                    }
                                    break;
                                case Direction.Down:
                                    if (positionCorrectDown && bothDepartExist) {
                                        this.updateShootHealth(ship, defendShip, k);
                                        console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                        break loopAttackRange;
                                    }
                                    break;
                                case Direction.Left:
                                    if (positionCorrectLeft && bothDepartExist) {
                                        this.updateShootHealth(ship, defendShip, k);
                                        console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                        break loopAttackRange;
                                    }
                                    break;
                                case Direction.Right:
                                    if (positionCorrectRight && bothDepartExist) {
                                        this.updateShootHealth(ship, defendShip, k);
                                        console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                        break loopAttackRange;
                                    }
                            }
                        }
                    }
                }
        }
    } // end shoot

    relativePosition(ship: ShipModel, l: number) {

        let dir = ship.shipDirection.dir;
        for (let i = 0; i < this.allBattleShips.length; i++) {
            let x0 = ship.shipPosition.xIndex;
            let y0 = ship.shipPosition.yIndex;

            let x = this.allBattleShips[i].shipPosition.xIndex;
            let y = this.allBattleShips[i].shipPosition.yIndex;
            let xd = x - x0;
            let yd = y - y0;

            if (!(xd == 0 && yd == 0)) {
                {
                    calPolar(i, wrapDistance(xd), wrapDistance(yd), wrapSub(yd));
                }
            } else {
                console.log("current ship is " + i)
            }
        }
        console.log("\n")

        function wrapDistance(xd: number) {
            if (Math.abs(xd) < l / 2) {
                return xd;
            }
            else {
                if (xd < 0) {
                    return l + xd;
                }
                else {
                    return -(l - xd);
                }
            }
        }

        function wrapSub(yd: number) {
            if (Math.abs(yd) < l / 2) {
                if (yd < 0) {
                    return 0;
                }
                else {
                    return 180;
                }
            } else {
                if (yd < 0) {
                    return 180;
                }
                else {
                    return 0;
                }
            }
        }

        function calPolar(i: number, xd: number, yd: number, sub: number) {
            let rad = Math.atan(xd / yd);
            let deg = rad * 180 / Math.PI;
            let d = distance(xd, yd);
            logPolar(i, adjustByDir(dir, sub - deg), d);
        }

        function distance(a: number, b: number) {
            return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
        }

        function logPolar(i: number, deg: number, distance: number) {
            console.log("ship " + i + " 's relative position from this ship is: " + deg + " degree, distance is " + distance);
        }

        function adjustByDir(dir: Direction, deg: number) {
            return mod(dir * 90 + deg, 360);
        }

        function mod(n, m) {
            return ((n % m) + m) % m;
        }
    }

    randomCoor(max: number, start: number) {
        return Math.floor((Math.random() * max) + start) + 0.5; // + (prevPos + range)) (9 + adjustment)) + prevX + 8) + 0.5;
    }

    genRandomColor(): string {
        return '#' + (Math.random() * 0xFFFFFF << 0).toString(16) === '#FFFFFF' ? '#990000' : '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
    }

    shadeColor(color, percent): string {
        return '#000000';
        // const f = parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        // return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }

    uidGenerator(): string {
        const S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    updateShootHealth(shooterShip: ShipModel, victimShip: ShipModel, affectedDep: number) {
        let damage: number;

        damage = shooterShip.shipStats.attack;
        if (victimShip.shipStats.shieldActive == true) {
            damage = this.shootShieldCheck(shooterShip, victimShip, damage);
        }
        if (victimShip.shipDepartment.departmentArray[affectedDep].health < damage) {
            victimShip.shipDepartment.departmentArray[affectedDep].health = 0;
        } else {
            victimShip.shipDepartment.departmentArray[affectedDep].health = victimShip.shipDepartment.departmentArray[affectedDep].health - damage;
        }
    }


    shootShieldCheck(shooterShip: ShipModel, victimShip: ShipModel, damage: number) {
        let shieldGridDirection: Direction;
        // let enemyDirection: Direction = 4;
        let reducedDamage = damage;
        shieldGridDirection = victimShip.shipDirection.dir + victimShip.shipStats.shieldDirection;
        if (shieldGridDirection > 3) {
            shieldGridDirection = shieldGridDirection - 4;
        }
        if (Math.abs(shieldGridDirection - shooterShip.shipDirection.dir) == 2) {
            reducedDamage = damage * (1 - victimShip.shipStats.defence)
        }
        // let xDiff = victimShip.shipPosition.xIndex - shooterShip.shipPosition.xIndex;
        // let yDiff = victimShip.shipPosition.xIndex - shooterShip.shipPosition.yIndex;
        // if (Math.abs(xDiff) < 1) {
        //     if (yDiff > 0) {
        //         enemyDirection = Direction.Up;
        //     }
        //     else {
        //         enemyDirection = Direction.Down;
        //     }
        // }
        // else if (Math.abs(yDiff) < 1) {
        //     if (xDiff > 0) {
        //         enemyDirection = Direction.Left;
        //     }
        //     else {
        //         enemyDirection = Direction.Right;
        //     }
        // }
        //
        // if (shieldGridDirection == enemyDirection) {
        //     reducedDamage = damage * (1 - victimShip.shipStats.defence);
        // }
        return reducedDamage;
    }

    collisionShieldCheck(updatingShip: ShipModel, referShip: ShipModel, damage: number, turn: number) {
        let shieldGridDirection: Direction;
        let reducedDamage = damage;
        // let xDiff = updatingShip.shipPosition.xIndex - referShip.shipPosition.xIndex;
        // let yDiff = updatingShip.shipPosition.yIndex - referShip.shipPosition.yIndex;
        shieldGridDirection = updatingShip.shipDirection.dir + updatingShip.shipStats.shieldDirection;
        if (shieldGridDirection > 3) {
            shieldGridDirection = shieldGridDirection - 4;
        }
        if (updatingShip.collisionInfo.moveCount == 0 && referShip.collisionInfo.moveCount == 0) {
            if (referShip.shipAction.act[turn - 1] == Action.MoveFront) {
                if (Math.abs(shieldGridDirection - referShip.shipDirection.dir) == 2) {
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
            else if (updatingShip.shipAction.act[turn - 1] == Action.MoveFront) {
                if (updatingShip.shipDirection.dir == shieldGridDirection) {
                    reducedDamage = damage * (1 - updatingShip.shipStats.defence);
                }
            }
        }
        else if (referShip.collisionInfo.moveCount != 0) {
            if (referShip.collisionInfo.resultantMove.yIndex > 0 && shieldGridDirection == Direction.Up) {
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
            if (referShip.collisionInfo.resultantMove.yIndex < 0 && shieldGridDirection == Direction.Down) {
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
            if (referShip.collisionInfo.resultantMove.xIndex > 0 && shieldGridDirection == Direction.Left) {
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
            if (referShip.collisionInfo.resultantMove.xIndex < 0 && shieldGridDirection == Direction.Right) {
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
        }
        else if (updatingShip.collisionInfo.moveCount != 0) {
            if (updatingShip.shipStats.shieldDirection == Direction.Up) {
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
        }
        return reducedDamage;
    }


    inputAction(ship: ShipModel, act: Action): boolean {
        let maxActions = 3;
        if (ship.shipAction.act.length >= maxActions) {
            console.log("Length" + ship.shipAction.act.length);
            return false;
        } else {
            ship.shipAction.act.push(act);
            return true;
        }
    }

    inputShieldUp(ship: ShipModel) {
        let valid: boolean;
        valid = this.inputAction(ship, Action.FrontShield);
        if (valid == false) {
            console.log('Too many actions')
        }
    }

    inputShieldLeft(ship: ShipModel) {
        let valid: boolean;
        valid = this.inputAction(ship, Action.LeftShield);
        if (valid == false) {
            console.log('Too many actions')
        }
    }

    inputShieldRight(ship: ShipModel) {
        let valid: boolean;
        valid = this.inputAction(ship, Action.RightShield);
        if (valid == false) {
            console.log('Too many actions')
        }
    }

    inputShieldDown(ship: ShipModel) {
        let valid: boolean;
        valid = this.inputAction(ship, Action.BackShield);
        if (valid == false) {
            console.log('Too many actions')
        }
    }

    inputShoot(ship: ShipModel) {
        let valid: boolean;
        valid = this.inputAction(ship, Action.ShootFront);
        if (valid == false) {
            console.log('Too many actions')
        }
    }

    inputMove(ship: ShipModel) {
        let valid: boolean;
        valid = this.inputAction(ship, Action.MoveFront);
        if (valid == false) {
            console.log('Too many actions')
        }
    }

    inputRotateRight(ship: ShipModel) {
        let valid: boolean;
        valid = this.inputAction(ship, Action.RightTurn);
        if (valid == false) {
            console.log('Too many actions')
        }
    }

    inputRotateLeft(ship: ShipModel) {
        let valid: boolean;
        valid = this.inputAction(ship, Action.LeftTurn);
        if (valid == false) {
            console.log('Too many actions')
        }
    }

    inputDoNothing(ship: ShipModel) {
        let valid: boolean;
        valid = this.inputAction(ship, Action.DoNothing);
        if (valid == false) {
            console.log('Too many actions')
        }
    }

    fullTurns() {
        for (let turn = 0; turn < 3; turn++) {
            for (let i = 0; i < this.allBattleShips.length; i++) {
                let act = this.allBattleShips[i].shipAction.act[turn];
                if (act == Action.FrontShield) {//fb: shield successful : front side
                    this.shield(this.allBattleShips[i], 0);
                } else if (act == Action.LeftShield) {//fb: shield successful: left side
                    this.shield(this.allBattleShips[i], 1);
                } else if (act == Action.BackShield) {//fb: shield successful: back side
                    this.shield(this.allBattleShips[i], 2);
                } else if (act == Action.RightShield) {//fb: shield successful: right side
                    this.shield(this.allBattleShips[i], 3);
                } else if (act == Action.ShootFront) {//fb: hit OR miss
                    this.shoot(this.allBattleShips[i]);
                } else if (act == Action.MoveFront) { //fb? enemies in radar OR no enemies detected
                    this.move(this.allBattleShips[i]);
                } else if (act == Action.RightTurn) {
                    this.rotate(this.allBattleShips[i], true);
                } else if (act == Action.LeftTurn) {
                    this.rotate(this.allBattleShips[i], false);
                }
                for (let k = 0; k < 4; k++) {//fb: *department* destroyed
                    if (this.allBattleShips[i].shipDepartment.departmentArray[k].health <= 0) {
                        this.allBattleShips[i].shipDepartment.departmentArray[k].alive = false;
                    }
                }
            }
            this.checkCollision(this.battleField.rowGrid.length, turn + 1);
            this.performCollision(this.battleField.rowGrid.length, turn + 1);
            //fb: collision with enemy / successful move
            for (let i = 0; i < this.allBattleShips.length; i++) {
                for (let k = 0; k < 4; k++) {
                    if (this.allBattleShips[i].shipDepartment.departmentArray[k].health <= 0) {
                        this.allBattleShips[i].shipDepartment.departmentArray[k].alive = false;
                    }
                }
                // fb: *department* destroyed
                this.allBattleShips[i].shipStats.shieldActive = false;
            }
        }

        this.allBattleShips.map(ship => {
            // Update the phase
            let depart = ship.shipDepartment.departmentArray;
            this.socket.emit('update', {
                shipId: ship.shipId,
                x: ship.shipPosition.xIndex,
                y: ship.shipPosition.yIndex,
                dir: ship.shipDirection.dir,
                reHealth: depart[0].health,
                leHealth: depart[1].health,
                lwHealth: depart[2].health,
                rwHealth: depart[3].health,
                reAlive: depart[0].alive,
                leAlive: depart[1].alive,
                lwAlive: depart[2].alive,
                rwAlive: depart[3].alive

            });
        });

        // reset all action
        this.allBattleShips.map(ship => {
            ship.shipAction = new ShipAction([]);
        });
    }
}