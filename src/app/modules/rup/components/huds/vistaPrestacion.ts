import { Component, ViewEncapsulation, Input, HostBinding, OnInit } from '@angular/core';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { DocumentosService } from '../../../../services/documentos.service';

@Component({
    selector: 'vista-prestacion',
    templateUrl: 'vistaPrestacion.html',
    styleUrls: ['../core/_rup.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class VistaPrestacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    @Input() paciente: IPaciente;
    @Input() prestacion: IPrestacion;
    @Input() evolucionActual: any;
    @Input() indice = 0;

    public ready$ = this.elementosRUPService.ready;
    public puedeDescargarInforme: boolean;
    private requestInProgress: boolean;
    constructor(
        private auth: Auth,
        private servicioDocumentos: DocumentosService,
        public servicioPrestacion: PrestacionesService,
        private servicioPaciente: PacienteService,
        public elementosRUPService: ElementosRUPService) {
    }

    ngOnInit() {
        this.prestacion.ejecucion.registros.forEach(registro => {

            if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                registro.relacionadoCon.forEach((registroRel, key) => {
                    let registroAux = this.prestacion.ejecucion.registros.find(r => {
                        if (r.id) {
                            return r.id === registroRel.id;
                        } else {
                            return r.concepto.conceptId === registroRel.concepto.conceptId;
                        }
                    });
                    if (registroAux) {
                        registro.relacionadoCon[key] = registroAux;
                    } else {
                        registro.relacionadoCon[key] = registroRel;
                    }
                });
            }
        });
        this.puedeDescargarInforme = this.auth.check('huds:impresion');
    }

    private _idPrestacion;
    @Input()
    set idPrestacion(value: any) {
        this.paciente = null;
        this.prestacion = null;
        this._idPrestacion = value;
        this.servicioPrestacion.getById(this.idPrestacion).subscribe(prestacion => {
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
