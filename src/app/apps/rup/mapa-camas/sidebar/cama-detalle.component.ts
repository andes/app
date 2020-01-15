import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CamasService } from '../../internacion/services/camas.service';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { Router } from '@angular/router';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { ElementosRUPService } from '../../../../modules/rup/services/elementosRUP.service';


@Component({
    selector: 'app-cama-detalle',
    templateUrl: 'cama-detalle.component.html'
})
export class CamaDetalleComponent implements OnInit {
    // Eventos
    @Input() capa: string;
    @Input() cama: any;
    @Input() estados: any;
    @Input() relaciones: any;

    @Output() cancel = new EventEmitter<any>();
    @Output() accionCama = new EventEmitter<any>();

    // VARIABLES
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
    public egreso;
    public conceptosInternacion;

    constructor(
        private router: Router,
        private camaService: CamasService,
        private pacienteService: PacienteService,
        private prestacionService: PrestacionesService,
        private elementoRupService: ElementosRUPService
    ) { }

    ngOnInit() {
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
        }

    }

    getDatosCama() {
        this.paciente = null;
        if (this.cama.paciente) {
            this.getPaciente();
        }

        this.estadoCama = this.estados.filter(est => this.cama.estado === est.key)[0];
        this.iconoCama = this.estadoCama.icon.substring(this.estadoCama.icon.indexOf('-') + 1);
        this.sector = this.cama.sectores[this.cama.sectores.length - 1].nombre;

        this.especialidades = '';
        for (const especialidad of this.cama.especialidades) {
            this.especialidades += especialidad.term + ', ';
        }
    }

    getPaciente() {
        this.pacienteService.getSearch({ documento: this.cama.paciente.documento }).subscribe(paciente => {
            this.paciente = paciente[0];
            if (this.paciente.estado === 'validado') {
                this.validadoColor = 'success';
            } else {
                this.validadoColor = 'warning';
            }
            this.edadPaciente = this.calcularEdad(this.paciente.fechaNacimiento, moment().toDate());
        });
    }

    getRelacionesPosibles() {
        this.relacionesPosibles = [];
        this.estados.map(est =>
            this.relaciones.map(rel => {
                if (this.estadoCama.key === rel.origen) {
                    if (est.key === rel.destino && rel.destino !== 'inactiva') {
                        if (rel.accion === 'desocuparCama') {
                            this.egreso = rel;
                        } else {
                            this.relacionesPosibles.push(rel);
                        }
                    }
                }
            })
        );
    }

    cancelar() {
        this.cancel.emit();
    }

    calcularEdad(fechaNacimiento: Date, fechaCalculo: Date): any {
        let edad: any;
        let fechaNac: any;
        let fechaActual: Date = fechaCalculo ? fechaCalculo : new Date();
        let fechaAct: any;
        let difAnios: any;
        let difDias: any;
        let difMeses: any;
        let difHs: any;
        let difMn: any;

        fechaNac = moment(fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
        fechaAct = moment(fechaActual, 'YYYY-MM-DD HH:mm:ss');
        difDias = fechaAct.diff(fechaNac, 'd'); // Diferencia en días
        difAnios = Math.floor(difDias / 365.25);
        difMeses = Math.floor(difDias / 30.4375);
        difHs = fechaAct.diff(fechaNac, 'h'); // Diferencia en horas
        difMn = fechaAct.diff(fechaNac, 'm'); // Diferencia en minutos

        if (difAnios !== 0) {
            edad = {
                valor: difAnios,
                unidad: 'año/s'
            };
        } else if (difMeses !== 0) {
            edad = {
                valor: difMeses,
                unidad: 'mes/es'
            };
        } else if (difDias !== 0) {
            edad = {
                valor: difDias,
                unidad: 'día/s'
            };
        } else if (difHs !== 0) {
            edad = {
                valor: difHs,
                unidad: 'hora/s'
            };
        } else if (difMn !== 0) {
            edad = {
                valor: difMn,
                unidad: 'minuto/s'
            };
        }

        return (String(edad.valor) + ' ' + edad.unidad);
    }

    verEpicrisis() {

    }

    goTo() {
        this.router.navigate([`/internacion/cama/${this.capa}/${this.cama._id}`]);
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
}
