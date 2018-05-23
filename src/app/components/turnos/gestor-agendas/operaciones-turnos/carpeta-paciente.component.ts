import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { IPaciente } from './../../../../interfaces/IPaciente';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ICarpetaPaciente } from './../../../../interfaces/ICarpetaPaciente';
import { PacienteService } from './../../../../services/paciente.service';

@Component({
    selector: 'carpeta-paciente',
    templateUrl: 'carpeta-paciente.html'
})

export class CarpetaPacienteComponent implements OnInit {

    carpetaEfectores: [{ organizacion: { id: string; nombre: string; }; nroCarpeta: string; }];
    nroCarpetaOriginal: string;
    @Input() turnoSeleccionado: ITurno;
    @Output() guardarCarpetaEmit = new EventEmitter<boolean>();
    @Output() cancelarCarpetaEmit = new EventEmitter<boolean>();

    autorizado: any;
    permisosRequeridos = 'turnos:agenda:puedeEditarCarpeta';

    pacienteTurno: any;
    carpetaPaciente = {
        organizacion: {
            id: this.auth.organizacion.id,
            nombre: this.auth.organizacion.nombre
        },
        nroCarpeta: ''
    };

    carpetaSave = {
        organizacion: {
            _id: this.auth.organizacion.id,
            nombre: this.auth.organizacion.nombre
        },
        nroCarpeta: ''
    };

    constructor(public auth: Auth, public plex: Plex, public servicioPaciente: PacienteService) { }

    ngOnInit() {

        // Verificamos permiso para editar carpeta de un paciente
        this.autorizado = this.auth.check(this.permisosRequeridos);

        if (this.autorizado) {
            // Hay paciente?
            if (this.turnoSeleccionado.paciente.id) {
                // Traer las carpetas del paciente que haya en MPI
                this.servicioPaciente.getById(this.turnoSeleccionado.paciente.id).subscribe(paciente => {
                    this.pacienteTurno = paciente;
                    let indiceCarpeta = -1;
                    if (paciente.carpetaEfectores.length > 0) {
                        // Filtramos y traemos sólo la carpeta de la organización actual
                        this.carpetaEfectores = paciente.carpetaEfectores;
                        indiceCarpeta = paciente.carpetaEfectores.findIndex(x => x.organizacion.id === this.auth.organizacion.id);
                        if (indiceCarpeta > -1) {
                            this.carpetaPaciente = paciente.carpetaEfectores[indiceCarpeta];
                            this.nroCarpetaOriginal = paciente.carpetaEfectores[indiceCarpeta].nroCarpeta;
                        }
                    }
                    if (indiceCarpeta === -1) {
                        // Si no hay carpeta en el paciente MPI, buscamos la carpeta en colección carpetaPaciente, usando el nro. de documento
                        this.servicioPaciente.getNroCarpeta({ documento: this.turnoSeleccionado.paciente.documento, organizacion: this.auth.organizacion.id }).subscribe(carpeta => {
                            if (carpeta.nroCarpeta) {
                                this.carpetaPaciente = carpeta;
                            }
                        });
                    }
                });
            }
        };
    }

    guardarCarpetaPaciente() {

        this.carpetaPaciente.nroCarpeta = this.carpetaPaciente.nroCarpeta.trim(); // quitamos los espacios
        if (this.carpetaPaciente.nroCarpeta !== '' && this.carpetaPaciente.nroCarpeta !== this.nroCarpetaOriginal) {

            let indiceCarpeta = this.carpetaEfectores.findIndex(x => (x.organizacion as any)._id === this.auth.organizacion.id);
            if (indiceCarpeta > -1) {
                this.carpetaEfectores[indiceCarpeta] = this.carpetaPaciente;
            } else {
                this.carpetaEfectores.push(this.carpetaPaciente);
            }

            this.servicioPaciente.patch(this.turnoSeleccionado.paciente.id, { op: 'updateCarpetaEfectores', carpetaEfectores: this.carpetaEfectores }).subscribe(resultadoCarpeta => {
                this.guardarCarpetaEmit.emit(true);
            }, error => {
                this.plex.toast('danger', 'El número de carpeta ya existe');
                console.log(error);
            });
        } else {
            this.guardarCarpetaEmit.emit(true);
        }
    }

    cancelar() {
        this.cancelarCarpetaEmit.emit(true);
    }

}
