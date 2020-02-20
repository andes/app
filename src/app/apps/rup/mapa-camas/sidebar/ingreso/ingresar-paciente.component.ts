import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Plex } from '@andes/plex';
import { ProfesionalService } from '../../../../../services/profesional.service';
import { OcupacionService } from '../../../../../services/ocupacion/ocupacion.service';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { SnomedExpression } from '../../../../mitos';
import { IPrestacionRegistro } from '../../../../../modules/rup/interfaces/prestacion.registro.interface';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { snomedIngreso, pacienteAsociado, origenHospitalizacion, nivelesInstruccion, situacionesLaborales } from '../../constantes-internacion';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { combineLatest, Subscription } from 'rxjs';
import { ObraSocialService } from '../../../../../services/obraSocial.service';

@Component({
    selector: 'app-ingresar-paciente',
    templateUrl: './ingresar-paciente.component.html',
})

export class IngresarPacienteComponent implements OnInit, OnDestroy {

    // EVENTOS
    @Input() cama: ISnapshot;
    @Input() prestacion: IPrestacion;
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
    public expr = SnomedExpression;

    // VARIABLES
    public ambito: string;
    public capa: string;

    public fechaValida = true;

    public pacientes = [];

    camas = [];

    public get origenExterno() {
        return this.informeIngreso && this.informeIngreso.origen && this.informeIngreso.origen.id === 'traslado';
    }

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

    private subscription: Subscription;

    constructor(
        private plex: Plex,
        private servicioProfesional: ProfesionalService,
        private ocupacionService: OcupacionService,
        private organizacionService: OrganizacionService,
        private servicioPrestacion: PrestacionesService,
        private mapaCamasService: MapaCamasService,
        private obraSocialService: ObraSocialService,
    ) {
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngOnInit() {

        this.subscription = combineLatest(
            this.mapaCamasService.ambito2,
            this.mapaCamasService.capa2,
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.prestacion$
        ).subscribe(([ambito, capa, cama, prestacion]) => {
            this.ambito = ambito;
            this.capa = capa;
            this.cama = cama;
            this.prestacion = prestacion;
            if (this.prestacion) {
                this.paciente = this.prestacion.paciente;
                this.informeIngreso = this.prestacion.ejecucion.registros[0].valor.informeIngreso;

                if (this.paciente.documento) {
                    // Se busca la obra social del paciente y se le asigna
                    // this.obraSocialService.get({ dni: this.paciente.documento }).subscribe((os: any) => {
                    //     if (os && os.length > 0) {
                    //         this.obraSocial = { nombre: os[0].financiador, codigoFinanciador: os[0].codigoFinanciador };
                    //         this.informeIngreso.obraSocial = { nombre: os[0].financiador, codigoPuco: os[0].codigoFinanciador };
                    //     }
                    // });
                }

            }
        });

        // [TODO] Revisar
        // if (this.prestacion && !this.cama) {
        //     let fechaIngreso = this.prestacion.ejecucion.registros[0].valor.informeIngreso.fechaIngreso;
        //     this.informeIngreso = this.prestacion.ejecucion.registros[0].valor.informeIngreso;
        //     this.mapaCamasService.snapshot(fechaIngreso, this.prestacion.id).subscribe((cama: ISnapshot[]) => {
        //         this.cama = cama[0];
        //     });
        // }
    }

    cancelar() {
        if (!this.prestacion && this.paciente) {
            this.paciente = null;
        } else {
            this.cancel.emit();
        }
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
        if (event && event.query) {
            const query = {
                nombre: event.query
            };
            this.ocupacionService.getParams(query).subscribe((rta) => {
                return event.callback(rta);
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
        if (event.value && event.value.id) {
            this.informeIngreso.organizacionOrigen = null;
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

    guardar(valid) {
        if (valid.formValid) {
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

            if (this.capa === 'estadistica') {
                this.ingresoExtendido(dtoPaciente);
            } else {
                this.ingresoSimplificado('ocupada', dtoPaciente, null);
            }
        }
    }

    ingresoSimplificado(estado, paciente, idInternacion = null) {
        // Se modifica el estado de la cama
        this.cama.estado = estado;
        this.cama.paciente = paciente;
        if (idInternacion) {
            this.cama.idInternacion = idInternacion;
        } else {
            this.cama.idInternacion = String((m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
                s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h)));
        }

        this.mapaCamasService.save(this.cama, this.informeIngreso.fechaIngreso).subscribe(camaActualizada => {
            this.plex.info('success', 'Paciente internado');
            this.refresh.emit({ cama: this.cama, accion: 'internarPaciente' });
        }, (err1) => {
            this.plex.info('danger', err1, 'Error al intentar ocupar la cama');
        });
    }

    ingresoExtendido(paciente) {
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

        if (this.prestacion) {
            this.actualizarPrestacion(paciente);
        } else {
            this.crearPrestacion(paciente);
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
        this.servicioPrestacion.patch(this.prestacion.id, cambios).subscribe((prestacion: any) => {
            this.informeIngreso = prestacion.ejecucion.registros[0].valor.informeIngreso;
            this.ingresoSimplificado('ocupada', paciente, prestacion._id);
        }, (err) => {
            this.plex.info('danger', err);
        });
    }

    crearPrestacion(paciente) {
        // armamos el elemento data a agregar al array de registros
        const nuevoRegistro = new IPrestacionRegistro(null, snomedIngreso);

        nuevoRegistro.valor = {
            informeIngreso: this.informeIngreso
        };

        // armamos dto con datos principales del profesional
        const dtoProfesional = {
            id: this.informeIngreso.profesional.id,
            documento: this.informeIngreso.profesional.documento,
            nombre: this.informeIngreso.profesional.nombre,
            apellido: this.informeIngreso.profesional.apellido
        };

        // creamos la prestacion de internacion y agregamos el registro de ingreso
        const nuevaPrestacion = this.servicioPrestacion.inicializarPrestacion(this.paciente, PrestacionesService.InternacionPrestacion, 'ejecucion', 'internacion', this.informeIngreso.fechaIngreso, null, dtoProfesional);
        nuevaPrestacion.ejecucion.registros = [nuevoRegistro];
        nuevaPrestacion.paciente['_id'] = this.paciente.id;

        // [TODO] Revisar donde iría. Seguramente va en el paciente.
        // if (this.informeIngreso.obraSocial) {
        //     nuevaPrestacion.solicitud.obraSocial = { codigoPuco: this.obraSocial.codigoFinanciador, nombre: this.obraSocial.nombre };
        // }

        this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
            if (this.cama) {
                this.ingresoSimplificado('ocupada', paciente, prestacion.id);
            } else if (this.capa === 'estadistica') {
                this.plex.info('warning', 'Paciente ingresado a lista de espera');
                this.refresh.emit({ cama: this.cama, accion: 'listaDeEspera' });
            }

        }, (err) => {
            this.plex.info('danger', 'ERROR: La prestación no pudo ser registrada');
        });
    }
}
