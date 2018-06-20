import {Component} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import * as io from 'socket.io-client';
import {
    Action,
    CollisionInfo, ShipAction,
    ShipDirection,
    ShipModel,
    ShipPhase, ShipPosition,
    ShipStats
} from "../game/ship-model";
import {GameService} from "../game/game.service";
import {Router} from "@angular/router";
import {AsteroidModel} from "../game/asteroid-model";

@Component({
    selector: 'app-introduction',
    templateUrl: './introduction.component.html',
    styleUrls: ['./introduction.component.css'],
    providers: [GameService]
})
export class IntroductionComponent {

    // credential;
    private socket: SocketIOClient.Socket;

    // ship
    shipModel: ShipModel[];

    // Asteroid
    allAsteroid: AsteroidModel[];

    // Your ship stats
    myShipStats: ShipStats;

    constructor(private http: HttpClient, private gameService: GameService, private router: Router) {
        this.socket = io();

        this.createShipFromSocket();

        const url = window.location.origin + '/getuser';
        http.get(url).subscribe(result => {
            const data = result['obj'];
            
            if (!data) this.router.navigate(['/']);

            const message = {
                credentials: data['credentials'],
                userId: data['profile']['handle']
            };

            this.analysePersonality(message).then(result => {
                // Convert to ship Stats
                this.myShipStats = this.getPersonality(result);
                console.log(this.myShipStats);
            });
        });
    }

    createShipFromSocket() {
        this.socket.on('start', data => {

            console.log('Entered start:', data);

            this.shipModel = Object.keys(data).map(key => {
                // console.log(key, data[key]);
                // Randomise
                const shipId = data[key]['shipId'],
                    randomX = data[key]['x'],
                    randomY = data[key]['y'],
                    randomDir = data[key]['dir'],
                    phase = this.gameService.getPhase(data[key]['phase']); // Should give Start initially

                const end = phase === ShipPhase.End; // Check what I can do with this

                const randomColorBack = this.gameService.genRandomColor();
                const randomColorFront = this.gameService.shadeColor(randomColorBack, 20);
                const initShipPosition = new ShipPosition(randomX, randomY);
                const initShipDirection = new ShipDirection(randomDir);

                const newShip = new ShipModel(shipId, initShipPosition, initShipDirection, null, phase, randomColorFront, randomColorBack);

                const newShipPosition = new ShipPosition(0, 0);
                newShip.collisionInfo = new CollisionInfo(newShipPosition, 0);
                newShip.shipAction = new ShipAction(Array.apply(null, {length: 0})
                    .map(_ => Action.DoNothing)
                );

                return end ? newShip : null;
            })
                .filter(ship => ship !== null);
        });

        this.createAsteroid();
    }

    createAsteroid() {
        this.allAsteroid = this.gameService.createAstArray();
    }

    getPersonality(json) {
        let minRange = 4, maxRange = 8;
        let minAttRange = 4, maxAttRange = 8;
        let minHP = 700, maxHP = 1300;
        let minAtt = 400, maxAtt = 800;
        let minDef = 0.5, maxDef = 0.9;
        // const wordCount = json['word_count']; //This will give 15128
        const personality = json['personality']; // This is an array
        const values = json['values'];
        let shipStat = new ShipStats(minHP, minAtt, minAttRange, minDef, minRange, false, 0);
        //const sampleJson = {hallo: [{personality: 'trait'}, {personality: 'second_trait'}]};
        Object.keys(personality).map((key) => {
            shipStat = this.personalitySort(shipStat, (personality[key]["trait_id"]), personality[key]["percentile"])
        });
        Object.keys(values).map((key) => {
            shipStat = this.valueSort(shipStat, (values[key]["trait_id"]), values[key]["percentile"])
        });

        shipStat.attack = Math.round(shipStat.attack);
        shipStat.defence = Number(shipStat.defence.toFixed(3));
        shipStat.range = Math.round(shipStat.range);
        shipStat.attackRange = Math.round(shipStat.attackRange);
        shipStat.totalHp = Math.round(shipStat.totalHp);
        return shipStat;
    }

