import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { Plex } from '@andes/plex';
import { setTimeout } from 'timers';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { PacienteService } from '../../../../../../services/paciente.service';
import { CamasService } from '../../../../services/camas.service';
import { OrganizacionService } from '../../../../../../services/organizacion.service';

@Component({
    selector: 'app-cama',
    templateUrl: './cama.component.html',
    styleUrls: ['./cama.component.css'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class CamaComponent implements OnInit {

    @Input() cama: any;
    @Input() prestacion: any;
    @Output() evtCama: EventEmitter<any> = new EventEmitter<any>();

    public organizacion: any;
    public PaseAunidadOrganizativa: any;
    // opciones dropdown cama internada
    public opcionesDropdown: any = [];
    public estadoDesbloqueo: String = 'desocupada';
    public fecha = new Date();
    constructor(private plex: Plex,
        private auth: Auth,
        private camasService: CamasService,
        private router: Router,
        public organizacionService: OrganizacionService,
        private pacienteService: PacienteService) { }

    ngOnInit() {
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
            this.organizacion.unidadesOrganizativas = this.organizacion.unidadesOrganizativas.filter(o => o.conceptId !== this.cama.ultimoEstado.unidadOrganizativa.conceptId);
        });
        this.opcionesDropdown = [
            {
                label: 'Valoración inicial enfermería',
                handler: (() => {
                    // this.verValoracionInicial(scope.cama.idInternacion);
                    alert('TODO');
                })
            },
            {
                label: 'Valoración inicial médica',
                handler: (() => {
                    // this.verValoracionMedica(scope.cama.idInternacion);
                    alert('TODO');
                })
            },
            {
                label: 'Desocupar cama',
                handler: (() => {
                    // this.egresarPaciente(scope.cama);
                    alert('TODO');
                })
            }
        ];
    }

    /**
     * Devuelve el nombre del sector hoja donde esta la cama. Por lo general, debería ser la habitación.
     */

    public getHabitacionName() {
        let sec = this.cama.sectores;
        if (sec && sec.length > 0) {
            return sec[sec.length - 1].nombre;
        }
        return '';
    }

    /**
     * Buscar un paciente para internar.
     *
     * @param {any} cama Cama en la cual se va a internar el paciente.
     * @memberof CamaComponent
     */
    public iniciarPrestacion(cama) {

        if (cama.ultimoEstado.estado !== 'disponible') {
            this.plex.info('warning', 'Debe desinfectar la cama antes de poder internar un paciente', 'Error');
        } else {
            if (this.prestacion) {
                this.darCama();
            } else {
                this.router.navigate(['rup/internacion/crear', cama.id]);
            }
        }
    }

    /**
     * Editar una cama
     *
     * @param {any} cama Cama que se envia a editar
     * @memberof CamaComponent
     */
    editarCama(cama) {
        this.router.navigate(['tm/organizacion/cama', cama.id]);
    }

    /**
     * Visualizar internacion
     *
     * @param {any} cama Cama en la cual se encuentra internado el paciente.
     * @memberof CamaComponent
     */
    public verPrestacion(cama) {
        if (cama.ultimoEstado.estado === 'ocupada' && cama.ultimoEstado.idInternacion) {
            this.router.navigate(['rup/internacion/ver', cama.ultimoEstado.idInternacion]);
        }
    }

    public devolverCama(cama) {
        let dto = {
            fecha: this.fecha,
            estado: cama.ultimoEstado.estado,
            unidadOrganizativa: cama.unidadOrganizativaOriginal,
            especialidades: cama.ultimoEstado.especialidades ? cama.ultimoEstado.especialidades : null,
            esCensable: cama.ultimoEstado.esCensable,
            genero: cama.ultimoEstado.genero ? cama.ultimoEstado.genero : null,
            paciente: cama.ultimoEstado.paciente ? cama.ultimoEstado.paciente : null,
            idInternacion: cama.ultimoEstado.idInternacion ? cama.ultimoEstado.idInternacion : null
        };
        this.camasService.cambiaEstado(cama.id, dto).subscribe(camaActualizada => {
            this.evtCama.emit(null);
        });
    }

    public cambiarEstado(cama, estado) {
        let dto = {
            fecha: this.fecha,
            estado: estado,
            unidadOrganizativa: cama.ultimoEstado.unidadOrganizativa ? cama.ultimoEstado.unidadOrganizativa : null,
            especialidades: cama.ultimoEstado.especialidades ? cama.ultimoEstado.especialidades : null,
            esCensable: cama.ultimoEstado.esCensable,
            genero: cama.ultimoEstado.genero ? cama.ultimoEstado.genero : null,
            paciente: cama.ultimoEstado.paciente ? cama.ultimoEstado.paciente : null,
            idInternacion: cama.ultimoEstado.idInternacion ? cama.ultimoEstado.idInternacion : null
        };

        this.camasService.cambiaEstado(cama.id, dto).subscribe(camaActualizada => {
            cama.ultimoEstado = camaActualizada.ultimoEstado;
            let msg = '';

            switch (estado) {
                case 'reparacion':
                    msg = ' enviada a reparación';
                    break;
                case 'disponible':
                    msg = ' disponible';
                    break;
                case 'bloqueada':
                    msg = ' bloqueada';
                    break;
                case 'desocupada':
                    if (cama.$action === 'reparacion') {
                        msg = ' reparada';
                    } else if (cama.$action === 'bloquear') {
                        msg = ' desbloqueada';
                    } else {
                        msg = 'En preparacion';
                    }
                    break;
            }

            this.plex.toast('success', 'Cama ' + msg, 'Cambio estado');

            // rotamos card
            setTimeout(() => {
                // rotamos cama
                cama.$rotar = false;
                // limpiar motivo por el cual se cambio el estado
                cama.$motivo = '';
                // emitimos la cama modificada
                this.evtCama.emit(cama);
            }, 100);
        }, (err) => {
            this.plex.info('danger', err, 'Error');
        });
    }

    public desocuparCama(cama) {
        let dto = {
            fecha: this.fecha,
            estado: 'desocupada',
            unidadOrganizativa: cama.ultimoEstado.unidadOrganizativa ? cama.ultimoEstado.unidadOrganizativa : null,
            especialidades: cama.ultimoEstado.especialidades ? cama.ultimoEstado.especialidades : null,
            esCensable: cama.ultimoEstado.esCensable,
            genero: cama.ultimoEstado.genero ? cama.ultimoEstado.genero : null,
            paciente: null,
            idInternacion: null,
            sugierePase: this.PaseAunidadOrganizativa
        };

        this.camasService.cambiaEstado(cama.id, dto).subscribe(camaActualizada => {
            cama.ultimoEstado = camaActualizada.ultimoEstado;


            this.plex.toast('success', 'Cama desocupada', 'Cambio estado');

            // rotamos card
            setTimeout(() => {
                // rotamos cama
                cama.$rotar = false;
                // limpiar motivo por el cual se cambio el estado
                cama.$motivo = '';
                // emitimos la cama modificada
                this.evtCama.emit(cama);
            }, 100);
        }, (err) => {
            this.plex.info('danger', err, 'Error');
        });
    }

    SetFecha() {
        this.fecha = new Date();
    }


    darCama() {
        let dto: any;
        // Recuperamos el paciente completo
        this.pacienteService.getById(this.prestacion.paciente.id).subscribe(paciente => {
            // vamos a actualizar el estado de la cama
            dto = {
                fecha: new Date,
                estado: 'ocupada',
                unidadOrganizativa: this.cama.ultimoEstado.unidadOrganizativa ? this.cama.ultimoEstado.unidadOrganizativa : null,
                especialidades: this.cama.ultimoEstado.especialidades ? this.cama.ultimoEstado.especialidades : null,
                esCensable: this.cama.ultimoEstado.esCensable,
                genero: this.cama.ultimoEstado.genero ? this.cama.ultimoEstado.genero : null,
                paciente: paciente,
                idInternacion: this.prestacion.id
            };
            this.camasService.cambiaEstado(this.cama.id, dto).subscribe(camaActualizada => {
                this.cama.ultimoEstado = camaActualizada.ultimoEstado;
                this.router.navigate(['rup/internacion/ver', this.prestacion.id]);
            }, (err1) => {
                this.plex.info('danger', err1, 'Error al intentar ocupar la cama');
            });
        });
    }

}
