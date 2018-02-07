import { PrestacionesService } from './../../../services/prestaciones.service';
import { TipoPrestacionService } from './../../../../../services/tipoPrestacion.service';
import { IPaciente } from './../../../../../interfaces/IPaciente';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Output, Input, EventEmitter, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import * as moment from 'moment';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';

@Component({
    templateUrl: 'iniciarInternacion.html'
})
export class PrestacionCrearComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    // Fecha seleccionada
    public fecha: Date = new Date();
    // Tipos de prestacion que el usuario tiene permiso
    public tiposPrestacion: any = [];
    // Tipos de prestacion seleccionada
    public tipoPrestacionSeleccionada: any;
    // Paciente sleccionado
    public paciente: IPaciente;
    public buscandoPaciente = false;

    constructor(private router: Router,
        private plex: Plex, public auth: Auth,
        public servicioPrestacion: PrestacionesService,
        public servicioTipoPrestacion: TipoPrestacionService,
        private location: Location) { }

    ngOnInit() {

    }

    onPacienteSelected(paciente: IPaciente) {
        if (paciente.id) {
            this.paciente = paciente;
            this.buscandoPaciente = false;
        } else {
            this.plex.alert('El paciente debe ser registrado en MPI');
        }
    }

    onPacienteCancel() {
        this.buscandoPaciente = false;
    }

    /**
     * Vuelve a la página anterior
     */
    cancelar() {
        this.location.back();
    }

    /**
     * Guarda la prestación
     */
    guardar() {
        if (!this.paciente) {
            this.plex.info('warning', 'Debe seleccionar un paciente');
            return;
        }

        let conceptoSnomed = this.tipoPrestacionSeleccionada;
        let nuevaPrestacion;
        nuevaPrestacion = {
            paciente: {
                id: this.paciente.id,
                nombre: this.paciente.nombre,
                apellido: this.paciente.apellido,
                documento: this.paciente.documento,
                sexo: this.paciente.sexo,
                fechaNacimiento: this.paciente.fechaNacimiento
            },
            solicitud: {
                fecha: this.fecha,
                tipoPrestacion: conceptoSnomed,
                // profesional logueado
                profesional:
                    {
                        id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                        apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                    },
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre },
            },
            ejecucion: {
                fecha: this.fecha,
                registros: [],
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre }
            },
            estados: {
                fecha: new Date(),
                tipo: 'ejecucion'
            }
        };

        nuevaPrestacion.paciente['_id'] = this.paciente.id;
        this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
            this.router.navigate(['/rup/ejecucion', prestacion.id]);
        }, (err) => {
            this.plex.info('danger', 'La prestación no pudo ser registrada. Por favor verifica la conectividad de la red.');
        });
    }

    onReturn() {
        this.router.navigate(['/rup']);
    }

    irResumen(id) {
        this.router.navigate(['rup/validacion/', id]);
    }
}
