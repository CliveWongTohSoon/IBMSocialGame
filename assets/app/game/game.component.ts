import {Component, OnInit} from "@angular/core";
import {ShipModel, Action, ShipAction, ShipPhase} from "./ship-model";
import {BattleFieldModel, TableContent} from "./battle-field-model";
import {GameService} from "./game.service";
import {AsteroidModel} from "./asteroid-model";

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
    providers: [GameService]
})

export class GameComponent implements OnInit {

    text: string = 'Right';
    disabledBool = true;

    showButton = '';
    Move = 0;


    battleField: BattleFieldModel;
    allBattleShip: ShipModel[];
    // allAsteroid: AsteroidModel[];

    // Mock raspberry pi
    intentArray = [];

    constructor(private gameService: GameService) {
        gameService.init(25).subscribe(battleField => {
            this.battleField = battleField;
            // gameService.createAstArray();
        });
    }

    renderBackgroundColor(col: TableContent) {
        return col.color ? col.color : 'white';
    }

    relativePosition(ship:ShipModel){
        this.gameService.relativePosition(ship,this.battleField.rowGrid.length);
    }

    inputMove(ship:ShipModel){
        this.intentArray.push('MoveFront');
        // this.gameService.inputMove(ship);
    }

    inputRotateLeft(ship:ShipModel){
        this.intentArray.push('LeftTurn');
        // this.gameService.inputRotateLeft(ship);
    }

    inputRotateRight(ship:ShipModel){
        this.intentArray.push('RightTurn');
        // this.gameService.inputRotateRight(ship);
    }

    inputShoot(ship:ShipModel){
        this.intentArray.push('ShootFront');
        // this.gameService.inputShoot(ship);
    }

    inputShieldUp(ship:ShipModel){
        this.intentArray.push('FrontShield');
        // this.gameService.inputShieldUp(ship);
    }

    inputShieldDown(ship:ShipModel){
        this.intentArray.push('BackShield');
        // this.gameService.inputShieldDown(ship);
    }

    inputShieldLeft(ship:ShipModel){
        this.intentArray.push('LeftShield');
        // this.gameService.inputShieldLeft(ship);
    }

    inputShieldRight(ship:ShipModel){
        this.intentArray.push('RightShield');
        // this.gameService.inputShieldRight(ship);
    }

    /*************************************************
     * Mimic raspberry pi voice command
     * ***********************************************/
    getInstruction(intent, entity) {
        if (intent === 'goforward') return 'MoveFront';
        else if (intent === 'rotate' && entity === 'left') return 'LeftTurn';
        else if (intent === 'rotate' && entity === 'right') return 'RightTurn';
        else if (intent === 'attack') return 'ShootFront';
        else if (intent === 'defence' && entity === 'front') return 'FrontShield';
        else if (intent === 'defence' && entity === 'rear') return 'BackShield';
        else if (intent === 'defence' && entity === 'right') return 'RightShield';
        else if (intent === 'defence' && entity === 'left') return 'LeftShield';
        else return 'DoNothing';
    }


    fullTurns(ship: ShipModel) {
        // Test
        this.gameService.test(ship.shipId, this.intentArray);
        this.intentArray = [];
    }

    instructionToAction(ship: ShipModel, instruction: String) {
        if (instruction === 'MoveFront') this.gameService.inputMove(ship);
        else if (instruction === 'LeftTurn') this.gameService.inputRotateLeft(ship);
        else if (instruction === 'RightTurn') this.gameService.inputRotateRight(ship);
        else if (instruction === 'ShootFront') this.gameService.inputShoot(ship);
        else if (instruction === 'FrontShield') this.gameService.inputShieldUp(ship);
        else if (instruction === 'BackShield') this.gameService.inputShieldDown(ship);
        else if (instruction === 'RightShield') this.gameService.inputShieldRight(ship);
        else if (instruction === 'LeftShield') this.gameService.inputShieldLeft(ship);
    }

    ngOnInit() {
        // this.gameService.createShipFromSocket().subscribe(console.log);
        this.gameService.listenToInstruction().subscribe(instructionData => {
            // Match instruction data to different action
            // console.log('Entered listenToInstruction', instructionData);
            const currentShip = this.allBattleShip.filter(ship => ship.shipId === instructionData['shipId'])[0];

            // Update the ship phase to phase given in instruction
            // console.log(this.allBattleShip, instructionData['shipId']);
            currentShip.phase = this.gameService.getPhase(instructionData['phase']);
            const instruction0 = instructionData['instruction0'];
            const instruction1 = instructionData['instruction1'];
            const instruction2 = instructionData['instruction2'];

            // Update by calling fullTurns
            this.instructionToAction(currentShip, instruction0);
            this.instructionToAction(currentShip, instruction1);
            this.instructionToAction(currentShip, instruction2);

            // Check All BattleShip is Ready
            const allBattleShipReady = this.allBattleShip.reduce((prev, curr) => {
                return curr.phase === ShipPhase.Action && prev;
            }, this.allBattleShip);

            console.log('Are all battleship ready?', allBattleShipReady);

            if (allBattleShipReady) {
                // console.log('Entering full turn...');
                this.gameService.fullTurns();
            }
        });

        this.gameService.createShipFromSocket().subscribe(shipModel => {
            this.allBattleShip = shipModel;

        });
    }

    showDiv(i){
        if(i==0){
            this.showButton = 'TestShipB';
        }
        else{
            this.showButton = 'TestShipA';
        }
    }
}





