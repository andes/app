import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plex } from '@andes/plex';
import { ProfesionalService } from '../../../../services/profesional.service';
import { OcupacionService } from '../../../../services/ocupacion/ocupacion.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { SnomedExpression } from '../../../mitos';
import { IPrestacionRegistro } from '../../../../modules/rup/interfaces/prestacion.registro.interface';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { MapaCamasService } from '../mapa-camas.service';
import { snomedIngreso, pacienteAsociado, origenHospitalizacion, nivelesInstruccion, situacionesLaborales, modelInformeIngreso } from '../constantes-internacion';

@Component({
    selector: 'app-ingresar-paciente',
    templateUrl: './ingresar-paciente.component.html',
})

export class IngresarPacienteComponent implements OnInit {

    // EVENTOS
    @Input() fecha: Date;
    @Input() selectedCama: any;
    @Input() camas: any;

    @Output() cancel = new EventEmitter<any>();
    @Output() cambiarFecha = new EventEmitter<any>();
    @Output() cambiarCama = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<any>();

    // CONSTANTES
    public pacienteAsociado = pacienteAsociado;
    public origenHospitalizacion = origenHospitalizacion;
    public nivelesInstruccion = nivelesInstruccion;
    public situacionesLaborales = situacionesLaborales;

    // VARIABLES
    public ambito = 'internacion';
    public capa: string;

    public expr = SnomedExpression;
    public fechaValida = true;

    public pacientes = [];
    public paciente: any;
    public obraSocial: any;
    public origenExterno = false;
    public datosBasicos = false;

    public informeIngreso = modelInformeIngreso;

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
        this.cambiarCama.emit(this.selectedCama);
    }

    toggleDatos() {
        this.datosBasicos = !this.datosBasicos;
    }

    calcularEdad(fechaNacimiento: Date, fechaCalculo: Date): any {
        let edad: any;
        let fechaNac: any;
        let fechaActual: Date = fechaCalculo ? fechaCalculo : new Date();
        let fechaAct: any;
        let difAnios: any;
        let difDias: any;
        let difMeses: any;
        let difD: any;
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

    cambiarPaciente() {
        this.paciente = null;
        this.datosBasicos = false;
    }

    guardar(valid) {
        if (valid.formValid) {
            let fechaIngreso = moment(this.fecha).toDate();

            // Verificamos si es de origen externo
            if (this.origenExterno) {
                this.informeIngreso.organizacionOrigen = {
                    id: this.informeIngreso.organizacionOrigen.id,
                    nombre: this.informeIngreso.organizacionOrigen.nombre
                };
            }

            // construimos el informe de ingreso
            this.informeIngreso.situacionLaboral = (this.informeIngreso.situacionLaboral) ? this.informeIngreso.situacionLaboral.nombre : null;
            this.informeIngreso.nivelInstruccion = (Object(this.informeIngreso.nivelInstruccion).nombre);
            this.informeIngreso.asociado = (Object(this.informeIngreso.asociado).nombre);
            this.informeIngreso.origen = (Object(this.informeIngreso.origen).nombre);
            this.informeIngreso.PaseAunidadOrganizativa = this.informeIngreso.PaseAunidadOrganizativa;
            this.informeIngreso.fechaIngreso = fechaIngreso;
            if (this.paciente.fechaNacimiento) {
                this.informeIngreso.edadAlIngreso = this.calcularEdad(this.paciente.fechaNacimiento, this.informeIngreso.fechaIngreso);

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

            if (this.selectedCama.idInternacion) {
                // console.log(this.selectedCama);
            } else {
                this.guardarPrestacion(dtoPaciente);
            }
        }
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
            if (this.selectedCama) {
                // Se modifica el estado de la cama
                this.selectedCama.estado = 'ocupada';
                this.selectedCama.idInternacion = prestacion.id;
                this.selectedCama.paciente = paciente;

                this.mapaCamasService.patchCama(this.selectedCama, this.ambito, this.capa, this.fecha).subscribe(camaActualizada => {
                    this.plex.info('success', 'Paciente internado');
                    this.refresh.emit({ cama: this.selectedCama, accion: 'internarPaciente' });
                }, (err1) => {
                    this.plex.info('danger', err1, 'Error al intentar ocupar la cama');
                });
            } else if (this.capa === 'estadistica') {
                this.plex.info('warning', 'Paciente ingresado a lista de espera');
                this.refresh.emit({ cama: this.selectedCama, accion: 'listaDeEspera' });
            }

        }, (err) => {
            this.plex.info('danger', 'ERROR: La prestación no pudo ser registrada');
        });
    }
}
