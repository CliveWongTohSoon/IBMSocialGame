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

@Injectable()
export class GameService {
    private socket: SocketIOClient.Socket;

    constructor() {
        this.socket = io();
    }

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

    // createShipFromDatabase(): Observable<ShipModel[]> {
    //     // TODO:- Dynamically change the numberOfShips
    //     // TODO:- Store position and direction on database
    //     // TODO:- Randomise initial position and direction on pi
    //     return this.http.get('http://localhost:3000/start')
    //         .map((response: Response, i) => { // For each ship
    //             const data = response['obj'];
    //             console.log('Fired!');
    //             return Object.keys(data).map(key => {
    //                 const shipId = data[key]['shipId'], randomX = data[key]['x'], randomY = data[key]['y'], randomDir = data[key]['dir'];
    //
    //                 const start = data[key]['phase'] === 'start'; // Check what I can do with this
    //                 const randomColorBack = this.genRandomColor();
    //                 const randomColorFront = this.shadeColor(randomColorBack, 20);
    //                 const initShipPosition = new ShipPosition(randomX, randomY);
    //                 const initShipDirection = new ShipDirection(randomDir);
    //
    //                 // TODO:- Change initShipStat to dynamically change according to emotion
    //                 const initShipStat = new ShipStats(1000,500,5,0,5,false,0);
    //
    //                 const newShip = new ShipModel(shipId, initShipPosition, initShipDirection,  initShipStat, randomColorFront, randomColorBack);
    //                 newShip.shipDepartment = ShipDepartment.getDepartment(initShipPosition, initShipDirection, this.battleField.rowGrid.length);
    //                 const newShipPosition = new ShipPosition(0,0);
    //                 newShip.collisionInfo = new CollisionInfo(newShipPosition, 0);
    //                 newShip.shipAction = new ShipAction(Array.apply(null, {length: 3})
    //                     .map(_ => Action.DoNothing)
    //                 );
    //                 return start ? newShip : null;
    //             });
    //         })
    //         .map(allShip => allShip.filter(ship => ship !== null))
    //         .map(allShip => {
    //             this.allBattleShips = allShip;
    //             this.updateGridWithAllShip();
    //             return allShip;
    //         });
    // }

    updateShipToDatabase() {
        console.log('Emitting...');
        // this.socket.emit('update', this.allBattleShips);
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
           return () => {this.socket.disconnect()};
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
            return () => {this.socket.disconnect()};
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

        if ( dir == Direction.Up) {
            console.log('Enter up');
            newPosition.yIndex = newPosition.yIndex - 1;
        } else if ( dir == Direction.Down) {
            console.log('Enter down');
            newPosition.yIndex = newPosition.yIndex + 1;
        } else if ( dir == Direction.Right) {
            console.log('Enter right');
            newPosition.xIndex = newPosition.xIndex + 1;
        } else if ( dir == Direction.Left) {
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
            for (i = 0; i<this.allBattleShips.length; i++){
                if(this.allBattleShips[i].collisionInfo.moveCount > 0){
                    validCheck = true;
                }
            }
        }
        for (i = 0; i < this.allBattleShips.length; i++) {
            this.allBattleShips[i].collisionInfo.resultantMove.xIndex = 0;
            this.allBattleShips[i].collisionInfo.resultantMove.yIndex = 0;
        }
    }

