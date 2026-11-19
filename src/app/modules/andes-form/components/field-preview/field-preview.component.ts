import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'field-preview',
    templateUrl: './field-preview.component.html'
})
export class FieldPreviewComponent implements OnInit {

    @Input() field: any;

    ngOnInit() {
    }

}
