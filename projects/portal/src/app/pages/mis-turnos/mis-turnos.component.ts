import { Component, OnInit, ElementRef } from '@angular/core';
import { PrestacionService } from '../../services/prestaciones.service';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';


@Component({
    selector: 'pdp-mis-turnos',
    templateUrl: 'mis-turnos.component.html',
})
export class PDPMisTurnosComponent implements OnInit {

    public width: number;
    public turnos$: Observable<any>;
    public familiar: any = false;

    constructor(
        private prestacionService: PrestacionService,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private el: ElementRef) { }

    ngOnInit(): void {
        this.familiar = window.sessionStorage.getItem('familiar');
        this.getTurnos();
    }

    goTo(id?) {
        if (id) {
            this.router.navigate([id], { relativeTo: this.activeRoute });
        } else {
            this.router.navigate(['mis-turnos']);
        }
    }
    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

    getTurnos() {
        const params = { horaInicio: moment(new Date()).format(), familiar: JSON.stringify(this.familiar) };
        this.turnos$ = this.prestacionService.getTurnos(params);
    }

}
