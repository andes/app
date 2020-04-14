import { Component, Output, Input, EventEmitter, OnInit, HostBinding, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { ProcedimientosQuirurgicosService } from '../../../../services/procedimientosQuirurgicos.service';
import { Cie10Service } from '../../../mitos';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { InternacionService } from '../services/internacion.service';
import * as moment from 'moment';

import { CamasService } from '../services/camas.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'rup-egresoInternacion',
    templateUrl: 'egresoInternacion.html'
})
export class EgresoInternacionComponent implements OnInit, OnChanges {
    @HostBinding('class.plex-layout') layout = true;

    @Input() desdeListadoInternacion = false;
    public registro;

    private _prestacion: any;
    @Input()
    set prestacion(value: any) {
        this._prestacion = value;
        let existeRegistro = this.prestacion.ejecucion.registros.find(r => r.concepto.conceptId === this.internacionService.conceptosInternacion.egreso.conceptId);
        if (existeRegistro) {
            this.registro = existeRegistro;
        } else {
            this.fechaEgreso = new Date();
            this.horaEgreso = new Date();
            this.registro = {
                destacado: false,
                esSolicitud: false,
                esDiagnosticoPrincipal: false,
                esPrimeraVez: undefined,
                relacionadoCon: [],
                nombre: 'alta del paciente',
                concepto: this.internacionService.conceptosInternacion.egreso,
                valor: {
                    InformeEgreso: {
                        fechaEgreso: null,
                        nacimientos: [
                            {
                                pesoAlNacer: null,
                                condicionAlNacer: null,
                                terminacion: null,
                                sexo: null
                            }
                        ],
                        procedimientosQuirurgicos: [],
                        causaExterna: {
                            producidaPor: null,
                            lugar: null,
                            comoSeProdujo: null
                        }
                    }
                }
            };
        }
    }
    get prestacion(): any {
        return this._prestacion;
    }
    @Input() camaSelected;
    @Input() soloValores;
    // botonera, input para pasarle por parametro si mostramos o no el btn cerrar o guardar.
    @Input() botonera;
    @Input() cama;

    @Output() data: EventEmitter<any> = new EventEmitter<any>();
    @Output() btnIniciarEditarEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() prestacionGuardada: EventEmitter<any> = new EventEmitter<any>();
    @Output() desocuparCama: EventEmitter<any> = new EventEmitter<any>();

    public ultimoPase;
    public fechaDeingreso;
    public fechaEgreso: Date = new Date();
    public horaEgreso: Date = new Date();
    public listaUnidadesOrganizativas: any[];
    public copiaListaUnidadesOrganizativas = [];
    public listaProcedimientosQuirurgicos: any[];
    public listaTipoEgreso = [{ id: 'Alta médica', nombre: 'Alta médica' }, { id: 'Defunción', nombre: 'Defunción' },
    { id: 'Traslado', nombre: 'Traslado' }, { id: 'Retiro Voluntario', nombre: 'Retiro Voluntario' }, { id: 'Otro', nombre: 'Otro' }];
    public causaExterna = {
        producidaPor: [{ id: 'Accidente', nombre: 'Accidente' }, { id: 'lesionAutoinfligida', nombre: 'Lesión autoinflingida' },
        { id: 'agresion', nombre: 'Agresión' }, { id: 'seIgnora', nombre: 'Se ignora' }
        ],
        lugar: [{ id: 'domicilioParticular', nombre: 'Domicilio Particular' }, { id: 'viaPublico', nombre: 'Vía pública' },
        { id: 'lugarDetrabajo', nombre: 'Lugar de trabajo' }, { id: 'otro', nombre: 'otro' }, { id: 'seIgnora', nombre: 'Se ignora' }
        ]
    };
    public opcionesTipoParto = [{ id: 'Simple', label: 'Simple' }, { id: 'Multiple', label: 'Multiple' }];
    public opcionesCondicionAlNacer = [{ id: 'Nac. Vivo', label: 'Nac. Vivo' }, { id: 'Def. fetal', label: 'Def. fetal' }];
    public opcionesTerminacion = [{ id: 'Vaginal', label: 'Vaginal' }, { id: 'Cesária', label: 'Cesária' }];
    public opcionesSexo = [{ id: 'Femenino', label: 'Femenino' }, { id: 'Masculino', label: 'Masculino' }, { id: 'Indeterminado', label: 'Indeterminado' }];


