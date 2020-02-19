import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { Router } from '@angular/router';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { ElementosRUPService } from '../../../../modules/rup/services/elementosRUP.service';
import { MapaCamasService } from '../services/mapa-camas.service';
import { IPrestacion } from '../../../../modules/rup/interfaces/prestacion.interface';


@Component({
    selector: 'app-cama-detalle',
    templateUrl: 'cama-detalle.component.html'
})
export class CamaDetalleComponent implements OnInit {
    // Eventos
    @Input() fecha: Date;
    @Input() cama: any;
    @Input() camas: any;
    @Input() estados: any;
    @Input() relaciones: any;

    @Output() cancel = new EventEmitter<any>();
    @Output() accionCama = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<any>();

    // VARIABLES
    public capa: string;
    public prestacion: IPrestacion;
    public estadoCama;
    public genero;
    public censable;
    public paciente;
    public iconoCama;
    public edadPaciente;
    public relacionesPosibles;
    public sector;
    public especialidades;
    public validadoColor;
    public conceptosInternacion;
    public titleColor;
    public tabIndex = 0;
    public editar = false;

    constructor(
        private router: Router,
        private pacienteService: PacienteService,
        private prestacionService: PrestacionesService,
        private elementoRupService: ElementosRUPService,
        private mapaCamasService: MapaCamasService
    ) {
    }

    ngOnInit() {
        this.capa = this.mapaCamasService.capa;

        this.getDatosCama();
        this.getRelacionesPosibles();
        this.genero = (this.cama.genero.term === 'género masculino') ? 'Cama Masculina' : 'Cama Femenina';
        this.censable = (this.cama.esCensable) ? 'Censable' : 'No Censable';

        this.elementoRupService.ready.subscribe(() => {
            this.conceptosInternacion = this.elementoRupService.getConceptosInternacion();
        });
    }

    // tslint:disable-next-line:use-lifecycle-interface
    ngOnChanges(changes: SimpleChanges) {
        if (changes && this.estadoCama) {
            if (this.cama.idCama !== changes['cama']) {
                this.getDatosCama();
                this.getRelacionesPosibles();
            }
            this.cambiarTab(0);
        }

    }

    getDatosCama() {
        this.paciente = null;
        if (this.cama.paciente) {
            if (this.capa === 'estadistica') {
                this.getPrestacion();
            }
            this.getPaciente();
        }

        this.estadoCama = this.estados.filter(est => this.cama.estado === est.key)[0];
        this.iconoCama = this.estadoCama.icon.substring(this.estadoCama.icon.indexOf('-') + 1);
        this.sector = this.cama.sectores[this.cama.sectores.length - 1].nombre;

        this.especialidades = '';
        for (const especialidad of this.cama.especialidades) {
            this.especialidades += especialidad.term + ', ';
        }

        this.titleColor = 'text-' + this.estadoCama.color;
    }

    getPrestacion() {
        this.prestacionService.getById(this.cama.idInternacion).subscribe(prestacion => {
            this.prestacion = prestacion;
        });
    }

    getPaciente() {
        this.pacienteService.getSearch({ documento: this.cama.paciente.documento }).subscribe(paciente => {
            this.paciente = paciente[0];
            if (this.paciente.estado === 'validado') {
                this.validadoColor = 'success';
            } else {
                this.validadoColor = 'warning';
            }
            this.edadPaciente = this.mapaCamasService.calcularEdad(this.paciente.fechaNacimiento, moment().toDate());
        });
    }

    getRelacionesPosibles() {
        this.relacionesPosibles = [];
        this.estados.map(est =>
            this.relaciones.map(rel => {
                if (this.estadoCama.key === rel.origen) {
                    if (est.key === rel.destino && rel.destino !== 'inactiva') {
                        this.relacionesPosibles.push(rel);
                    }
                }
            })
        );
    }

    cancelar() {
        this.cancel.emit();
    }

    cambiarTab(index) {
        this.tabIndex = index;
    }

    goTo() {
        this.router.navigate([`/internacion/cama/${this.cama._id}`]);
    }

    accion(relacion) {
        this.accionCama.emit({ cama: this.cama, relacion });
    }

    /**
       * Crea la prestacion de epicrisis, si existe recupera la epicrisis
       * creada anteriormente.
       * Nos rutea a la ejecucion de RUP.
       */
    generaEpicrisis() {
        this.prestacionService.get({ idPrestacionOrigen: this.cama.idInternacion }).subscribe(prestacionExiste => {
            if (prestacionExiste.length === 0) {
                let nuevaPrestacion = this.prestacionService.inicializarPrestacion(this.paciente, this.conceptosInternacion.epicrisis, 'ejecucion', 'internacion');
                nuevaPrestacion.solicitud.prestacionOrigen = this.cama.idInternacion;
                this.prestacionService.post(nuevaPrestacion).subscribe(prestacion => {
                    this.router.navigate(['rup/ejecucion', prestacion.id]);
                });
            } else {
                this.router.navigate(['rup/ejecucion', prestacionExiste[0].id]);
            }
        });
    }

    editarFormulario(editar: boolean) {
        this.editar = editar;
    }

    refrescar(accion) {
        this.refresh.emit(accion);
    }
}
