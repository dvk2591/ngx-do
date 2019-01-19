import { Component, OnInit , Input } from '@angular/core';
@Component({
    selector: 'cdk-dashcard',
    templateUrl: './dashcard.component.html',
    styleUrls: ['./dashcard.component.theme.scss']
})
export class DashcardComponent implements OnInit {

    @Input() dashData: any;

    constructor() {

     }

    ngOnInit() {
    }

}
