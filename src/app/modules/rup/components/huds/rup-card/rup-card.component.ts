import { Component, Input } from '@angular/core';

@Component({
    selector: 'rup-card',
    templateUrl: './rup-card.component.html',
    styleUrls: [
        '../../core/_rup.scss'
    ]
})
export class RUPCardComponent {
    @Input() titulo: string;
    @Input() estado: string;
    @Input() icono: string;
    @Input() semantic: string;
    @Input() fecha: Date;
}
