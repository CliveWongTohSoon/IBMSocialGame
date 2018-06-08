export class AsteroidModel {
    constructor(public asteroidPosition: AsteroidPosition,
                public asteroidMotion: AsteroidMotion,
                public damage:number,
                public color = '#000000') {}
}

export class AsteroidPosition {
    constructor(public xIndex: number, public yIndex: number) {}
}

export class AsteroidMotion {
    constructor(public xMotion:number, public yMotion:number) {}
}