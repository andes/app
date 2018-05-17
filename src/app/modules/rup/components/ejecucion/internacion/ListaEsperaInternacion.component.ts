import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Router, ActivatedRoute } from '@angular/router';
import { PrestacionesService } from '../../../services/prestaciones.service';

@Component({
    selector: 'listaEsperaInternacion',
    templateUrl: 'ListaEsperaInternacion.html'

})

export class ListaEsperaInternacionComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;
    @Output() showCamas = new EventEmitter<any>();
    @Output() prestacion = new EventEmitter<any>();

    public prestacionesPendientes: any[];

    constructor(private router: Router, private route: ActivatedRoute,
        private plex: Plex, public auth: Auth,
        public prestacionService: PrestacionesService) { }

    ngOnInit() {
        this.prestacionService.getInternaciones().subscribe(data => {
            this.prestacionesPendientes = data;
        });
    }

    /**
    * Visualizar internacion
    *
    * @param {any} cama Cama en la cual se encuentra internado el paciente.
    * @memberof CamaComponent
    */
    public verInternacion(id) {
        this.router.navigate(['rup/internacion/ver', id]);
    }

    onCancel() {
        this.prestacion.emit(null);
        this.showCamas.emit(false);
    }

    darCama(prestacion) {
        this.prestacion.emit(prestacion);
        this.showCamas.emit(false);
    }
}
