export class UserModel {
    constructor(public userId: string,
                public email: string,
                public password: string,
                public firstName?: string,
                public lastName?: string) {}
}