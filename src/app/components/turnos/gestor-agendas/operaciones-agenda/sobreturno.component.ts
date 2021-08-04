import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { Observable } from 'rxjs';
import { ITipoPrestacion } from './../../../../interfaces/ITipoPrestacion';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { AgendaService } from '../../../../services/turnos/agenda.service';
import { PacienteCacheService } from '../../../../core/mpi/services/pacienteCache.service';
import { ObraSocialService } from './../../../../services/obraSocial.service';
import { CarpetaPacienteService } from 'src/app/core/mpi/services/carpeta-paciente.service';

@Component({
    selector: 'sobreturno',
    templateUrl: 'sobreturno.html'
})

export class AgregarSobreturnoComponent implements OnInit {
    public nota: any;
    public lenNota = 140;
    public changeCarpeta: boolean;
    public carpetaEfector: any;
    public _revision: any = localStorage.getItem('revision') ? true : false;
    public _agenda;
    public agenda;
    public loading = false;
    public resultadoBusqueda: IPaciente[] = [];
    public paciente: IPaciente;
    public tipoPrestacion: ITipoPrestacion;
    public resultado: any;
    public showCreateUpdate = false;
    public showSobreturno = true;
    public pacientesSearch = false;
    public horaTurno = null;
    public telefono = '';
    public cambioTelefono = false;
    public pacientes: any;
    public obraSocialPaciente: any[] = [];
    public prepagas: any[] = [];
    showListaPrepagas: Boolean = false;
    public seleccion = null;
    public esEscaneado = false;
    public hoy = new Date();
    public inicio: Date;
    public fin: Date;
    public modelo: any = {
        obraSocial: '',
        prepaga: ''
    };

    constructor(
        private pacienteCache: PacienteCacheService,
        private plex: Plex,
        private serviceAgenda: AgendaService,
        private router: Router,
        private auth: Auth,
        private servicePaciente: PacienteService,
        private serviceCarpetaPaciente: CarpetaPacienteService,
        public obraSocialService: ObraSocialService,
        private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params && params['idAgenda']) {
                this.serviceAgenda.getById(params['idAgenda']).subscribe(agenda => {
                    this._agenda = agenda;
                    this.agenda = agenda;
                    this.inicio = new Date(this.hoy.setHours(this.agenda.horaInicio.getHours(), this.agenda.horaInicio.getMinutes(), 0, 0));
                    this.fin = new Date(this.hoy.setHours(this.agenda.horaFin.getHours(), this.agenda.horaFin.getMinutes(), 0, 0));
                    if (this.agenda.tipoPrestaciones.length === 1) {
                        this.tipoPrestacion = this.agenda.tipoPrestaciones[0];
                    }
                });
            }
        });

        this.carpetaEfector = {
            organizacion: {
                _id: this.auth.organizacion.id,
                nombre: this.auth.organizacion.nombre
            },
            nroCarpeta: ''
        };
        this.showSobreturno = false;
        this.pacientesSearch = true;
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
        this.esEscaneado = false;
        this.paciente = null;
        this.loading = true;
    }

    onSearchEnd(pacientes: IPaciente[], scan: string) {
        this.loading = false;
        this.esEscaneado = scan?.length > 0;
        if (this.esEscaneado && pacientes.length === 1 && pacientes[0].id) {
            this.pacienteCache.setScanCode(scan);
            this.onSelect(pacientes[0]);
        } else if (this.esEscaneado && pacientes.length === 1 && (!pacientes[0].id || (pacientes[0].estado === 'temporal' && pacientes[0].scan))) {
            this.pacienteCache.setPaciente(pacientes[0]);
            this.pacienteCache.setScanCode(scan);
            this.router.navigate(['/apps/mpi/paciente/con-dni/sobreturno']);  // abre paciente-cru
        } else {
            this.pacientes = pacientes;
        }
    }

    onSearchClear() {
        this.resultadoBusqueda = [];
        this.paciente = null;
    }

    onSelect(paciente: any): void {
        // Si se seleccionó por error un paciente fallecido
        this.servicePaciente.checkFallecido(paciente);
        this.servicePaciente.getById(paciente.id).subscribe(
            pacienteMPI => {
                this.paciente = pacienteMPI;
                this.verificarTelefono(this.paciente);
                this.obtenerCarpetaPaciente();
                this.showSobreturno = true;
                this.pacientesSearch = false;

                this.loadObraSocial(this.paciente);
            });

    }

    loadObraSocial(paciente) {
        // TODO: si es en colegio médico hay que buscar en el paciente
        if (!paciente || !paciente.documento) {
            return;
        }
        this.obraSocialService.getObrasSociales(paciente.documento).subscribe(resultado => {
            if (resultado.length) {
                this.obraSocialPaciente = resultado.map((os: any) => {
                    let osPaciente;

                    if (os.nombre) {
                        osPaciente = {
                            'id': os.nombre,
                            'label': os.nombre
                        };
                    } else {
                        osPaciente = {
                            'id': os.financiador,
                            'label': os.financiador
                        };
                    }
                    return osPaciente;
                });
                this.modelo.obraSocial = this.obraSocialPaciente[0].label;
            }
            this.obraSocialPaciente.push({ 'id': 'prepaga', 'label': 'Prepaga' });
        });
    }

    seleccionarObraSocial(event) {
        if (event.value === 'prepaga') {
            this.obraSocialService.getPrepagas().subscribe(prepagas => {
                this.showListaPrepagas = true;
                this.prepagas = prepagas;
            });
        } else {
            this.showListaPrepagas = false;
        }
        this.modelo.obraSocial = event && event.value;
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
            this.serviceCarpetaPaciente.getNroCarpeta({ documento: this.paciente.documento, organizacion: this.auth.organizacion.id }).subscribe(carpeta => {
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

            let osPaciente: any;
            if (this.modelo.obraSocial === 'prepaga') {
                osPaciente = this.modelo.prepaga;
            } else if (this.modelo.obraSocial === 'SUMAR') {
                osPaciente = {
                    codigoPuco: null,
                    financiador: 'SUMAR',
                    nombre: null
                };
            } else {
                osPaciente = this.paciente.financiador && this.paciente.financiador.find((os) => os.nombre === this.modelo.obraSocial);
            }
            let pacienteSave = {
                id: this.paciente.id,
                documento: this.paciente.documento,
                apellido: this.paciente.apellido,
                nombre: this.paciente.nombre,
                fechaNacimiento: this.paciente.fechaNacimiento,
                sexo: this.paciente.sexo,
                telefono: this.telefono,
                carpetaEfectores: this.paciente.carpetaEfectores,
                obraSocial: osPaciente
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
                this.volver();
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

    volver() {
        if (this._revision) {
            this.router.navigate(['citas/revision_agenda', this.agenda.id]);
        } else {
            this.router.navigate(['citas/gestor_agendas']);
        }
    }
}
