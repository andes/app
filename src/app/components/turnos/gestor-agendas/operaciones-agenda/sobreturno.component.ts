import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { Observable } from 'rxjs/Observable';
import { ITipoPrestacion } from './../../../../interfaces/ITipoPrestacion';
import { Component, Input, EventEmitter, Output, OnInit, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { PacienteCacheService } from '../../../../core/mpi/services/pacienteCache.service';
import { PreviousUrlService } from '../../../../services/previous-url.service';
import { ObraSocialCacheService } from '../../../../services/obraSocialCache.service';

@Component({
    selector: 'sobreturno',
    templateUrl: 'sobreturno.html'
})

export class AgregarSobreturnoComponent implements OnInit {
    public disableNuevoPaciente = true;
    public nota: any;
    public lenNota = 140;
    changeCarpeta: boolean;
    carpetaEfector: any;
    private _agenda: any;
    private _revision: any;

    loading = false;
    resultadoBusqueda: IPaciente[] = [];
    searchClear = true;    // True si el campo de búsqueda se encuentra vacío

    @HostBinding('class.plex-layout') layout = true;

    @Input('agenda')
    set agenda(value: any) {
        this._agenda = value;
    }
    get agenda(): any {
        return this._agenda;
    }

    @Input('revision')
    set revision(value: any) {
        this._revision = value;
    }
    get revision(): any {
        return this._revision;
    }

    @Output() volverAlGestor = new EventEmitter<boolean>();
    @Output() volverRevision = new EventEmitter<boolean>();
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();


    paciente: IPaciente;
    tipoPrestacion: ITipoPrestacion;
    resultado: any;
    showAgregarSobreturno = true;
    showCreateUpdate = false;
    showSobreturno = true;
    pacientesSearch = false;
    horaTurno = null;
    telefono = '';
    cambioTelefono = false;
    pacientes: any;

    public seleccion = null;
    public esEscaneado = false;
    hoy = new Date();
    inicio: Date;
    fin: Date;


    constructor(
        private previousUrlService: PreviousUrlService,
        private pacienteCache: PacienteCacheService,
        public plex: Plex,
        public serviceAgenda: AgendaService,
        public servicioTipoPrestacion: TipoPrestacionService,
        private router: Router,
        public auth: Auth,
        public servicePaciente: PacienteService,
        private obraSocialCacheService: ObraSocialCacheService) { }

    ngOnInit() {
        this.inicio = new Date(this.hoy.setHours(this.agenda.horaInicio.getHours(), this.agenda.horaInicio.getMinutes(), 0, 0));
        this.fin = new Date(this.hoy.setHours(this.agenda.horaFin.getHours(), this.agenda.horaFin.getMinutes(), 0, 0));

        this.carpetaEfector = {
            organizacion: {
                _id: this.auth.organizacion.id,
                nombre: this.auth.organizacion.nombre
            },
            nroCarpeta: ''
        };
        this.showSobreturno = false;
        this.pacientesSearch = true;
        if (this.agenda.tipoPrestaciones.length === 1) {
            this.tipoPrestacion = this.agenda.tipoPrestaciones[0];
        }
    }


    afterCreateUpdate(paciente) {
        this.showCreateUpdate = false;
        this.showSobreturno = true;
        if (paciente) {
            this.servicePaciente.getById(paciente.id).subscribe(
                pacienteMPI => {
                    this.paciente = pacienteMPI;
                    this.verificarTelefono(pacienteMPI);
                });
        } else {
            this.showSobreturno = false;
            this.pacientesSearch = true;
        }
    }

    // -------------- SOBRE BUSCADOR ----------------

    onSearchStart() {
        this.disableNuevoPaciente = false;
        this.esEscaneado = false;
        this.paciente = null;
        this.loading = true;
    }

    onSearchEnd(pacientes: IPaciente[], escaneado: boolean) {
        this.searchClear = false;
        this.loading = false;
        this.pacienteCache.setScanState(escaneado);
        if (escaneado && pacientes.length === 1 && pacientes[0].id) {
            this.onSelect(pacientes[0]);
        } else if (escaneado && pacientes.length === 1 && (!pacientes[0].id || (pacientes[0].estado === 'temporal' && pacientes[0].scan))) {
            this.pacienteCache.setPaciente(pacientes[0]);
            this.pacienteCache.setScanState(escaneado);
            this.previousUrlService.setUrl('citas/gestor_agendas');
            this.router.navigate(['apps/mpi/paciente']);  // abre paciente-cru
        } else {
            this.pacientes = pacientes;
        }
    }

    onSearchClear() {
        this.disableNuevoPaciente = true;
        this.searchClear = true;
        this.resultadoBusqueda = [];
        this.paciente = null;
    }

    onSelect(paciente: any): void {
        this.servicePaciente.getById(paciente.id).subscribe(
            pacienteMPI => {
                this.paciente = pacienteMPI;
                this.verificarTelefono(this.paciente);
                this.obtenerCarpetaPaciente();
                this.showSobreturno = true;
                this.pacientesSearch = false;
            });
    }
    // Operaciones con carpetaPaciente

    // Se busca el número de carpeta de la Historia Clínica en papel del paciente
    // a partir del documento y del efector
    obtenerCarpetaPaciente() {
        let indiceCarpeta = -1;
        if (this.paciente.carpetaEfectores.length > 0) {
            // Filtro por organizacion
            indiceCarpeta = this.paciente.carpetaEfectores.findIndex(x => x.organizacion.id === this.auth.organizacion.id);
            if (indiceCarpeta > -1) {
                this.carpetaEfector = this.paciente.carpetaEfectores[indiceCarpeta];
            }
        }
        if (indiceCarpeta === -1) {
            // Si no hay carpeta en el paciente MPI, buscamos la carpeta en colección carpetaPaciente, usando el nro. de documento
            this.servicePaciente.getNroCarpeta({ documento: this.paciente.documento, organizacion: this.auth.organizacion.id }).subscribe(carpeta => {
                if (carpeta.nroCarpeta) {
                    this.carpetaEfector.nroCarpeta = carpeta.nroCarpeta;
                    this.changeCarpeta = true;
                }
            });
        }
    }

    actualizarCarpetaPaciente() {
        this.servicePaciente.patch(this.paciente.id, { op: 'updateCarpetaEfectores', carpetaEfectores: this.paciente.carpetaEfectores }).subscribe(resultadoCarpeta => {
        });
    }

    // Se ejecuta al modificar el campo NroCarpeta
    cambiarCarpeta() {
        this.changeCarpeta = true;
    }

    //////


    verificarTelefono(paciente: IPaciente) {
        // se busca entre los contactos si tiene un celular
        this.telefono = '';
        this.cambioTelefono = false;
        if (paciente.contacto) {
            if (paciente.contacto.length > 0) {
                paciente.contacto.forEach((contacto) => {
                    if (contacto.tipo === 'celular') {
                        this.telefono = contacto.valor;
                    }
                });
            }
        }
    }

    guardar($event) {

        if ($event.formValid) {

            let indiceCarpeta = this.paciente.carpetaEfectores.findIndex(x => x.organizacion.id === this.auth.organizacion.id);
            if (indiceCarpeta > -1) {
                this.paciente.carpetaEfectores[indiceCarpeta] = this.carpetaEfector;
            } else {
                this.paciente.carpetaEfectores.push(this.carpetaEfector);
            }
            let pacienteSave = {
                id: this.paciente.id,
                documento: this.paciente.documento,
                apellido: this.paciente.apellido,
                nombre: this.paciente.nombre,
                fechaNacimiento: this.paciente.fechaNacimiento,
                sexo: this.paciente.sexo,
                telefono: this.telefono,
                carpetaEfectores: this.paciente.carpetaEfectores
            };
            // Si cambió el teléfono lo actualizo en el MPI
            if (this.cambioTelefono) {
                let nuevoCel = {
                    'tipo': 'celular',
                    'valor': this.telefono,
                    'ranking': 1,
                    'activo': true,
                    'ultimaActualizacion': new Date()
                };
                let mpi: Observable<any>;
                let flagTelefono = false;
                // Si tiene un celular en ranking 1 y activo cargado, se reemplaza el nro
                // sino, se genera un nuevo contacto
                if (this.paciente.contacto.length > 0) {
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
                let cambios = {
                    'op': 'updateContactos',
                    'contacto': this.paciente.contacto
                };
                mpi = this.servicePaciente.patch(pacienteSave.id, cambios);
                mpi.subscribe(resultado => {

                    if (resultado) {
                        this.plex.info('success', 'Se actualizó el numero de telefono');
                    }
                });
            }

            let patch = {
                'op': 'agregarSobreturno',
                'sobreturno': {
                    horaInicio: this.combinarFechas(this.agenda.horaInicio, this.horaTurno),
                    estado: 'asignado',
                    tipoPrestacion: this.tipoPrestacion,
                    paciente: pacienteSave,
                    nota: this.nota
                }
            };

            this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {
                this.plex.toast('success', 'Información', 'El sobreturno se guardó correctamente');
                if (this.changeCarpeta) {
                    this.actualizarCarpetaPaciente();
                }
                this.volverAlGestor.emit(this.agenda);
                this.volverRevision.emit(true);
            });
        } else {
            this.plex.info('warning', 'Debe completar los datos requeridos');
        }
    }

    combinarFechas(fecha1, fecha2) {
        if (fecha1 && fecha2) {
            let horas: number;
            let minutes: number;
            let auxiliar: Date;

            auxiliar = new Date(fecha1);
            horas = fecha2.getHours();
            minutes = fecha2.getMinutes();
            // Date.setHours(hour, min, sec, millisec)
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


    cancelar() {
        if (!this._revision) {
            this.volverAlGestor.emit(true);
        } else {
            this.volverRevision.emit(true);
        }
    }
}
