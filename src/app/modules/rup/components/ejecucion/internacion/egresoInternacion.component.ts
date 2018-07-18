import { Component, Output, Input, EventEmitter, OnInit, HostBinding } from '@angular/core';
import { ProcedimientosQuirurgicosService } from '../../../../../services/procedimientosQuirurgicos.service';
import { Cie10Service } from '../../../../../services/term/cie10.service';
import { Plex } from '@andes/plex';
import { PrestacionesService } from '../../../services/prestaciones.service';
import { ActivatedRoute } from '@angular/router';
import { InternacionService } from '../../../services/internacion.service';
import { Location } from '@angular/common';

@Component({
    selector: 'rup-egresoInternacion',
    templateUrl: 'egresoInternacion.html'
})
export class EgresoInternacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
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
    public prestacion;

    constructor(

        public servicioPrestacion: PrestacionesService,
        public procedimientosQuirurgicosService: ProcedimientosQuirurgicosService,
        public Cie10Service: Cie10Service,
        private route: ActivatedRoute,
        private location: Location,
        public servicioInternacion: InternacionService,
        // public servicioOrganizacion: OrganizacionService,
        public plex: Plex
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            // console.log(params.id);
            this.servicioPrestacion.getById(params.id).subscribe(prestacion => {
                this.prestacion = prestacion;
                console.log(prestacion.ejecucion.registros);
                // Buscamos si la prestacion ya tiene una informe del alta guardado.
                let existeRegistro = prestacion.ejecucion.registros.find(r => r.concepto.conceptId === this.registro.concepto.conceptId);
                console.log(existeRegistro);
                this.registro.valor = existeRegistro ? existeRegistro.valor : null;
                console.log(this.registro);

                if (!this.registro.valor) {
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
                            causaExterna: {}
                        }
                    };
                }
            });
        });
        let params;
        // // Cargamos todos los procedimientos.
        this.procedimientosQuirurgicosService.get(params).subscribe(rta => {
            this.listaProcedimientosQuirurgicos = rta.map(elem => {
                return { id: elem._id, nombre: elem.nombre };
            });
        });
    }

    codigoCIE10(event) {
        if (event && event.query) {
            let query = {
                nombre: event.query
            };
            this.Cie10Service.get(query).subscribe((datos) => {
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
     * Vuelve a la página anterior
     */
    cancelar() {
        this.location.back();
        // this.router.navigate(['internacion/camas']);
    }


    guardarPrestacion() {
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
            this.plex.toast('success', 'Prestacion guardada correctamente', 'Prestacion guardada', 100);
            this.desocuparCama();
            this.cancelar();
        });
    }

    validar() {

        this.plex.confirm('Luego de validar la prestación no podrá editarse.<br />¿Desea continuar?', 'Confirmar validación').then(validar => {
            if (!validar) {
                return false;
            } else {
                let planes = [];
                this.servicioPrestacion.validarPrestacion(this.prestacion, planes).subscribe(prestacion => {
                    this.prestacion = prestacion;
                    this.plex.toast('success', 'La prestación se validó correctamente', 'Información', 300);
                }, (err) => {
                    this.plex.toast('danger', 'ERROR: No es posible validar la prestación');
                });
            }
        });

    }

    romperValidacion() {
        this.plex.confirm('Esta acción puede traer consecuencias <br />¿Desea continuar?', 'Romper validación').then(validar => {
            if (!validar) {
                return false;
            } else {
                // guardamos una copia de la prestacion antes de romper la validacion.
                let prestacionCopia = JSON.parse(JSON.stringify(this.prestacion));
                // Agregamos el estado de la prestacion copiada.
                let estado = { tipo: 'modificada', idOrigenModifica: prestacionCopia.id };
                // Guardamos la prestacion copia
                this.servicioPrestacion.clonar(prestacionCopia, estado).subscribe(prestacionClonada => {
                    let prestacionModificada = prestacionClonada;
                    // hacemos el patch y luego creamos los planes
                    let cambioEstado: any = {
                        op: 'romperValidacion',
                        estado: { tipo: 'ejecucion', idOrigenModifica: prestacionModificada.id }
                    };
                    // Vamos a cambiar el estado de la prestación a ejecucion
                    this.servicioPrestacion.patch(this.prestacion.id, cambioEstado).subscribe(prestacion => {
                        this.prestacion = prestacion;

                        // this.router.navigate(['rup/ejecucion', this.prestacion.id]);
                    }, (err) => {
                        this.plex.toast('danger', 'ERROR: No es posible romper la validación de la prestación');
                    });
                });
            }
        });
    }
    desocuparCama() {
        let registros = this.prestacion.ejecucion.registros;
        // nos fijamos si el concepto ya aparece en los registros
        let egresoExiste = registros.find(registro => registro.concepto.conceptId === this.registro.concepto.conceptId);

        if (egresoExiste && this.prestacion.estados[this.prestacion.estados.length - 1].tipo !== 'validada' &&
            egresoExiste.valor.InformeEgreso.fechaEgreso && egresoExiste.valor.InformeEgreso.tipoEgreso) {

            this.servicioInternacion.liberarCama(this.prestacion.id, egresoExiste.valor.InformeEgreso.fechaEgreso).subscribe(cama => { });

        }
    }
}