    valueSort(shipStat: ShipStats, traitID: string, percentile: number): ShipStats {
        let minRange = 4, maxRange = 8;
        let minAttRange = 4, maxAttRange = 8;
        let minHP = 700, maxHP = 1300;
        let minAtt = 400, maxAtt = 800;
        let minDef = 0.5, maxDef = 0.9;
        let newShipStat = shipStat;
        const value_fraction = 1 / 3;
        if (traitID == 'value_conservation') {
            newShipStat.defence += (maxDef - minDef) * value_fraction * percentile;
        }
        if (traitID == 'value_openness_to_change') {
            newShipStat.attack += (maxAtt - minAtt) * value_fraction * percentile;
        }
        if (traitID == 'value_hedonism') {
            newShipStat.totalHp += (maxHP - minHP) * value_fraction * percentile;
        }
        if (traitID == 'value_self_enhancement') {
            newShipStat.range += (maxRange - minRange) * value_fraction * percentile;
        }
        if (traitID == 'value_self_transcendence') {
            newShipStat.attackRange += (maxAttRange - minAttRange) * value_fraction * percentile;
        }
        return newShipStat;
    }

    personalitySort(shipStat: ShipStats, traitID: string, percentile: number): ShipStats {
        let minRange = 4, maxRange = 8;
        let minAttRange = 4, maxAttRange = 8;
        let minHP = 700, maxHP = 1300;
        let minAtt = 400, maxAtt = 800;
        let minDef = 0.5, maxDef = 0.9;

        let newShipStat = shipStat;
        const personality_fraction = 1 / 3;
        if (traitID == 'big5_openness') {
            if (percentile <= 0.5) {
                newShipStat.attack += (maxAtt - minAtt) * personality_fraction;
                newShipStat.range += (maxRange - minRange) * (percentile * personality_fraction / 0.5);
            }
            else if (percentile > 0.5) {
                newShipStat.attack += (maxAtt - minAtt) * ((1 - percentile) * personality_fraction / 0.5);
                newShipStat.range += (maxRange - minRange) * personality_fraction;
            }
        }
        if (traitID == 'big5_conscientiousness') {
            if (percentile <= 0.5) {
                newShipStat.attackRange += (maxAttRange - minAttRange) * personality_fraction;
                newShipStat.range += (maxRange - minRange) * (percentile * personality_fraction / 0.5);
            }
            else if (percentile > 0.5) {
                newShipStat.attackRange += (maxAttRange - minAttRange) * ((1 - percentile) * personality_fraction / 0.5);
                newShipStat.range += (maxRange - minRange) * personality_fraction;
            }
        }
        if (traitID == 'big5_extraversion') {
            if (percentile <= 0.5) {
                newShipStat.defence += (maxDef - minDef) * personality_fraction;
                newShipStat.attack += (maxAtt - minAtt) * (percentile * personality_fraction / 0.5);
            }
            else if (percentile > 0.5) {
                newShipStat.defence += (maxDef - minDef) * ((1 - percentile) * personality_fraction / 0.5);
                newShipStat.attack += (maxAtt - minAtt) * personality_fraction;
            }
        }
        if (traitID == 'big5_agreeableness') {
            if (percentile <= 0.5) {
                newShipStat.defence += (maxDef - minDef) * personality_fraction;
                newShipStat.totalHp += (maxHP - minHP) * (percentile * personality_fraction / 0.5);
            }
            else if (percentile > 0.5) {
                newShipStat.defence += (maxDef - minDef) * ((1 - percentile) * personality_fraction / 0.5);
                newShipStat.totalHp += (maxHP - minHP) * personality_fraction;
            }
        }
        if (traitID == 'big5_neuroticism') {
            if (percentile <= 0.5) {
                newShipStat.totalHp += (maxHP - minHP) * personality_fraction;
                newShipStat.attackRange += (maxAttRange - minAttRange) * (percentile * personality_fraction / 0.5);
            }
            else if (percentile > 0.5) {
                newShipStat.totalHp += (maxHP - minHP) * ((1 - percentile) * personality_fraction / 0.5);
                newShipStat.attackRange += (maxAttRange - minAttRange) * personality_fraction;
            }
        }
        return newShipStat
    }

    startGame(ship, i) {
        // console.log(i);
        console.log('Selected ship: ', ship.shipId, ' at index: ', i);
        // Update to database

        const maxX = 25 / (this.shipModel.length * 2);

        const data = {
            // asteroid: this.allAsteroid,
            shipId: ship.shipId,
            totalHp: this.myShipStats.totalHp,
            x: this.gameService.randomCoor(maxX, 2*i*maxX),
            y: ship.shipPosition.yIndex,
            dir: this.gameService.randomDir(4)
        };

        console.log(data);

        const body = JSON.stringify(data);
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const url = window.location.origin + '/start/init';
        this.http.post(url, body, {headers: headers})
            .take(1)
            .toPromise()
            .then(() => this.router.navigate(['/game']));
    }

    analysePersonality(message) {
        const body = JSON.stringify(message);
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const url = window.location.origin + '/api/profile/twitter';
        return this.http.post(url, body, {headers: headers})
            .take(1)
            .toPromise();
    }
}