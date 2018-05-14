"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageModel = /** @class */ (function () {
    function MessageModel(content, username, userId, messageId) {
        this.content = content;
        this.username = username;
        this.userId = userId;
        this.messageId = messageId;
    }
    return MessageModel;
}());
exports.MessageModel = MessageModel;
