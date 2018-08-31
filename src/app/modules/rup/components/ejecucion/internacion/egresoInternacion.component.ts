import { Component, Output, Input, EventEmitter, OnInit, HostBinding, OnChanges } from '@angular/core';
import { ProcedimientosQuirurgicosService } from '../../../../../services/procedimientosQuirurgicos.service';
import { Cie10Service } from '../../../../../services/term/cie10.service';
import { Plex } from '@andes/plex';
import { PrestacionesService } from '../../../services/prestaciones.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { OrganizacionService } from '../../../../../services/organizacion.service';

@Component({
    selector: 'rup-egresoInternacion',
    templateUrl: 'egresoInternacion.html'
})
export class EgresoInternacionComponent implements OnInit, OnChanges {
    @HostBinding('class.plex-layout') layout = true;

    @Input() prestacion;
    @Input() soloValores;
    // botonera, input para pasarle por parametro si mostramos o no el btn cerrar o guardar.
    @Input() botonera;
    @Output() data: EventEmitter<any> = new EventEmitter<any>();
    @Output() btnIniciarEditarEmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() prestacionGuardada: EventEmitter<any> = new EventEmitter<any>();

    public listaUnidadesOrganizativas: any[];
    public copiaListaUnidadesOrganizativas = [];
    public listaProcedimientosQuirurgicos: any[];
    public listaTipoEgreso = [{ id: 'Alta médica', nombre: 'Alta médica' }, { id: 'Defunción', nombre: 'Defunción' },
    { id: 'Traslado', nombre: 'Traslado' }, { id: 'Retiro Voluntario', nombre: 'Retiro Voluntario' }, { id: 'Otro', nombre: 'Otro' }];
    public causaExterna = {
        producidaPor: [{ id: 'Alta médica', nombre: 'Accidente' }, { id: 'lesionAutoinfligida', nombre: 'Lesión autoinflingida' },
        { id: 'agresion', nombre: 'Agresión' }, { id: 'seIgnora', nombre: 'Se ignora' }
        ],
        lugar: [{ id: 'domicilioParticular', nombre: 'Domicilio Particular' }, { id: 'viaPublico', nombre: 'Vía pública' },
        { id: 'lugarDetrabajo', nombre: 'Lugar de trabajo' }, { id: 'otro', nombre: 'otro' }, { id: 'seIgnora', nombre: 'Se ignora' }
        ]
    };
    public procedimientosObstetricos = false;
    public ExisteCausaExterna = false;
    public registro = {
        destacado: false,
        esSolicitud: false,
        esDiagnosticoPrincipal: false,
        esPrimeraVez: false,
        relacionadoCon: [],
        nombre: 'alta del paciente',
        concepto: {
            conceptId: '58000006',
            term: 'alta del paciente',
            fsn: 'alta del paciente (procedimiento)',
            semanticTag: 'procedimiento'
        },
        valor: null
    };

    constructor(
        public servicioPrestacion: PrestacionesService,
        public procedimientosQuirurgicosService: ProcedimientosQuirurgicosService,
        public Cie10Service: Cie10Service,
        private route: ActivatedRoute,
        private location: Location,
        public plex: Plex,
        public servicioOrganizacion: OrganizacionService
    ) { }

    ngOnInit() {
        // this.iniciaBotonera();
        // Buscamos si la prestacion ya tiene una informe del alta guardado.
        let existeRegistro = this.prestacion.ejecucion.registros.find(r => r.concepto.conceptId === this.registro.concepto.conceptId);
        this.registro.valor = existeRegistro ? existeRegistro.valor : null;
        if (!this.registro.valor) {
            this.btnIniciarEditarEmit.emit('Iniciar');
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
            this.btnIniciarEditarEmit.emit('Editar');
        }

        let params;
        // // Cargamos todos los procedimientos.
        this.procedimientosQuirurgicosService.get(params).subscribe(rta => {
            this.listaProcedimientosQuirurgicos = rta.map(elem => {
                return { id: elem._id, nombre: elem.nombre };
            });
        });
    }

    ngOnChanges(changes: any) {
        // this.hayInformeEgreso = true;
        // this.soloValores = false;
    }

    /**
     * Inicia la visualizacion de los botones por defecto en true
     */
    iniciaBotonera() {
        // debugger;
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
    codigoCIE10(event) {
        if (event && event.query) {
            let query = {
                nombre: event.query
            };
            this.Cie10Service.get(query).subscribe((datos) => {
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
                this.registro.valor.InformeEgreso.otrosDiagnosticos.forEach(element => {
                    callback.push(element);
                });
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
            procedimiento: null,
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


    /**
     * Guardamos la prestacion y retornamos
     * al mapa de camas
     */
    guardarPrestacion(isvalid) {
        if (isvalid) {
            let registros = JSON.parse(JSON.stringify(this.prestacion.ejecucion.registros));
            let existeEgreso = this.prestacion.ejecucion.registros.find(r => r.concepto.conceptId === this.registro.concepto.conceptId);
            if (!existeEgreso) {
                registros.push(this.registro);
            }
            let params: any = {
                op: 'registros',
                registros: registros
            };
            this.servicioPrestacion.patch(this.prestacion.id, params).subscribe(prestacionEjecutada => {
                this.prestacionGuardada.emit(prestacionEjecutada);
                this.plex.toast('success', 'Prestacion guardada correctamente', 'Prestacion guardada', 100);
                this.cancelar();
            });
        }
    }

    /**
     * Cuando selecciona tipo de egreso
     * Se fija si es traslado y carga el select
     * de unidades organizativas
     */
    selecOrganizacionDestino() {
        if (this.registro.valor.InformeEgreso.tipoEgreso.nombre === 'Traslado' || this.registro.valor.InformeEgreso.tipoEgreso.nombre === 'Consultorio externo') {
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


    showProcedimientos_causas() {
        let regexCIECausasExternas = new RegExp('^S|^T');
        let regexCIEProcedimientosQuirurgicos = new RegExp('^F'); // TODO VER CON NANCY DE ESTADISTICAS

        if (this.registro.valor.InformeEgreso.diagnosticoPrincipal) {
            this.ExisteCausaExterna = regexCIECausasExternas.test(this.registro.valor.InformeEgreso.diagnosticoPrincipal.codigo);
        }
        if (this.registro.valor.InformeEgreso.diagnosticoPrincipal) {
            this.procedimientosObstetricos = regexCIEProcedimientosQuirurgicos.test(this.registro.valor.InformeEgreso.diagnosticoPrincipal.codigo);
        }
    }

    searchComoSeProdujo(event) {
        if (event && event.query) {
            let query = {
                nombre: event.query,
                codigoDesde: 'V00',
                codigoHasta: 'Y98'
            };
            this.Cie10Service.get(query).subscribe((datos) => {
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
}
