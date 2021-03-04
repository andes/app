import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Plex } from '@andes/plex';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-mis-consultas',
    templateUrl: './mis-consultas.component.html',
})
export class MisConsultasComponent implements OnInit {
    searchTerm$ = new BehaviorSubject<string>('');

    public selectedId;
    public prestacion$;
    public prestaciones$;


    @Output() eventoSidebar = new EventEmitter<number>();

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit(): void {

        // Servicios
        this.prestaciones$ = this.prestacionService.getConsultas();

        //mostrar listado
        this.prestacion$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getConsulta(params.get('id')))
        );
    }

    nuevoValor() {
        this.prestacionService.actualizarValor(8);
    }

    selected(prestacion) {
        this.selectedId = prestacion.id;
        //this.router.navigate(['portal-paciente', this.selectedId]);
        this.router.navigate(['portal-paciente', { outlets: { detalleConsulta: [this.selectedId] } }]);
        this.nuevoValor();
    }
}
