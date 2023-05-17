
import { Auth } from '@andes/auth';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { DocumentosService } from '../../../../services/documentos.service';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { populateRelaciones } from '../../operators/populate-relaciones';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { PrestacionesService } from '../../services/prestaciones.service';
@Component({
    selector: 'vista-prestacion',
    templateUrl: 'vistaPrestacion.html',
    styleUrls: ['../core/_rup.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class VistaPrestacionComponent implements OnInit {
    @Input() paciente: IPaciente;
    @Input() prestacion: IPrestacion;
    @Input() puedeEditar: boolean;

    public ready$ = this.elementosRUPService.ready;
    public puedeDescargarInforme: boolean;
    public requestInProgress: boolean;
    public hasPacs: boolean;
    public mostrarMas = false;

    _puedeEditar: boolean;


    constructor(
        private auth: Auth,
        private servicioDocumentos: DocumentosService,
        public servicioPrestacion: PrestacionesService,
        private servicioPaciente: PacienteService,
        public elementosRUPService: ElementosRUPService,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.puedeDescargarInforme = this.auth.check('huds:impresion');
        if (this.prestacion) {
            this.hasPacs = this.prestacion.metadata?.findIndex(item => item.key === 'pacs-uid') >= 0;
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
            this.hasPacs = prestacion.metadata?.findIndex(item => item.key === 'pacs-uid') >= 0;
            this.servicioPaciente.getById(prestacion.paciente.id).subscribe(paciente => {
                this.prestacion = prestacion;
                this.paciente = paciente;
                this._puedeEditar = this.puedeEditar && this.checkUser();
            });
        });
    }

    get idPrestacion(): any {
        return this._idPrestacion;
    }

    mostrar() {
        this.mostrarMas = !this.mostrarMas;
    }

    getTimestamp(fecha) {
        return fecha.getTime();
    }

    checkUser() {
        const permisoExtra = this.auth.check('rup:validacion:' + this.prestacion.solicitud.tipoPrestacion.id);
        return permisoExtra || this.prestacion.createdBy.id === this.auth.usuario.id;
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

    onPacs() {
        this.servicioPrestacion.visualizarImagen(this.prestacion);
    }

    abrirPrestacion() {
        this.servicioPrestacion.notificaRuta({
            // Generico por ahora
            nombre: 'VOLVER',
            ruta: this.router.url
        });
        this.router.navigate(['./rup/ejecucion', this.prestacion.id]);
    }

}
