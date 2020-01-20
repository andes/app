import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plex } from '@andes/plex';
import { ProfesionalService } from '../../../../../services/profesional.service';
import { OcupacionService } from '../../../../../services/ocupacion/ocupacion.service';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { SnomedExpression } from '../../../../mitos';
import { IPrestacionRegistro } from '../../../../../modules/rup/interfaces/prestacion.registro.interface';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { MapaCamasService } from '../../mapa-camas.service';
import { snomedIngreso, pacienteAsociado, origenHospitalizacion, nivelesInstruccion, situacionesLaborales } from '../../constantes-internacion';

@Component({
    selector: 'app-ingresar-paciente',
    templateUrl: './ingresar-paciente.component.html',
})

export class IngresarPacienteComponent implements OnInit {

    // EVENTOS
    @Input() cama: any;
    @Input() camas: any;
    @Input() detalle = false;
    @Input() paciente = null;

    @Output() cancel = new EventEmitter<any>();
    @Output() cambiarFecha = new EventEmitter<any>();
    @Output() cambiarCama = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<any>();

    // CONSTANTES
    public pacienteAsociado = pacienteAsociado;
    public origenHospitalizacion = origenHospitalizacion;
    public nivelesInstruccion = nivelesInstruccion;
    public situacionesLaborales = situacionesLaborales;
    public snomedIngreso = snomedIngreso;

    // VARIABLES
    public ambito = 'internacion';
    public capa: string;

    public expr = SnomedExpression;
    public fechaValida = true;

    public pacientes = [];
    public obraSocial: any;
    public origenExterno = false;
    public datosBasicos = false;
    public prestacion;
    public informeIngreso = {
        fechaIngreso: new Date(),
        horaNacimiento: new Date(),
        edadAlIngreso: null,
        origen: null,
        ocupacionHabitual: null,
        situacionLaboral: null,
        nivelInstruccion: null,
        especialidades: [],
        asociado: null,
        obraSocial: null,
        nroCarpeta: null,
        motivo: null,
        organizacionOrigen: null,
        profesional: null,
        PaseAunidadOrganizativa: null
    };

