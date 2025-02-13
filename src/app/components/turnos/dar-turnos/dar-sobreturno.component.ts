
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { CarpetaPacienteService } from 'src/app/core/mpi/services/carpeta-paciente.service';
import { IPaciente, IPacienteBasico } from '../../../core/mpi/interfaces/IPaciente';
import { PacienteService } from '../../../core/mpi/services/paciente.service';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { ObraSocialService } from './../../../services/obraSocial.service';
import { TurnoService } from './../../../services/turnos/turno.service';

@Component({
    selector: 'dar-sobreturno',
    templateUrl: 'dar-sobreturno.html',
    styleUrls: ['dar-sobreturno.scss']
})

export class DarSobreturnoComponent implements OnChanges {
    public nota: any;
    public lenNota = 140;
    public changeCarpeta: boolean;
    public carpetaEfector: any;
    public agenda;
    public paciente: IPaciente;
    public tipoPrestacion: ITipoPrestacion;
    public horaTurno = null;
    public telefono = '';
    public cambioTelefono = false;
    public hoy = moment().toDate();
    public inicio: Date;
    public fin: Date;
    public turno_link;
    public sobreturno;
    public modelo: any = {
        obraSocial: '',
        prepaga: ''
    };
    public disableGuardar = true;
    turnosFuturos = [];
    modalTurnosRepetidos = false;

    @ViewChild('modalSobreturno', { static: true }) modal: PlexModalComponent;
    @Output() volver = new EventEmitter();
    @Input() idAgenda: string;
    @Input() idPaciente: string;

    constructor(
        private plex: Plex,
        private serviceAgenda: AgendaService,
        public serviceTurno: TurnoService,
        private auth: Auth,
        private servicePaciente: PacienteService,
        private serviceCarpetaPaciente: CarpetaPacienteService,
        public obraSocialService: ObraSocialService) { }

    recuperarDatos() {
        this.serviceAgenda.getById(this.idAgenda).subscribe(agenda => {
            this.agenda = agenda;
            this.inicio = moment(this.hoy.setHours(this.agenda?.horaInicio?.getHours(), this.agenda?.horaInicio?.getMinutes(), 0, 0)).toDate();
            this.fin = moment(this.hoy.setHours(this.agenda?.horaFin?.getHours(), this.agenda?.horaFin?.getMinutes(), 0, 0)).toDate();

            if (this.agenda.tipoPrestaciones?.length === 1) {
                this.tipoPrestacion = this.agenda.tipoPrestaciones[0];
                this.buscarTurnosFuturos();
            }
            if (agenda.link) {
                this.turno_link = agenda.link;
            }
        });

        this.servicePaciente.getById(this.idPaciente).subscribe(res => {
            this.paciente = res;
        });

        this.carpetaEfector = {
            organizacion: {
                _id: this.auth.organizacion.id,
                nombre: this.auth.organizacion.nombre
            },
            nroCarpeta: ''
        };
    }

    ngOnChanges() {
        this.recuperarDatos();
    }

    setFinanciador(financiador) {
        financiador?.prepaga ?
            this.modelo.prepaga = financiador
            :
            this.modelo.obraSocial = financiador;
    }

    // Operaciones con carpetaPaciente

    // Se busca el número de carpeta de la Historia Clínica en papel del paciente
    // a partir del documento y del efector
    obtenerCarpetaPaciente() {
        let indiceCarpeta = -1;
        if (this.paciente.carpetaEfectores.length) {
            // Filtro por organizacion
            indiceCarpeta = this.paciente.carpetaEfectores.findIndex(x => x.organizacion.id === this.auth.organizacion.id);
            if (indiceCarpeta > -1) {
                this.carpetaEfector = this.paciente.carpetaEfectores[indiceCarpeta];
            }
        }
        if (indiceCarpeta === -1) {
            // Si no hay carpeta en el paciente MPI, buscamos la carpeta en colección carpetaPaciente, usando el nro. de documento
            this.serviceCarpetaPaciente.getNroCarpeta({ documento: this.paciente.documento, organizacion: this.auth.organizacion.id }).subscribe(carpeta => {
                if (carpeta.nroCarpeta) {
                    this.carpetaEfector.nroCarpeta = carpeta.nroCarpeta;
                    this.changeCarpeta = true;
                }
            });
        }
    }

    actualizarCarpetaPaciente() {
        this.servicePaciente.patch(this.paciente.id, { op: 'updateCarpetaEfectores', carpetaEfectores: this.paciente.carpetaEfectores }).subscribe(() => {
        });
    }

    // Se ejecuta al modificar el campo NroCarpeta
    cambiarCarpeta() {
        this.changeCarpeta = true;
    }