    public opcionPrimeraVez = [
        { id: true, label: 'Si' },
        { id: false, label: 'No' }
    ];
    public procedimientosObstetricos = false;
    public procedimientosObstetricosNoReq = false;
    public ExisteCausaExterna = false;
    public mostrarValidacion = false;

    public listaPasesCama = [];
    mySubject = new Subject();
    constructor(
        public servicioPrestacion: PrestacionesService,
        public procedimientosQuirurgicosService: ProcedimientosQuirurgicosService,
        public cie10Service: Cie10Service,
        private route: ActivatedRoute,
        private location: Location,
        public plex: Plex,
        public servicioOrganizacion: OrganizacionService,
        public internacionService: InternacionService,
        public camasService: CamasService,

    ) {
        this.mySubject
            .pipe(debounceTime(1000))
            .subscribe(val => {
                this.calcularDiasEstada();
            });
    }

    ngOnInit() {
        // this.iniciaBotonera();
        // Buscamos si la prestacion ya tiene una informe del alta guardado.
        if (this.prestacion && this.prestacion.id) {
            this.servicioPrestacion.getPasesInternacion(this.prestacion.id).subscribe(lista => {
                this.listaPasesCama = lista;
            });
        }

    }

    ngOnChanges(changes: any) {
        if (!this.registro.valor) {
            this.btnIniciarEditarEmit.emit('Iniciar');
            this.fechaEgreso = new Date();
            this.horaEgreso = new Date();
            this.registro.valor = {
                InformeEgreso: {
                    fechaEgreso: null,
                    nacimientos: [
                        {
                            pesoAlNacer: null,
                            condicionAlNacer: null,
                            terminacion: null,
                            sexo: null
                        }
                    ],
                    procedimientosQuirurgicos: [
                        {
                            procedimiento: null,
                            fecha: null
                        }
                    ],
                    causaExterna: {
                        producidaPor: null,
                        lugar: null,
                        comoSeProdujo: null
                    }
                }
            };
            this.showProcedimientos_causas();
        } else {
            let fechaRegistrada = this.registro.valor.InformeEgreso.fechaEgreso ? new Date(this.registro.valor.InformeEgreso.fechaEgreso) : null;
            if (fechaRegistrada) {
                this.fechaEgreso = fechaRegistrada;
                this.horaEgreso = fechaRegistrada;
            }
            this.showProcedimientos_causas();
            this.btnIniciarEditarEmit.emit('Editar');
        }

        this.calcularDiasEstada();
    }