    constructor(
        private plex: Plex,
        private route: ActivatedRoute,
        private servicioProfesional: ProfesionalService,
        private ocupacionService: OcupacionService,
        private organizacionService: OrganizacionService,
        private servicioPrestacion: PrestacionesService,
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.capa = params.get('capa');
        });

        if (this.cama.idInternacion) {
            this.servicioPrestacion.getById(this.cama.idInternacion).subscribe(prestacion => {
                this.prestacion = prestacion;
                this.informeIngreso = prestacion.ejecucion.registros[0].valor.informeIngreso;
            })
        } else {
            console.log(this.informeIngreso)
        }
    }

    cancelar() {
        this.cancel.emit();
    }

    onPacienteSelected(event) {
        this.paciente = event;
    }

    searchStart() {
        this.pacientes = null;
    }

    searchEnd(resultado: any) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.pacientes = resultado.pacientes;
        }
    }

    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                listaProfesionales = resultado;
                event.callback(listaProfesionales);

            });
        } else {
            event.callback(listaProfesionales);
        }
    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.organizacionService.get(query).subscribe(event.callback);
        } else {
            let organizacionSalida = [];
            if (this.informeIngreso && this.informeIngreso.organizacionOrigen) {
                organizacionSalida = [this.informeIngreso.organizacionOrigen];
            }
            event.callback(organizacionSalida);
        }
    }

    getOcupaciones(event) {
        let ocupacionesHabituales = [];
        if (event && event.query) {
            let query = {
                nombre: event.query
            };
            this.ocupacionService.getParams(query).subscribe((rta) => {
                rta.map(dato => { dato.nom = '(' + dato.codigo + ') ' + dato.nombre; });

                ocupacionesHabituales = rta;
                event.callback(ocupacionesHabituales);
            });
        } else {
            let ocupacionHabitual = [];
            if (this.informeIngreso.ocupacionHabitual) {
                ocupacionHabitual = [this.informeIngreso.ocupacionHabitual];
            }
            event.callback(ocupacionHabitual);
        }
    }

    changeOrigenHospitalizacion(event) {
        if (event.value) {
            if (event.value.id === 'traslado') {
                this.origenExterno = true;
            } else {
                this.origenExterno = false;
                this.informeIngreso.organizacionOrigen = null;
            }
        }
    }

    cambiarFechaIngreso(fecha) {
        if (fecha <= moment().toDate()) {
            this.fechaValida = true;
            this.cambiarFecha.emit(fecha);
        } else {
            this.fechaValida = false;
        }
    }

    cambiarSeleccionCama() {
        this.cambiarCama.emit(this.cama);
    }

    toggleDatos() {
        this.datosBasicos = !this.datosBasicos;
    }

    cambiarPaciente() {
        this.paciente = null;
        this.datosBasicos = false;
    }

    guardar(valid) {
        if (valid.formValid) {
            // Verificamos si es de origen externo
            if (this.origenExterno) {
                this.informeIngreso.organizacionOrigen = {
                    id: this.informeIngreso.organizacionOrigen.id,
                    nombre: this.informeIngreso.organizacionOrigen.nombre
                };
            }

            // construimos el informe de ingreso
            this.informeIngreso.situacionLaboral = (this.informeIngreso.situacionLaboral) ? this.informeIngreso.situacionLaboral.nombre : null;
            this.informeIngreso.nivelInstruccion = ((typeof this.informeIngreso.nivelInstruccion === 'string')) ? this.informeIngreso.nivelInstruccion : (Object(this.informeIngreso.nivelInstruccion).nombre);
            this.informeIngreso.asociado = ((typeof this.informeIngreso.asociado === 'string')) ? this.informeIngreso.asociado : (Object(this.informeIngreso.asociado).nombre);
            this.informeIngreso.origen = ((typeof this.informeIngreso.origen === 'string')) ? this.informeIngreso.origen : (Object(this.informeIngreso.origen).nombre);
            this.informeIngreso.PaseAunidadOrganizativa = this.informeIngreso.PaseAunidadOrganizativa;
            if (this.paciente.fechaNacimiento) {
                this.informeIngreso.edadAlIngreso = this.mapaCamasService.calcularEdad(this.paciente.fechaNacimiento, this.informeIngreso.fechaIngreso);

            }

            // armamos dto con datos principales del paciente
            let dtoPaciente = {
                id: this.paciente.id,
                documento: this.paciente.documento,
                nombre: this.paciente.nombre,
                apellido: this.paciente.apellido,
                sexo: this.paciente.sexo,
                genero: this.paciente.genero,
                fechaNacimiento: this.paciente.fechaNacimiento,
                direccion: this.paciente.direccion,
                telefono: this.paciente.telefono
            };

            if (this.prestacion) {
                this.actualizarPrestacion(dtoPaciente);
            } else {
                this.guardarPrestacion(dtoPaciente);
            }
        }
    }

    actualizarPrestacion(paciente) {
        // reemplazamos el Informe de ingreso en la prestacion
        let indexInforme = this.prestacion.ejecucion.registros.findIndex(r => r.concepto.conceptId === this.snomedIngreso.conceptId);
        this.prestacion.ejecucion.registros[indexInforme].valor = { informeIngreso: this.informeIngreso };
        let cambios = {
            op: 'registros',
            registros: this.prestacion.ejecucion.registros
        };
        this.servicioPrestacion.patch(this.prestacion.id, cambios).subscribe(p => {
            this.informeIngreso = p.ejecucion.registros[0].valor.informeIngreso;
            this.mapaCamasService.patchCama(this.cama, this.ambito, this.capa, this.informeIngreso.fechaIngreso).subscribe(camaActualizada => {
                this.cama.paciente = paciente;
                this.refresh.emit({ cama: this.cama, accion: 'internarPaciente' });
                this.plex.info('success', 'Ingreso editado!');
            }, (err1) => {
                this.plex.info('danger', err1, 'Error al intentar ocupar la cama');
            });
        }, (err) => {
            this.plex.info('danger', err);
        });
    }

    guardarPrestacion(paciente) {
        // armamos el elemento data a agregar al array de registros
        let nuevoRegistro = new IPrestacionRegistro(null, snomedIngreso);

        nuevoRegistro.valor = { informeIngreso: this.informeIngreso };

        // armamos dto con datos principales del profesional
        let dtoProfesional = {
            id: this.informeIngreso.profesional.id,
            documento: this.informeIngreso.profesional.documento,
            nombre: this.informeIngreso.profesional.nombre,
            apellido: this.informeIngreso.profesional.apellido
        };

        // creamos la prestacion de internacion y agregamos el registro de ingreso
        let nuevaPrestacion = this.servicioPrestacion.inicializarPrestacion(this.paciente, PrestacionesService.InternacionPrestacion, 'ejecucion', 'internacion', this.informeIngreso.fechaIngreso, null, dtoProfesional);
        nuevaPrestacion.ejecucion.registros = [nuevoRegistro];
        nuevaPrestacion.paciente['_id'] = this.paciente.id;

        if (this.obraSocial) {
            nuevaPrestacion.solicitud.obraSocial = { codigoPuco: this.obraSocial.codigoFinanciador, nombre: this.obraSocial.nombre };
        }

        this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
            if (this.cama) {
                // Se modifica el estado de la cama
                this.cama.estado = 'ocupada';
                this.cama.idInternacion = prestacion.id;
                this.cama.paciente = paciente;

                this.mapaCamasService.patchCama(this.cama, this.ambito, this.capa, this.informeIngreso.fechaIngreso).subscribe(camaActualizada => {
                    this.plex.info('success', 'Paciente internado');
                    this.refresh.emit({ cama: this.cama, accion: 'internarPaciente' });
                }, (err1) => {
                    this.plex.info('danger', err1, 'Error al intentar ocupar la cama');
                });
            } else if (this.capa === 'estadistica') {
                this.plex.info('warning', 'Paciente ingresado a lista de espera');
                this.refresh.emit({ cama: this.cama, accion: 'listaDeEspera' });
            }

        }, (err) => {
            this.plex.info('danger', 'ERROR: La prestación no pudo ser registrada');
        });
    }
}
