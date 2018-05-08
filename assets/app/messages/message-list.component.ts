import {Component, OnInit} from "@angular/core";
import {MessageModel} from "./message.model";
import {MessageService} from "./message.service";

@Component({
    selector: 'app-message-list',
    templateUrl: './message-list.component.html'
})
export class MessageListComponent implements OnInit {

    messages: MessageModel[];

    constructor(private messageService: MessageService) {}

    editClicked(message: MessageModel) {
        message.content = 'Changed!';
    }

    ngOnInit() {
        this.messageService.getMessage()
            .subscribe((messages: MessageModel[]) => {
                this.messages = messages;
            });
    }
}