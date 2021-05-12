import { Component, ViewEncapsulation, Input, HostBinding, OnInit } from '@angular/core';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { DocumentosService } from '../../../../services/documentos.service';
import { map } from 'rxjs/operators';
import { populateRelaciones } from '../../operators/populate-relaciones';

@Component({
    selector: 'vista-prestacion',
    templateUrl: 'vistaPrestacion.html',
    styleUrls: ['../core/_rup.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class VistaPrestacionComponent implements OnInit {
    @Input() paciente: IPaciente;
    @Input() prestacion: IPrestacion;
    @Input() evolucionActual: any;
    @Input() indice = 0;

    public ready$ = this.elementosRUPService.ready;
    public puedeDescargarInforme: boolean;
    public requestInProgress: boolean;

    constructor(
        private auth: Auth,
        private servicioDocumentos: DocumentosService,
        public servicioPrestacion: PrestacionesService,
        private servicioPaciente: PacienteService,
        public elementosRUPService: ElementosRUPService
    ) {
    }

    ngOnInit() {
        this.puedeDescargarInforme = this.auth.check('huds:impresion');
        if (this.prestacion) {
            populateRelaciones(this.prestacion);
        }
    }

    private _idPrestacion;
    @Input()
    set idPrestacion(value: any) {
        this.paciente = null;
        this.prestacion = null;
        this._idPrestacion = value;
        this.servicioPrestacion.getById(this.idPrestacion).pipe(
            map(prestacion => populateRelaciones(prestacion))
        ).subscribe(prestacion => {
            this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                this.prestacion = prestacion;
                this.paciente = paciente;
            });
        });
    }
    get idPrestacion(): any {
        return this._idPrestacion;
    }

    getTimestamp(fecha) {
        return fecha.getTime();
    }


    descargarInforme() {
        this.requestInProgress = true;
        const term = this.prestacion.solicitud.tipoPrestacion.term;
        const informe = { idPrestacion: this.prestacion.id };

        this.servicioDocumentos.descargarInformeRUP(informe, term).subscribe(
            () => this.requestInProgress = false,
            () => this.requestInProgress = false
        );
    }

}
