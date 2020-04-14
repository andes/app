import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-icono-camita',
    templateUrl: './icono-camita.component.html',
    styleUrls: ['./icono-camita.component.scss'],
})

export class IconoCamitaComponent implements OnInit {
    @Input() icono: string;
    @Input() class: string;
    @Input() nombre: string;
    @Input() cantidad: string;

    constructor(
        public auth: Auth,
        private router: Router,
    ) { }

    ngOnInit() {

    }
}