    checkCollision(fieldSize :number, turn:number){
        var resultant : ShipPosition = new ShipPosition(0,0);

        for (let i = 0; i < this.allBattleShips.length; i++) {
            for (let j = 0; j < this.allBattleShips.length; j++) {
                if ((((Math.abs(this.allBattleShips[i].shipPosition.xIndex - this.allBattleShips[j].shipPosition.xIndex) <= 1) || (Math.abs(this.allBattleShips[i].shipPosition.xIndex - this.allBattleShips[j].shipPosition.xIndex) == fieldSize-1)) && ((Math.abs(this.allBattleShips[i].shipPosition.yIndex - this.allBattleShips[j].shipPosition.yIndex) <= 1) || (Math.abs(this.allBattleShips[i].shipPosition.yIndex - this.allBattleShips[j].shipPosition.yIndex) == fieldSize-1)))&& this.allBattleShips[i].shipId !== this.allBattleShips[j].shipId) {
                    checkCollisionHit(this.allBattleShips[i], this.allBattleShips[j], turn);
                    if(this.allBattleShips[i].shipPosition.xIndex-this.allBattleShips[j].shipPosition.xIndex == 0 && this.allBattleShips[i].shipPosition.yIndex- this.allBattleShips[j].shipPosition.yIndex == 0){
                        assignResultant(this.allBattleShips[i]);
                    }
                    resultant.xIndex = this.allBattleShips[i].shipPosition.xIndex - this.allBattleShips[j].shipPosition.xIndex;
                    resultant.yIndex = this.allBattleShips[i].shipPosition.yIndex - this.allBattleShips[j].shipPosition.yIndex;

                    if(Math.abs(resultant.xIndex) == fieldSize - 1){
                        resultant.xIndex = -1 * adjustOverflow(resultant.xIndex);
                    }
                    if(Math.abs(resultant.yIndex) == fieldSize - 1){
                        resultant.yIndex = -1 * adjustOverflow(resultant.yIndex);
                    }

                    this.allBattleShips[i].collisionInfo.resultantMove.xIndex += resultant.xIndex;
                    this.allBattleShips[i].collisionInfo.resultantMove.yIndex += resultant.yIndex;

                    if(Math.abs(this.allBattleShips[i].collisionInfo.resultantMove.xIndex) > 1){
                        this.allBattleShips[i].collisionInfo.resultantMove.xIndex = adjustOverflow(this.allBattleShips[i].collisionInfo.resultantMove.xIndex);
                    }
                    if(Math.abs(this.allBattleShips[i].collisionInfo.resultantMove.yIndex) > 1){
                        this.allBattleShips[i].collisionInfo.resultantMove.yIndex = adjustOverflow(this.allBattleShips[i].collisionInfo.resultantMove.yIndex);
                    }

                    this.allBattleShips[i].collisionInfo.moveCount = Math.floor(Math.random() * 3 + 3);

                }
            }
        }

        function checkCollisionHit(rammerShip: ShipModel, victimShip: ShipModel, turn: number){
            for(let i = 0; i < 4; i++){
                for(let j = 0; j < 4; j++){
                    if (rammerShip.shipDepartment.departmentArray[i].xIndex == victimShip.shipDepartment.departmentArray[j].xIndex && rammerShip.shipDepartment.departmentArray[i].yIndex == victimShip.shipDepartment.departmentArray[j].yIndex){
                        updateCollisionHealth(rammerShip, i, victimShip, j, turn);
                    }
                }
            }
            function updateCollisionHealth(rammerShip: ShipModel, affectedRammerDep: number, victimShip: ShipModel, affectedVictimDep: number, turn :number) {
                let damage: number;
                damage = 300;
                if(rammerShip.shipDepartment.departmentArray[affectedRammerDep].alive == false){
                    damage = 50/100 * damage;
                }

                if(victimShip.shipStats.shieldActive == true) {
                    damage = this.collisionShieldCheck(victimShip, rammerShip, damage, turn);
                }

                console.log("DAMAGE" + damage);
                if (victimShip.shipDepartment.departmentArray[affectedVictimDep].health < damage) {
                    victimShip.shipDepartment.departmentArray[affectedVictimDep].health = 0;
                }
                else{
                    victimShip.shipDepartment.departmentArray[affectedVictimDep].health = victimShip.shipDepartment.departmentArray[affectedVictimDep].health - damage;
                }
            }
        }

        function assignResultant(ship: ShipModel) {
            let dir = ship.shipDirection.dir;
            if(ship.collisionInfo.moveCount == 0) {
                if ( dir == Direction.Up) {
                    ship.collisionInfo.resultantMove.yIndex = 1;
                } else if ( dir == Direction.Down) {
                    ship.collisionInfo.resultantMove.yIndex = -1;
                } else if ( dir == Direction.Right) {
                    ship.collisionInfo.resultantMove.xIndex = -1;
                } else if ( dir == Direction.Left) {
                    ship.collisionInfo.resultantMove.xIndex = 1;
                }
            }
            else{
                console.log("ELSE");
                ship.collisionInfo.resultantMove.xIndex *= -1;
                ship.collisionInfo.resultantMove.yIndex *= -1;
            }
        }

        function adjustOverflow(overflow : number):number{
            return Math.abs(overflow)/overflow;
        }
    }

