import {MessageModel} from "./message.model";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {EventEmitter, Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/catch";

@Injectable()
export class MessageService {
    private messages: MessageModel[] = [];
    messageIsEdit = new EventEmitter<MessageModel>();

    constructor(private http: HttpClient) {}

    addMessage(message: MessageModel) {
        // this.messages.push(message);
        // console.log(this.messages);
        const body = JSON.stringify(message);
        const headers = new HttpHeaders({
           'Content-Type': 'application/json'
        });
        return this.http.post('http://localhost:3000/message', body, {headers: headers})
            .map((response: Response) => {
                const result = response;
                const message = new MessageModel(result['obj'].content, 'Dummy', result['obj']._id, null);
                this.messages.push(message);
            })
            .catch((error: Response) => Observable.throw(error));
    }

    getMessage() {
        return this.http.get('http://localhost:3000/message')
            .map((response: Response) => {
                const messages = response['obj'];
                const frontEndMessages: MessageModel[] =
                    Object.keys(messages).map(key => {
                        const content = messages[key].content;
                        const id = messages[key]._id;
                        return new MessageModel(content, 'Dummy', null, id);
                    });
                this.messages = frontEndMessages;
                return frontEndMessages;
            });
    }

    editMessage(message: MessageModel) {
        this.messageIsEdit.emit(message);
    }

    deleteMessage(message: MessageModel) {
        this.messages.splice(this.messages.indexOf(message), 1);
        return this.http
            .delete('http://localhost:3000/message/' + message.messageId);
    }

    updateMessage(message: MessageModel) {
        const body = JSON.stringify(message);
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http.patch('http://localhost:3000/message/' + message.messageId, body, {headers: headers});
    }


}