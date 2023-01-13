import { Component, Input, LOCALE_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'calendario-novedades',
    templateUrl: 'calendario-novedades.component.html',
    providers: [{
        provide: LOCALE_ID, useValue: 'es-AR'
    }]
})
export class CalendarioNovedadesComponent {
    @Input() fecha: string;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
    ) {
    }

    public onChangeFecha(event: { value: Date }) {
        const fecha = moment(event.value).format('YYYY-MM-DD');

        this.abrirFecha(fecha);
    }

    private abrirFecha(fecha: string) {
        this.router.navigate(['/novedades/fecha/', fecha], { relativeTo: this.route });
    }

    public volver() {
        this.router.navigate(['/novedades'], { relativeTo: this.route });
    }
}