    rotate(ship: ShipModel, clockwise: boolean) {
        let dir = ship.shipDirection.dir;
        let newDirection;
        if (clockwise){ newDirection = this.mod(dir - 1, 4 ); }
        else{ newDirection = this.mod(dir + 1, 4 ); }
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



    randomDir(range : number): number {
        return Math.floor(Math.random() * range);
    }

    shoot(ship:ShipModel){
        for(let l =2;l<4;l++){
            loopAttackRange:
            for(let i = 1; i < ship.shipStats.attackRange+1; i++){ //check all attack range
                for(let j = 0; j < this.allBattleShips.length; j++){ // check all ships (for being attacked)
                    for (let k = 0; k < 4; k++) { //check all four department being hit, also 4 directions. directions are anti-clockwise, and four department are clockwise
                        let defendShip = this.allBattleShips[j];
                        let defendDepart = defendShip.shipDepartment.departmentArray[k];
                        let attackDepart = ship.shipDepartment.departmentArray[l];

                        let bothDepartExist:boolean = (defendDepart.health > 0) && (attackDepart.health > 0);
                        //let bothDepartExist:boolean = (defendDepart.alive) && (attackDepart.alive);
                        //once you implement the changing of alive, uncomment the line above and comment old bothDepartmentExist

                        let positionCorrectUp:boolean = ((attackDepart.yIndex - i) == defendDepart.yIndex) && (attackDepart.xIndex == defendDepart.xIndex);
                        let positionCorrectDown:boolean = ((attackDepart.yIndex + i) == defendDepart.yIndex) && (attackDepart.xIndex == defendDepart.xIndex);
                        let positionCorrectLeft:boolean = ((attackDepart.xIndex - i) == defendDepart.xIndex) && (attackDepart.yIndex == defendDepart.yIndex);
                        let positionCorrectRight:boolean = ((attackDepart.xIndex + i) == defendDepart.xIndex) && (attackDepart.yIndex == defendDepart.yIndex);

                        switch (ship.shipDirection.dir) { //check four attacking ship direction
                            case Direction.Up:
                                if ( positionCorrectUp && bothDepartExist ) {
                                    this.updateShootHealth(ship, defendShip, k);
                                    console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                    break loopAttackRange;
                                }
                                break;
                            case Direction.Down:
                                if ( positionCorrectDown && bothDepartExist ) {
                                    this.updateShootHealth(ship, defendShip, k);
                                    console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                    break loopAttackRange;
                                }
                                break;
                            case Direction.Left:
                                if ( positionCorrectLeft && bothDepartExist ) {
                                    this.updateShootHealth(ship, defendShip, k);
                                    console.log('Department ' + k + ' of ship ' + j + ' is being hit');
                                    break loopAttackRange;
                                }
                                break;
                            case Direction.Right:
                                if ( positionCorrectRight && bothDepartExist ) {
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

    relativePosition(ship:ShipModel,l:number){

        let dir = ship.shipDirection.dir;
        for( let i = 0; i < this.allBattleShips.length; i++ ){
            let x0 = ship.shipPosition.xIndex;
            let y0 = ship.shipPosition.yIndex;

            let x = this.allBattleShips[i].shipPosition.xIndex;
            let y = this.allBattleShips[i].shipPosition.yIndex;
            let xd = x - x0;
            let yd = y - y0;

            if(!( xd == 0 &&  yd == 0)){
                { calPolar(i,wrapDistance(xd),wrapDistance(yd),wrapSub(yd)); }
            } else{
                console.log("current ship is " + i )
            }
        }
        console.log("\n")

        function wrapDistance(xd:number){
            if( Math.abs( xd ) < l/2 ){ return xd; }
            else{
                if( xd < 0 ){ return l + xd; }
                else{ return  -( l - xd ); }
            }
        }
        function wrapSub(yd:number){
            if( Math.abs( yd ) < l/2 ){
                if( yd < 0 ){ return  0; }
                else{ return  180; }
            } else{
                if( yd < 0 ){ return  180; }
                else{ return   0;}
            }
        }
        function calPolar(i:number,xd:number,yd:number,sub:number){
            let rad = Math.atan(xd/yd);
            let deg = rad*180/Math.PI;
            let d = distance( xd, yd );
            logPolar( i, adjustByDir(dir,sub - deg ), d);
        }
        function distance(a:number,b:number){
            return Math.sqrt( Math.pow(a,2) + Math.pow(b,2) );
        }
        function logPolar(i:number,deg:number,distance:number){
            console.log("ship " + i +" 's relative position from this ship is: " + deg +" degree, distance is "+ distance );
        }
        function adjustByDir(dir:Direction,deg:number){
            return mod(dir*90 + deg,360 );
        }
        function mod(n, m) {
            return ((n % m) + m) % m;
        }
    }

    randomCoor(max: number, start: number){ //}, prevPos : number, range : number){
        return Math.floor((Math.random() * max) + start) + 0.5; // + (prevPos + range)) (9 + adjustment)) + prevX + 8) + 0.5;
    }

    genRandomColor(): string {
        return '#'+(Math.random()*0xFFFFFF<<0).toString(16) === '#FFFFFF' ? '#990000' : '#'+(Math.random()*0xFFFFFF<<0).toString(16);
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
        } else{
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
        if (Math.abs(shieldGridDirection - shooterShip.shipDirection.dir) == 2){
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

    collisionShieldCheck(updatingShip: ShipModel, referShip: ShipModel, damage: number, turn: number){
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
        else if (referShip.collisionInfo.moveCount != 0){
            if (referShip.collisionInfo.resultantMove.yIndex > 0 && shieldGridDirection == Direction.Up) {
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
            if (referShip.collisionInfo.resultantMove.yIndex < 0 && shieldGridDirection == Direction.Down){
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
            if (referShip.collisionInfo.resultantMove.xIndex > 0 && shieldGridDirection == Direction.Left){
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
            if (referShip.collisionInfo.resultantMove.xIndex < 0 && shieldGridDirection == Direction.Right){
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
        }
        else if (updatingShip.collisionInfo.moveCount != 0){
            if (updatingShip.shipStats.shieldDirection == Direction.Up){
                reducedDamage = damage * (1 - updatingShip.shipStats.defence)
            }
        }
        return reducedDamage;
    }



    inputAction(ship: ShipModel, act: Action):boolean{
        let maxActions = 3;
        if (ship.shipAction.act.length >= maxActions){
            console.log("Length" + ship.shipAction.act.length);
            return false;
        } else {
            ship.shipAction.act.push(act);
            return true;
        }
    }

    inputShieldUp(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.FrontShield);
        if (valid == false){
            console.log('Too many actions')
        }
    }
    inputShieldLeft(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.LeftShield);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    inputShieldRight(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.RightShield);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    inputShieldDown(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.BackShield);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    inputShoot(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.ShootFront);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    inputMove(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.MoveFront);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    inputRotateRight(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.RightTurn);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    inputRotateLeft(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.LeftTurn);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    inputDoNothing(ship: ShipModel){
        let valid:boolean;
        valid = this.inputAction(ship, Action.DoNothing);
        if (valid == false){
            console.log('Too many actions')
        }
    }

    fullTurns() {
        for (let turn = 0; turn < 3; turn++) {
            for (let i = 0; i < this.allBattleShips.length; i++) {
                let act = this.allBattleShips[i].shipAction.act[turn];
                if ( act == Action.FrontShield) {//fb: shield successful : front side
                    this.shield(this.allBattleShips[i],0);
                } else if (act == Action.LeftShield) {//fb: shield successful: left side
                    this.shield(this.allBattleShips[i],1);
                }else if (act == Action.BackShield) {//fb: shield successful: back side
                    this.shield(this.allBattleShips[i], 2);
                }else if (act == Action.RightShield) {//fb: shield successful: right side
                    this.shield(this.allBattleShips[i], 3);
                }else if (act == Action.ShootFront) {//fb: hit OR miss
                    this.shoot(this.allBattleShips[i]);
                }else if (act == Action.MoveFront) { //fb? enemies in radar OR no enemies detected
                    this.move(this.allBattleShips[i]);
                }else if (act == Action.RightTurn) {
                    this.rotate(this.allBattleShips[i], true);
                }else if (act == Action.LeftTurn) {
                    this.rotate(this.allBattleShips[i], false);
                }
                for (let k = 0; k < 4; k++) {//fb: *department* destroyed
                    if (this.allBattleShips[i].shipDepartment.departmentArray[k].health <= 0) {
                        this.allBattleShips[i].shipDepartment.departmentArray[k].alive = false;
                    }
                }
            }
            this.checkCollision(this.battleField.rowGrid.length, turn+1);
            this.performCollision(this.battleField.rowGrid.length, turn+1);
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

    getPersonality() {
        const json = {
            "word_count": 15128,
            "processed_language": "en",
            "personality": [
                {
                    "trait_id": "big5_openness",
                    "name": "Openness",
                    "category": "personality",
                    "percentile": 0.8048087217136444,
                    "children": [
                        {
                            "trait_id": "facet_adventurousness",
                            "name": "Adventurousness",
                            "category": "personality",
                            "percentile": 0.9045974768772609
                        },
                        {
                            "trait_id": "facet_artistic_interests",
                            "name": "Artistic interests",
                            "category": "personality",
                            "percentile": 0.9790201511572232
                        },
                        {
                            "trait_id": "facet_emotionality",
                            "name": "Emotionality",
                            "category": "personality",
                            "percentile": 0.994913153896493
                        },
                        {
                            "trait_id": "facet_imagination",
                            "name": "Imagination",
                            "category": "personality",
                            "percentile": 0.8714517724206957
                        },
                        {
                            "trait_id": "facet_intellect",
                            "name": "Intellect",
                            "category": "personality",
                            "percentile": 0.8835958016905736
                        },
                        {
                            "trait_id": "facet_liberalism",
                            "name": "Authority-challenging",
                            "category": "personality",
                            "percentile": 0.6486344859769552
                        }
                    ]
                },
                {
                    "trait_id": "big5_conscientiousness",
                    "name": "Conscientiousness",
                    "category": "personality",
                    "percentile": 0.8102947333861581,
                    "children": [
                        {
                            "trait_id": "facet_achievement_striving",
                            "name": "Achievement striving",
                            "category": "personality",
                            "percentile": 0.8447942535266852
                        },
                        {
                            "trait_id": "facet_cautiousness",
                            "name": "Cautiousness",
                            "category": "personality",
                            "percentile": 0.7225672485998348
                        },
                        {
                            "trait_id": "facet_dutifulness",
                            "name": "Dutifulness",
                            "category": "personality",
                            "percentile": 0.8414459590561425
                        },
                        {
                            "trait_id": "facet_orderliness",
                            "name": "Orderliness",
                            "category": "personality",
                            "percentile": 0.6154468578992103
                        },
                        {
                            "trait_id": "facet_self_discipline",
                            "name": "Self-discipline",
                            "category": "personality",
                            "percentile": 0.8344273426362091
                        },
                        {
                            "trait_id": "facet_self_efficacy",
                            "name": "Self-efficacy",
                            "category": "personality",
                            "percentile": 0.7041262378443771
                        }
                    ]
                },
                {
                    "trait_id": "big5_extraversion",
                    "name": "Extraversion",
                    "category": "personality",
                    "percentile": 0.6425580321109656,
                    "children": [
                        {
                            "trait_id": "facet_activity_level",
                            "name": "Activity level",
                            "category": "personality",
                            "percentile": 0.8860397181738027
                        },
                        {
                            "trait_id": "facet_assertiveness",
                            "name": "Assertiveness",
                            "category": "personality",
                            "percentile": 0.6742837190539857
                        },
                        {
                            "trait_id": "facet_cheerfulness",
                            "name": "Cheerfulness",
                            "category": "personality",
                            "percentile": 0.9430030813836863
                        },
                        {
                            "trait_id": "facet_excitement_seeking",
                            "name": "Excitement-seeking",
                            "category": "personality",
                            "percentile": 0.5936685312560733
                        },
                        {
                            "trait_id": "facet_friendliness",
                            "name": "Outgoing",
                            "category": "personality",
                            "percentile": 0.9603396711358603
                        },
                        {
                            "trait_id": "facet_gregariousness",
                            "name": "Gregariousness",
                            "category": "personality",
                            "percentile": 0.6570127643040263
                        }
                    ]
                },
                {
                    "trait_id": "big5_agreeableness",
                    "name": "Agreeableness",
                    "category": "personality",
                    "percentile": 0.9441476521819426,
                    "children": [
                        {
                            "trait_id": "facet_altruism",
                            "name": "Altruism",
                            "category": "personality",
                            "percentile": 0.9925983032671803
                        },
                        {
                            "trait_id": "facet_cooperation",
                            "name": "Cooperation",
                            "category": "personality",
                            "percentile": 0.8640865926209997
                        },
                        {
                            "trait_id": "facet_modesty",
                            "name": "Modesty",
                            "category": "personality",
                            "percentile": 0.7777409427743319
                        },
                        {
                            "trait_id": "facet_morality",
                            "name": "Uncompromising",
                            "category": "personality",
                            "percentile": 0.8952857419791442
                        },
                        {
                            "trait_id": "facet_sympathy",
                            "name": "Sympathy",
                            "category": "personality",
                            "percentile": 0.994659354665798
                        },
                        {
                            "trait_id": "facet_trust",
                            "name": "Trust",
                            "category": "personality",
                            "percentile": 0.9031062247867112
                        }
                    ]
                },
                {
                    "trait_id": "big5_neuroticism",
                    "name": "Emotional range",
                    "category": "personality",
                    "percentile": 0.5011424258038871,
                    "children": [
                        {
                            "trait_id": "facet_anger",
                            "name": "Fiery",
                            "category": "personality",
                            "percentile": 0.16919226490209138
                        },
                        {
                            "trait_id": "facet_anxiety",
                            "name": "Prone to worry",
                            "category": "personality",
                            "percentile": 0.42130232455149075
                        },
                        {
                            "trait_id": "facet_depression",
                            "name": "Melancholy",
                            "category": "personality",
                            "percentile": 0.1490766395109473
                        },
                        {
                            "trait_id": "facet_immoderation",
                            "name": "Immoderation",
                            "category": "personality",
                            "percentile": 0.2702704377158157
                        },
                        {
                            "trait_id": "facet_self_consciousness",
                            "name": "Self-consciousness",
                            "category": "personality",
                            "percentile": 0.29325681738170095
                        },
                        {
                            "trait_id": "facet_vulnerability",
                            "name": "Susceptible to stress",
                            "category": "personality",
                            "percentile": 0.3862483573834635
                        }
                    ]
                }
            ],
            "needs": [
                {
                    "trait_id": "need_challenge",
                    "name": "Challenge",
                    "category": "needs",
                    "percentile": 0.6699981453953766
                },
                {
                    "trait_id": "need_closeness",
                    "name": "Closeness",
                    "category": "needs",
                    "percentile": 0.8366389466400257
                },
                {
                    "trait_id": "need_curiosity",
                    "name": "Curiosity",
                    "category": "needs",
                    "percentile": 0.9338147737801363
                },
                {
                    "trait_id": "need_excitement",
                    "name": "Excitement",
                    "category": "needs",
                    "percentile": 0.7368905165835753
                },
                {
                    "trait_id": "need_harmony",
                    "name": "Harmony",
                    "category": "needs",
                    "percentile": 0.9681096581919244
                },
                {
                    "trait_id": "need_ideal",
                    "name": "Ideal",
                    "category": "needs",
                    "percentile": 0.6846651401448991
                },
                {
                    "trait_id": "need_liberty",
                    "name": "Liberty",
                    "category": "needs",
                    "percentile": 0.7944143551559293
                },
                {
                    "trait_id": "need_love",
                    "name": "Love",
                    "category": "needs",
                    "percentile": 0.8187640742747349
                },
                {
                    "trait_id": "need_practicality",
                    "name": "Practicality",
                    "category": "needs",
                    "percentile": 0.34469863540722323
                },
                {
                    "trait_id": "need_self_expression",
                    "name": "Self-expression",
                    "category": "needs",
                    "percentile": 0.8698181973941164
                },
                {
                    "trait_id": "need_stability",
                    "name": "Stability",
                    "category": "needs",
                    "percentile": 0.8705205013979334
                },
                {
                    "trait_id": "need_structure",
                    "name": "Structure",
                    "category": "needs",
                    "percentile": 0.7464328575415977
                }
            ],
            "values": [
                {
                    "trait_id": "value_conservation",
                    "name": "Conservation",
                    "category": "values",
                    "percentile": 0.886672268738759
                },
                {
                    "trait_id": "value_openness_to_change",
                    "name": "Openness to change",
                    "category": "values",
                    "percentile": 0.8696769334020679
                },
                {
                    "trait_id": "value_hedonism",
                    "name": "Hedonism",
                    "category": "values",
                    "percentile": 0.4401896345423549
                },
                {
                    "trait_id": "value_self_enhancement",
                    "name": "Self-enhancement",
                    "category": "values",
                    "percentile": 0.6488575994223418
                },
                {
                    "trait_id": "value_self_transcendence",
                    "name": "Self-transcendence",
                    "category": "values",
                    "percentile": 0.8280778884301451
                }
            ],
            "behavior": [
                {
                    "trait_id": "behavior_sunday",
                    "name": "Sunday",
                    "category": "behavior",
                    "percentage": 0.2217782217782218
                },
                {
                    "trait_id": "behavior_monday",
                    "name": "Monday",
                    "category": "behavior",
                    "percentage": 0.42157842157842157
                },
                {
                    "trait_id": "behavior_tuesday",
                    "name": "Tuesday",
                    "category": "behavior",
                    "percentage": 0.07092907092907093
                },
                {
                    "trait_id": "behavior_wednesday",
                    "name": "Wednesday",
                    "category": "behavior",
                    "percentage": 0.01098901098901099
                },
                {
                    "trait_id": "behavior_thursday",
                    "name": "Thursday",
                    "category": "behavior",
                    "percentage": 0.12087912087912088
                },
                {
                    "trait_id": "behavior_friday",
                    "name": "Friday",
                    "category": "behavior",
                    "percentage": 0.07692307692307693
                },
                {
                    "trait_id": "behavior_saturday",
                    "name": "Saturday",
                    "category": "behavior",
                    "percentage": 0.07692307692307693
                },
                {
                    "trait_id": "behavior_0000",
                    "name": "0:00 am",
                    "category": "behavior",
                    "percentage": 0.4515484515484515
                },
                {
                    "trait_id": "behavior_0100",
                    "name": "1:00 am",
                    "category": "behavior",
                    "percentage": 0.12087912087912088
                },
                {
                    "trait_id": "behavior_0200",
                    "name": "2:00 am",
                    "category": "behavior",
                    "percentage": 0.02097902097902098
                },
                {
                    "trait_id": "behavior_0300",
                    "name": "3:00 am",
                    "category": "behavior",
                    "percentage": 0.0939060939060939
                },
                {
                    "trait_id": "behavior_0400",
                    "name": "4:00 am",
                    "category": "behavior",
                    "percentage": 0.01998001998001998
                },
                {
                    "trait_id": "behavior_0500",
                    "name": "5:00 am",
                    "category": "behavior",
                    "percentage": 0
                },
                {
                    "trait_id": "behavior_0600",
                    "name": "6:00 am",
                    "category": "behavior",
                    "percentage": 0
                },
                {
                    "trait_id": "behavior_0700",
                    "name": "7:00 am",
                    "category": "behavior",
                    "percentage": 0.01098901098901099
                },
                {
                    "trait_id": "behavior_0800",
                    "name": "8:00 am",
                    "category": "behavior",
                    "percentage": 0
                },
                {
                    "trait_id": "behavior_0900",
                    "name": "9:00 am",
                    "category": "behavior",
                    "percentage": 0
                },
                {
                    "trait_id": "behavior_1000",
                    "name": "10:00 am",
                    "category": "behavior",
                    "percentage": 0
                },
                {
                    "trait_id": "behavior_1100",
                    "name": "11:00 am",
                    "category": "behavior",
                    "percentage": 0
                },
                {
                    "trait_id": "behavior_1200",
                    "name": "12:00 pm",
                    "category": "behavior",
                    "percentage": 0
                },
                {
                    "trait_id": "behavior_1300",
                    "name": "1:00 pm",
                    "category": "behavior",
                    "percentage": 0
                },
                {
                    "trait_id": "behavior_1400",
                    "name": "2:00 pm",
                    "category": "behavior",
                    "percentage": 0
                },
                {
                    "trait_id": "behavior_1500",
                    "name": "3:00 pm",
                    "category": "behavior",
                    "percentage": 0.02197802197802198
                },
                {
                    "trait_id": "behavior_1600",
                    "name": "4:00 pm",
                    "category": "behavior",
                    "percentage": 0.02197802197802198
                },
                {
                    "trait_id": "behavior_1700",
                    "name": "5:00 pm",
                    "category": "behavior",
                    "percentage": 0.03196803196803197
                },
                {
                    "trait_id": "behavior_1800",
                    "name": "6:00 pm",
                    "category": "behavior",
                    "percentage": 0.00999000999000999
                },
                {
                    "trait_id": "behavior_1900",
                    "name": "7:00 pm",
                    "category": "behavior",
                    "percentage": 0.01098901098901099
                },
                {
                    "trait_id": "behavior_2000",
                    "name": "8:00 pm",
                    "category": "behavior",
                    "percentage": 0.02197802197802198
                },
                {
                    "trait_id": "behavior_2100",
                    "name": "9:00 pm",
                    "category": "behavior",
                    "percentage": 0
                },
                {
                    "trait_id": "behavior_2200",
                    "name": "10:00 pm",
                    "category": "behavior",
                    "percentage": 0.04095904095904096
                },
                {
                    "trait_id": "behavior_2300",
                    "name": "11:00 pm",
                    "category": "behavior",
                    "percentage": 0.12187812187812187
                }
            ],
            "consumption_preferences": [
                {
                    "consumption_preference_category_id": "consumption_preferences_shopping",
                    "name": "Purchasing Preferences",
                    "consumption_preferences": [
                        {
                            "consumption_preference_id": "consumption_preferences_automobile_ownership_cost",
                            "name": "Likely to be sensitive to ownership cost when buying automobiles",
                            "score": 0
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_automobile_safety",
                            "name": "Likely to prefer safety when buying automobiles",
                            "score": 0.5
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_clothes_quality",
                            "name": "Likely to prefer quality when buying clothes",
                            "score": 0
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_clothes_style",
                            "name": "Likely to prefer style when buying clothes",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_clothes_comfort",
                            "name": "Likely to prefer comfort when buying clothes",
                            "score": 0
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_influence_brand_name",
                            "name": "Likely to be influenced by brand name when making product purchases",
                            "score": 0.5
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_influence_utility",
                            "name": "Likely to be influenced by product utility when making product purchases",
                            "score": 0.5
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_influence_online_ads",
                            "name": "Likely to be influenced by online ads when making product purchases",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_influence_social_media",
                            "name": "Likely to be influenced by social media when making product purchases",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_influence_family_members",
                            "name": "Likely to be influenced by family when making product purchases",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_spur_of_moment",
                            "name": "Likely to indulge in spur of the moment purchases",
                            "score": 0.5
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_credit_card_payment",
                            "name": "Likely to prefer using credit cards for shopping",
                            "score": 0
                        }
                    ]
                },
                {
                    "consumption_preference_category_id": "consumption_preferences_health_and_activity",
                    "name": "Health & Activity Preferences",
                    "consumption_preferences": [
                        {
                            "consumption_preference_id": "consumption_preferences_eat_out",
                            "name": "Likely to eat out frequently",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_gym_membership",
                            "name": "Likely to have a gym membership",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_outdoor",
                            "name": "Likely to like outdoor activities",
                            "score": 0
                        }
                    ]
                },
                {
                    "consumption_preference_category_id": "consumption_preferences_environmental_concern",
                    "name": "Environmental Concern Preferences",
                    "consumption_preferences": [
                        {
                            "consumption_preference_id": "consumption_preferences_concerned_environment",
                            "name": "Likely to be concerned about the environment",
                            "score": 0
                        }
                    ]
                },
                {
                    "consumption_preference_category_id": "consumption_preferences_entrepreneurship",
                    "name": "Entrepreneurship Preferences",
                    "consumption_preferences": [
                        {
                            "consumption_preference_id": "consumption_preferences_start_business",
                            "name": "Likely to consider starting a business in next few years",
                            "score": 1
                        }
                    ]
                },
                {
                    "consumption_preference_category_id": "consumption_preferences_movie",
                    "name": "Movie Preferences",
                    "consumption_preferences": [
                        {
                            "consumption_preference_id": "consumption_preferences_movie_romance",
                            "name": "Likely to like romance movies",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_movie_adventure",
                            "name": "Likely to like adventure movies",
                            "score": 0
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_movie_horror",
                            "name": "Likely to like horror movies",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_movie_musical",
                            "name": "Likely to like musical movies",
                            "score": 0
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_movie_historical",
                            "name": "Likely to like historical movies",
                            "score": 0
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_movie_science_fiction",
                            "name": "Likely to like science-fiction movies",
                            "score": 0
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_movie_war",
                            "name": "Likely to like war movies",
                            "score": 0
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_movie_drama",
                            "name": "Likely to like drama movies",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_movie_action",
                            "name": "Likely to like action movies",
                            "score": 0
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_movie_documentary",
                            "name": "Likely to like documentary movies",
                            "score": 0
                        }
                    ]
                },
                {
                    "consumption_preference_category_id": "consumption_preferences_music",
                    "name": "Music Preferences",
                    "consumption_preferences": [
                        {
                            "consumption_preference_id": "consumption_preferences_music_rap",
                            "name": "Likely to like rap music",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_music_country",
                            "name": "Likely to like country music",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_music_r_b",
                            "name": "Likely to like R&B music",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_music_hip_hop",
                            "name": "Likely to like hip hop music",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_music_live_event",
                            "name": "Likely to attend live musical events",
                            "score": 0
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_music_playing",
                            "name": "Likely to have experience playing music",
                            "score": 0
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_music_latin",
                            "name": "Likely to like Latin music",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_music_rock",
                            "name": "Likely to like rock music",
                            "score": 0
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_music_classical",
                            "name": "Likely to like classical music",
                            "score": 0
                        }
                    ]
                },
                {
                    "consumption_preference_category_id": "consumption_preferences_reading",
                    "name": "Reading Preferences",
                    "consumption_preferences": [
                        {
                            "consumption_preference_id": "consumption_preferences_read_frequency",
                            "name": "Likely to read often",
                            "score": 0
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_books_entertainment_magazines",
                            "name": "Likely to read entertainment magazines",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_books_non_fiction",
                            "name": "Likely to read non-fiction books",
                            "score": 0
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_books_financial_investing",
                            "name": "Likely to read financial investment books",
                            "score": 1
                        },
                        {
                            "consumption_preference_id": "consumption_preferences_books_autobiographies",
                            "name": "Likely to read autobiographical books",
                            "score": 0
                        }
                    ]
                },
                {
                    "consumption_preference_category_id": "consumption_preferences_volunteering",
                    "name": "Volunteering Preferences",
                    "consumption_preferences": [
                        {
                            "consumption_preference_id": "consumption_preferences_volunteer",
                            "name": "Likely to volunteer for social causes",
                            "score": 0
                        }
                    ]
                }
            ],
            "warnings": []
        };

        let minRange = 4, maxRange = 8;
        let minAttRange = 4, maxAttRange = 8;
        let minHP = 700, maxHP = 1300;
        let minAtt = 400, maxAtt = 800;
        let minDef = 0.5, maxDef = 0.9;
        // const wordCount = json['word_count']; //This will give 15128
        const personality = json['personality']; // This is an array
        const values = json['values'];
        var shipStat = new ShipStats(minHP, minAtt, minAttRange, minDef, minRange, false, 0);
        //const sampleJson = {hallo: [{personality: 'trait'}, {personality: 'second_trait'}]};
        Object.keys(personality).map((key, index) => {
            shipStat = this.personalitySort(shipStat, (personality[key]["trait_id"]), personality[key]["percentile"])
        });
        Object.keys(values).map((key, index) => {
            shipStat = this.valueSort(shipStat, (values[key]["trait_id"]), values[key]["percentile"])
        });
    }

    valueSort(shipStat:ShipStats, traitID: string, percentile: number):ShipStats{
        let minRange = 4, maxRange = 8;
        let minAttRange = 4, maxAttRange = 8;
        let minHP = 700, maxHP = 1300;
        let minAtt = 400, maxAtt = 800;
        let minDef = 0.5, maxDef = 0.9;
        let newShipStat = shipStat;
        const value_fraction = 1/3;
        if(traitID == 'value_conservation'){
            newShipStat.defence += (maxDef - minDef) * value_fraction * percentile;
        }
        if(traitID == 'value_openness_to_change'){
            newShipStat.attack += (maxAtt - minAtt) * value_fraction * percentile;
        }
        if(traitID == 'value_hedonism'){
            newShipStat.totalHp += (maxHP - minHP) * value_fraction * percentile;
        }
        if(traitID == 'value_self_enhancement'){
            newShipStat.range += (maxRange - minRange) * value_fraction * percentile;
        }
        if(traitID == 'value_self_transcendence'){
            newShipStat.attackRange+= (maxAttRange - minAttRange) * value_fraction * percentile;
        }
        console.log(newShipStat);
        console.log(traitID);
        console.log(percentile);
        return newShipStat;
    }

    personalitySort(shipStat: ShipStats, traitID: string, percentile: number):ShipStats{
        let minRange = 4, maxRange = 8;
        let minAttRange = 4, maxAttRange = 8;
        let minHP = 700, maxHP = 1300;
        let minAtt = 400, maxAtt = 800;
        let minDef = 0.5, maxDef = 0.9;

        let newShipStat = shipStat;
        const personality_fraction = 1/3;
        if(traitID == 'big5_openness'){
            if (percentile <= 0.5){
                newShipStat.attack += (maxAtt - minAtt) * personality_fraction;
                newShipStat.range += (maxRange - minRange)*(percentile * personality_fraction / 0.5);
            }
            else if (percentile > 0.5){
                newShipStat.attack += (maxAtt - minAtt)*((1 - percentile) * personality_fraction / 0.5);
                newShipStat.range += (maxRange - minRange) * personality_fraction;
            }
        }
        if(traitID == 'big5_conscientiousness'){
            if (percentile <= 0.5){
                newShipStat.attackRange += (maxAttRange - minAttRange) * personality_fraction;
                newShipStat.range += (maxRange - minRange)*(percentile * personality_fraction / 0.5);
            }
            else if (percentile > 0.5){
                newShipStat.attackRange += (maxAttRange - minAttRange)*((1 - percentile) * personality_fraction / 0.5);
                newShipStat.range += (maxRange - minRange) * personality_fraction;
            }
        }
        if(traitID == 'big5_extraversion'){
            if (percentile <= 0.5){
                newShipStat.defence += (maxDef - minDef) * personality_fraction;
                newShipStat.attack += (maxAtt - minAtt)*(percentile * personality_fraction / 0.5);
            }
            else if (percentile > 0.5){
                newShipStat.defence += (maxDef - minDef)*((1 - percentile) * personality_fraction / 0.5);
                newShipStat.attack += (maxAtt - minAtt) * personality_fraction;
            }
        }
        if(traitID == 'big5_agreeableness'){
            if (percentile <= 0.5){
                newShipStat.defence += (maxDef - minDef) * personality_fraction;
                newShipStat.totalHp += (maxHP - minHP)*(percentile * personality_fraction / 0.5);
            }
            else if (percentile > 0.5){
                newShipStat.defence += (maxDef - minDef)*((1 - percentile) * personality_fraction / 0.5);
                newShipStat.totalHp += (maxHP - minHP) * personality_fraction;
            }
        }
        if(traitID == 'big5_neuroticism'){
            if (percentile <= 0.5){
                newShipStat.totalHp += (maxHP - minHP) * personality_fraction;
                newShipStat.attackRange += (maxAttRange - minAttRange)*(percentile * personality_fraction / 0.5);
            }
            else if (percentile > 0.5){
                newShipStat.totalHp += (maxHP - minHP)*((1 - percentile) * personality_fraction / 0.5);
                newShipStat.attackRange += (maxAttRange - minAttRange) * personality_fraction;
            }
        }

        console.log(newShipStat);
        console.log(traitID);
        console.log(percentile);

        return newShipStat
    }

}
// else if (referShip.shipAction.act[turn-1] == Action.RightTurn || referShip.shipAction.act[turn-1] == Action.LeftTurn){
//     if (xDiff > 0){
//         if (shieldGridDirection == Direction.Left){
//             reducedDamage = damage * (1 - updatingShip.shipStats.defence);
//         }
//     }
//     else if (xDiff < 0){
//         if (shieldGridDirection == Direction.Right){
//             reducedDamage = damage * (1 - updatingShip.shipStats.defence);
//         }
//     }
//     if (yDiff > 0){
//         if (shieldGridDirection == Direction.Up) {
//             reducedDamage = damage * (1 - updatingShip.shipStats.defence);
//         }
//     }
//     else if (yDiff < 0){
//         if (shieldGridDirection == Direction.Down){
//             reducedDamage = damage * (1 - updatingShip.shipStats.defence);
//         }
//     }
// }

// else if (updatingShip.shipAction.act[turn-1] == Action.LeftTurn || updatingShip.shipAction.act[turn-1] == Action.RightTurn){
//     if (xDiff > 0){
//         if (shieldGridDirection == Direction.Left){
//             reducedDamage = damage * (1 - updatingShip.shipStats.defence);
//         }
//     }
//     else if (xDiff < 0){
//         if (shieldGridDirection == Direction.Right){
//             reducedDamage = damage * (1 - updatingShip.shipStats.defence);
//         }
//     }
//     if (yDiff > 0){
//         if (shieldGridDirection == Direction.Up) {
//             reducedDamage = damage * (1 - updatingShip.shipStats.defence);
//         }
//     }
//     else if (yDiff < 0){
//         if (shieldGridDirection == Direction.Down){
//             reducedDamage = damage * (1 - updatingShip.shipStats.defence);
//         }
//     }
// }



