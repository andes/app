import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { CARDS } from '../../enums';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PacientePortalService } from '../../services/paciente-portal.service';
@Component({
    selector: 'pdp-mi-inicio',
    templateUrl: './mi-inicio.component.html'
})
export class PDPMiInicioComponent implements OnInit {

    public paciente$: Observable<IPaciente>;
    public selectedId;
    public width: number;
    public cards;
    public datosSecundarios = true;
    public searchTerm = new BehaviorSubject<string>('');

    constructor(
        private router: Router,
        private pacienteService: PacientePortalService,
        private el: ElementRef
    ) { }


    ngOnInit() {
        this.paciente$ = this.pacienteService.me();
        this.cards = CARDS.filter(c => c.inicio);
    }

    ocultarDatos() {
        this.datosSecundarios = !this.datosSecundarios;
    }

    goTo(path) {
        this.router.navigate([path]);
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        if (this.width < 780) {
            this.datosSecundarios = false;
            return true;
        }
        return false;
    }
}
