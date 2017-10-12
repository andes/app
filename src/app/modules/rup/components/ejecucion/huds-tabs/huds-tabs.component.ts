import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'rup-hudsTabs',
    templateUrl: 'huds-tabs.html',

})
export class HudsTabsComponent implements OnInit {

    @Input() registrosHuds: any[] = [];

    constructor() {
    }

    ngOnInit() {
    }

}