    /**
     * Buscar organizaciones
     */
    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(event.callback);
        } else {
            let organizacionSalida = [];
            if (this.registro.valor.InformeEgreso.UnidadOrganizativaDestino && this.registro.valor.InformeEgreso.UnidadOrganizativaDestino.organizacionOrigen) {
                organizacionSalida = [this.registro.valor.InformeEgreso.UnidadOrganizativaDestino.organizacionOrigen];
            }
            event.callback(organizacionSalida);
        }
    }

    /**
     * Inicia la visualizacion de los botones por defecto en true
     */
    iniciaBotonera() {
        if (this.botonera) {
            this.botonera.cerrar = (this.botonera && this.botonera.cerrar) ? this.botonera.cerrar : true;
            this.botonera.guardar = (this.botonera && this.botonera.guardar) ? this.botonera.guardar : true;
            this.botonera.validar = (this.botonera && this.botonera.validar) ? this.botonera.validar : true;
        }

    }
    /**
     * Captura el evento del select y busca el codigo CIE10
     * @param event
*/

    getListaProcedimientosQuirurgicos(event) {
        if (event && event.query) {
            let query = {
                nombre: event.query

            };
            this.procedimientosQuirurgicosService.get(query).subscribe((rta) => {
                rta.map(dato => { dato.nom = '(' + dato.codigo + ') ' + dato.nombre; });
                event.callback(rta);
            });

        } else {
            let procedimientoQuirurgico = [];
            if (this.registro.valor.InformeEgreso.procedimientosQuirurgicos) {
                procedimientoQuirurgico = [this.registro.valor.InformeEgreso.procedimientosQuirurgicos];
            }
            event.callback(procedimientoQuirurgico);
        }
    }
    codigoCIE10(event) {
        if (event && event.query) {
            let query = {
                nombre: event.query
            };
            this.cie10Service.get(query).subscribe((datos) => {
                // mapeamos para mostrar el codigo primero y luego la descripcion
                datos.map(dato => { dato.nombre = '(' + dato.codigo + ') ' + dato.nombre; });
                event.callback(datos);
            });

        } else {
            let callback = [];
            if (this.registro.valor.InformeEgreso.diagnosticoPrincipal) {
                callback.push(this.registro.valor.InformeEgreso.diagnosticoPrincipal);
            }
            if (this.registro.valor.InformeEgreso.otrosDiagnosticos) {

                callback.push(this.registro.valor.InformeEgreso.otrosDiagnosticos);

            }
            if (this.registro.valor.InformeEgreso.causaExterna && this.registro.valor.InformeEgreso.causaExterna.comoSeProdujo) {
                callback.push(this.registro.valor.InformeEgreso.causaExterna.comoSeProdujo);
            }
            event.callback(callback);
        }
    }

    addNacimiento() {
        let nuevoNacimiento = Object.assign({}, {
            pesoAlNacer: null,
            condicionAlNacer: null,
            terminacion: null,
            sexo: null
        });
        this.registro.valor.InformeEgreso.nacimientos.push(nuevoNacimiento);
    }

    removeNacimiento(i) {
        if (i > 0) {
            this.registro.valor.InformeEgreso.nacimientos.splice(i, 1);
        }
    }


    addProcedimientoQuirurgico() {
        let nuevoProcedimiento = Object.assign({}, {
            fecha: null
        });
        this.registro.valor.InformeEgreso.procedimientosQuirurgicos.push(nuevoProcedimiento);
    }

    removeProcedimiento(i) {
        if (i > 0) {
            this.registro.valor.InformeEgreso.procedimientosQuirurgicos.splice(i, 1);
        }
    }


    /**
     * Emite un false para ocultar el componente
     */
    cancelar() {
        this.data.emit(false);
    }

    controlRegistrosGuardar() {
        let registros = JSON.parse(JSON.stringify(this.prestacion.ejecucion.registros));
        this.registro.valor.InformeEgreso.fechaEgreso = this.internacionService.combinarFechas(this.fechaEgreso, this.horaEgreso);
        if (this.registro.valor.InformeEgreso.diagnosticoPrincipal) {
            this.registro.esDiagnosticoPrincipal = true;
        }

        if (this.registro.valor.InformeEgreso.UnidadOrganizativaDestino) {
            let datosOrganizacionDestino = {
                id: this.registro.valor.InformeEgreso.UnidadOrganizativaDestino.id,
                nombre: this.registro.valor.InformeEgreso.UnidadOrganizativaDestino.nombre
            };
            this.registro.valor.InformeEgreso.UnidadOrganizativaDestino = datosOrganizacionDestino;
        }

        let existeEgreso = this.internacionService.verRegistro(this.prestacion, 'egreso');
        if (!existeEgreso) {
            registros.push(this.registro);
        } else {
            let indexRegistro = registros.findIndex(registro => registro.concepto.conceptId === this.internacionService.conceptosInternacion.egreso.conceptId);
            registros[indexRegistro] = this.registro;
        }


        return registros;
    }

    controlarConflictosInternacion(fechaEgreso: Date): boolean {
        const fechaActual = new Date();
        let ingreso = this.internacionService.verRegistro(this.prestacion, 'ingreso');
        // vamos a controlar que la fecha de egreso sea anterior a la fecha de ingreso
        if (fechaEgreso > fechaActual || ingreso.informeIngreso.fechaIngreso > fechaEgreso) {
            this.plex.info('danger', 'ERROR: La fecha de egreso no puede ser inferior a la fecha de ingreso o superior a la fecha actual');
            return null;
        }
        if (this.listaPasesCama && this.listaPasesCama.length > 1) {
            this.ultimoPase = this.listaPasesCama[this.listaPasesCama.length - 1];
            if (fechaEgreso < this.ultimoPase.estados.fecha) {
                this.plex.info('warning', 'La fecha de egreso no puede ser inferior a la fecha del ultimo movimiento');
                return false;
            }
        }
        return true;
    }

    /**
     * Guardamos la prestacion y retornamos
     * al mapa de camas
     */
    guardarPrestacion(isvalid) {

        if (isvalid) {
            let fechaEgreso = this.internacionService.combinarFechas(this.fechaEgreso, this.horaEgreso);
            if (!this.controlarConflictosInternacion(fechaEgreso)) {
                return;
            }
            let registros = this.controlRegistrosGuardar();
            if (registros) {
                let params: any = {
                    op: 'registros',
                    registros: registros
                };
                this.servicioPrestacion.patch(this.prestacion.id, params).subscribe(prestacionEjecutada => {
                    this.prestacionGuardada.emit(prestacionEjecutada);
                    // this.desocuparCama.emit(prestacionEjecutada);
                    this.btnIniciarEditarEmit.emit('Editar');
                    this.plex.toast('success', 'Prestacion guardada correctamente', 'Prestacion guardada', 100);
                    this.cancelar();
                });
            }
        } else {
            this.plex.info('info', 'ERROR: Los datos de egreso no estan completos');
            return;
        }
    }

    /**
     * Guardamos y validamos  la prestacion y volvemos
     * al mapa de camas
     */
    validarPrestacion(isvalid) {


        if (isvalid) {
            this.plex.confirm('Luego de validar la prestación ya no podrá editarse.<br />¿Desea continuar?', 'Confirmar validación').then(validar => {
                if (!validar) {
                    return false;
                } else {
                    let registros = this.controlRegistrosGuardar();
                    this.prestacion.ejecucion.registros = registros;
                    let egresoExiste = this.internacionService.verRegistro(this.prestacion, 'egreso');
                    if (registros && egresoExiste.InformeEgreso.fechaEgreso && egresoExiste.InformeEgreso.tipoEgreso &&
                        egresoExiste.InformeEgreso.diagnosticoPrincipal) {
                        let planes = [];
                        this.servicioPrestacion.validarPrestacion(this.prestacion, planes).subscribe(prestacion => {
                            this.prestacion = prestacion;
                            if (this.camaSelected) {
                                this.prestacionGuardada.emit(prestacion);
                                this.btnIniciarEditarEmit.emit('Editar');
                                this.plex.info('success', 'Prestacion guardada correctamente', 'Prestacion guardada');
                                this.cancelar();
                            } else {
                                this.plex.info('success', 'Prestacion guardada correctamente', 'Prestacion guardada');
                                this.prestacionGuardada.emit(prestacion);
                                this.cancelar();
                            }
                        });
                    } else {
                        this.plex.info('danger', 'ERROR: Los datos de egreso no estan completos');
                        return;
                    }
                }
            });
        } else {
            this.plex.info('info', 'ERROR: Los datos de egreso no estan completos');

        }
    }


    /**
     * Cuando selecciona tipo de egreso
     * Se fija si es traslado y carga el select
     * de unidades organizativas
     */
    selecOrganizacionDestino() {
        if (this.registro.valor.InformeEgreso.tipoEgreso) {
            if (this.registro.valor.InformeEgreso.tipoEgreso.nombre === 'Traslado') {
                // nos fijamos si ya tenemos la info en la copia.
                if (this.copiaListaUnidadesOrganizativas.length) {
                    this.listaUnidadesOrganizativas = this.copiaListaUnidadesOrganizativas;
                } else {
                    let params;
                    this.servicioOrganizacion.get(params).subscribe(organizaciones => {
                        this.listaUnidadesOrganizativas = organizaciones;
                        // Dejamos una copia para no volver a llamar a la API.
                        this.copiaListaUnidadesOrganizativas = JSON.parse(JSON.stringify(this.listaUnidadesOrganizativas));
                    });
                }
            } else {
                this.listaUnidadesOrganizativas = [];
            }
        }

    }


    showProcedimientos_causas() {
        this.procedimientosObstetricos = false;
        this.procedimientosObstetricosNoReq = false;
        this.ExisteCausaExterna = false;
        this.registro.valor.InformeEgreso.nacimientos = [
            {
                pesoAlNacer: null,
                condicionAlNacer: null,
                terminacion: null,
                sexo: null
            }
        ];
        let regexCIECausasExternas = new RegExp('^S|^T');
        // let regexCIEProcedimientosQuirurgicos = new RegExp('^O8[0-4].[0-9]|O60.1|O60.2');
        let regexCIEProcedimientosObstetricos = new RegExp('^O8[0-4].[0-9]|O60.1|O60.2');
        let regexCIEProcedimientosObstetricosNoReq = new RegExp('^O0[0-6].[0-9]');
        // let codigosProcedimientos = ['O80.1', 'O80.8', 'O81.0', 'O81.2', 'O81.3', 'O81.5', 'O82.9', 'O82.2', 'O83.1',
        //     'O82.1', 'O83.4', 'O83.9', 'O83.2', 'O84.0', 'O84.2', 'O84.9', 'O80.9',
        //     'O81.4', 'O82.8', 'O83.3', 'O84.1', 'O80.0', 'O83.8', 'O84.8', 'O83.0',
        //     'O81.1', 'O82.0', 'O60.1', 'O60.2'];
        // let codigosObstetricos = ['O80.1', 'O80.8', 'O81.0', 'O81.2', 'O81.3', 'O81.5', 'O82.9', 'O82.2', 'O83.1',
        //     'O82.1', 'O83.4', 'O83.9', 'O83.2', 'O84.0', 'O84.2', 'O84.9', 'O80.9',
        //     'O81.4', 'O82.8', 'O83.3', 'O84.1', 'O80.0', 'O83.8', 'O84.8', 'O83.0',
        //     'O81.1', 'O82.0', 'O60.1', 'O60.2', 'O00.0', 'O00.1', 'O01.1', 'O02.0', 'O01.0', 'O00.2', 'O00.9', 'O00.8', 'O01.9',
        //     'O03.0', 'O02.1', 'O03.1', 'O03.2', 'O02.9', 'O03.3', 'O03.4', 'O03.6', 'O03.9',
        //     'O03.8', 'O03.5', 'O04.0', 'O03.7', 'O04.2', 'O04.4', 'O04.1', 'O04.5', 'O04.3',
        //     'O04.6', 'O04.8', 'O05.0', 'O05.2', 'O05.1', 'O04.9', 'O05.3', 'O05.4', 'O05.6',
        //     'O05.9', 'O05.8', 'O04.7', 'O05.5', 'O06.2', 'O06.4', 'O06.1', 'O06.3', 'O06.5',
        //     'O06.6', 'O06.8', 'O06.0', 'O06.9', 'O06.7', 'O05.7', 'O02.8'];

        if (this.registro.valor.InformeEgreso.diagnosticoPrincipal) {
            this.ExisteCausaExterna = regexCIECausasExternas.test(this.registro.valor.InformeEgreso.diagnosticoPrincipal.codigo);
        }

        if (this.registro.valor.InformeEgreso.otrosDiagnosticos) {
            let diagCausaExterna = this.registro.valor.InformeEgreso.otrosDiagnosticos.filter(d => regexCIECausasExternas.test(d.codigo));
            if (diagCausaExterna && diagCausaExterna.length > 0) {
                this.ExisteCausaExterna = true;
            }
        }

        if (this.registro.valor.InformeEgreso.diagnosticoPrincipal) {
            this.procedimientosObstetricos = regexCIEProcedimientosObstetricos.test(this.registro.valor.InformeEgreso.diagnosticoPrincipal.codigo);
            this.procedimientosObstetricosNoReq = regexCIEProcedimientosObstetricosNoReq.test(this.registro.valor.InformeEgreso.diagnosticoPrincipal.codigo);
        }

        if (this.registro.valor.InformeEgreso.otrosDiagnosticos) {
            let diagObstetitricos = this.registro.valor.InformeEgreso.otrosDiagnosticos.filter(d => regexCIEProcedimientosObstetricosNoReq.test(d.codigo));
            if (diagObstetitricos && diagObstetitricos.length > 0) {
                this.procedimientosObstetricosNoReq = true;
            }
        }

        if (this.registro.valor.InformeEgreso.otrosDiagnosticos) {
            let diagObstetitricosReq = this.registro.valor.InformeEgreso.otrosDiagnosticos.filter(d => regexCIEProcedimientosObstetricos.test(d.codigo));
            if (diagObstetitricosReq && diagObstetitricosReq.length > 0) {
                this.procedimientosObstetricos = true;
            }
        }



    }

    searchComoSeProdujo(event) {

        let desde = 'V00';
        let hasta = 'Y98';
        let filtro;

        if (this.registro.valor.InformeEgreso.causaExterna.producidaPor) {

            switch (this.registro.valor.InformeEgreso.causaExterna.producidaPor.id) {
                case 'Accidente':
                    filtro = [{ desde: 'V01', hasta: 'X59' }, { desde: 'Y35', hasta: 'Y98' }];
                    break;
                case 'lesionAutoinfligida':
                    filtro = [{ desde: 'X60', hasta: 'X84' }];
                    break;
                case 'agresion':
                    filtro = [{ desde: 'X85', hasta: 'Y09' }];
                    break;
                case 'seIgnora': {
                    filtro = [{ desde: 'Y10', hasta: 'Y34' }];
                    break;
                }
            }
        }
        if (event && event.query) {
            let query = {
                nombre: event.query,
                filtroRango: JSON.stringify(filtro)
            };
            this.cie10Service.get(query).subscribe((datos) => {
                // mapeamos para mostrar el codigo primero y luego la descripcion
                datos.map(dato => { dato.nombre = '(' + dato.codigo + ') ' + dato.nombre; });
                event.callback(datos);
            });
        }
        if (this.registro.valor.InformeEgreso.causaExterna.comoSeProdujo) {
            event.callback([this.registro.valor.InformeEgreso.causaExterna.comoSeProdujo]);
        } else {
            event.callback([]);
        }
    }

    /**
    * Al registrar la fecha de egreso se calculan los dias de estada
    *
    */
    calcularDiasEstada() {
        if (this.fechaEgreso && this.horaEgreso) {
            let fechaACargar = this.internacionService.combinarFechas(this.fechaEgreso, this.horaEgreso);
            // vamos a recuperara la fecha de ingreso de la prestacion
            let informeIngreso = this.internacionService.verRegistro(this.prestacion, 'ingreso');
            if (informeIngreso) {
                let fechaIngreso = moment(informeIngreso.informeIngreso.fechaIngreso);
                if (fechaIngreso) {
                    let fechaEgreso = moment(fechaACargar);
                    if ((fechaEgreso.diff(fechaIngreso) <= 0)) {
                        this.plex.info('danger', 'ERROR: La fecha de egreso no puede ser inferior a  ' + fechaIngreso.format('DD-MM-YYYY HH:mm'));
                        this.registro.valor.InformeEgreso.diasDeEstada = null;
                    } else {
                        if (this.camaSelected) {
                            let fechaUltimoEstado = moment(this.camaSelected.ultimoEstado.fecha, 'DD-MM-YYYY HH:mm');
                            if (fechaUltimoEstado && (fechaEgreso.diff(fechaUltimoEstado) <= 0)) {
                                this.plex.info('danger', 'ERROR: La fecha de egreso no puede ser inferior a ' + fechaUltimoEstado);
                                this.registro.valor.InformeEgreso.diasDeEstada = null;
                                return;
                            }
                        }
                        /*  Si la fecha de egreso es el mismo día del ingreso -> debe mostrar 1 día de estada
                            Si la fecha de egreso es al otro día del ingreso, no importa la hora -> debe mostrar 1 día de estada
                            Si la fecha de egreso es posterior a los dos casos anteriores -> debe mostrar la diferencia de días */
                        let dateDif = fechaEgreso.endOf('day').diff(fechaIngreso.startOf('day'), 'days');
                        let diasEstada = dateDif === 0 ? 1 : dateDif;
                        this.registro.valor.InformeEgreso.diasDeEstada = diasEstada;
                    }
                }
            }
        }
    }
}