    buscarTurnosFuturos() {
        if (this.tipoPrestacion) {
            this.serviceTurno.getHistorial({ pacienteId: this.idPaciente }).subscribe(turnos => {
                // Filtrar los turnos que cumplen con la condición
                const fechaHoy = moment();
                this.turnosFuturos = turnos
                    .filter(turno => {
                        const fechaTurno = moment(turno.horaInicio);
                        const cumpleCondiciones =
                            turno.tipoPrestacion?._id === this.tipoPrestacion['_id'] &&
                            turno.estado === 'asignado' &&
                            fechaTurno.isAfter(fechaHoy);

                        return cumpleCondiciones;
                    })
                    .map(turno => (
                        {
                            horaInicio: turno.horaInicio,
                            organizacion: turno.organizacion.nombre,
                            tipoPrestacion: turno.tipoPrestacion.term,
                        }));
            });
        }
    }

    modalClose() {
        this.modalTurnosRepetidos = false;
    }

    verTurnosFuturos($event) {
        if ($event.formValid) {
            if (this.turnosFuturos.length > 0) {
                this.modalTurnosRepetidos = true;
            } else {
                this.guardar();
            }
        } else {
            this.plex.info('warning', 'Debe completar los datos requeridos');
        }
    }

    guardar() {
        this.disableGuardar = false;
        const indiceCarpeta = this.paciente.carpetaEfectores.findIndex(x => x.organizacion.id === this.auth.organizacion.id);

        if (indiceCarpeta > -1) {
            this.paciente.carpetaEfectores[indiceCarpeta] = this.carpetaEfector;
        } else {
            this.paciente.carpetaEfectores.push(this.carpetaEfector);
        }

        let osPaciente: any;

        if (this.modelo.obraSocial === 'SUMAR') {
            osPaciente = {
                codigoPuco: null,
                financiador: 'SUMAR',
                nombre: null
            };
        } else {
            this.modelo.prepaga ? osPaciente = this.modelo.prepaga :
                osPaciente = this.modelo.obraSocial;
        }

        const pacienteSave: IPacienteBasico = {
            id: this.paciente.id,
            documento: this.paciente.documento,
            alias: this.paciente.alias,
            numeroIdentificacion: this.paciente.numeroIdentificacion,
            genero: this.paciente.genero,
            apellido: this.paciente.apellido,
            nombre: this.paciente.nombre,
            fechaNacimiento: this.paciente.fechaNacimiento,
            sexo: this.paciente.sexo,
            telefono: this.telefono,
            carpetaEfectores: this.paciente.carpetaEfectores,
            obraSocial: osPaciente
        };

        // Si cambió el teléfono lo actualizo en el MPI
        // Pero si borra, no actualiza en MPI.
        if (this.cambioTelefono && this.telefono) {
            const nuevoCel = {
                'tipo': 'celular',
                'valor': this.telefono,
                'ranking': 1,
                'activo': true,
                'ultimaActualizacion': moment().toDate()
            };
            let flagTelefono = false;
            // Si tiene un celular en ranking 1 y activo cargado, se reemplaza el nro
            // sino, se genera un nuevo contacto
            if (this.paciente.contacto.length) {
                this.paciente.contacto.forEach((contacto, index) => {
                    if (contacto.tipo === 'celular') {
                        contacto.valor = this.telefono;
                        flagTelefono = true;
                    }
                });
                if (!flagTelefono) {
                    this.paciente.contacto.push(nuevoCel);
                }
            } else {
                this.paciente.contacto = [nuevoCel];
            }
            const cambios = {
                'op': 'updateContactos',
                'contacto': this.paciente.contacto
            };
            this.servicePaciente.patch(pacienteSave.id, cambios).subscribe();
        }

        const patch = {
            'op': 'agregarSobreturno',
            'sobreturno': {
                horaInicio: this.combinarFechas(this.agenda.horaInicio, this.horaTurno),
                link: this.turno_link,
                estado: 'asignado',
                tipoPrestacion: this.tipoPrestacion,
                paciente: pacienteSave,
                nota: this.nota
            }
        };
        this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {
            if (this.changeCarpeta) {
                this.actualizarCarpetaPaciente();
            }

            this.sobreturno = resultado.sobreturnos.slice(-1)[0];
            this.plex.toast('success', 'El sobreturno se asignó correctamente.');
            this.volver.emit();
        });
    }

    combinarFechas(fecha1, fecha2) {
        if (fecha1 && fecha2) {
            const auxiliar = moment(fecha1).toDate();
            const horas = fecha2.getHours();
            const minutes = fecha2.getMinutes();
            auxiliar.setHours(horas, minutes, 0, 0);
            return auxiliar;
        } else {
            return null;
        }
    }

    verificarNota() {
        if (this.nota && this.nota.length > this.lenNota) {
            this.nota = this.nota.substring(0, this.lenNota);
        }
    }

    public aceptar() {
        this.modal.close();
        this.volver.emit();
    }

    public cancelar() {
        this.volver.emit();
    }

    public getEquipoProfesional() {
        let equipo = '';
        this.agenda?.profesionales?.forEach((profesional) => {
            equipo += `${profesional.nombre} ${profesional.apellido}, `;
        });

        return equipo === '' ? '-' : equipo.slice(0, -2);
    }
}
