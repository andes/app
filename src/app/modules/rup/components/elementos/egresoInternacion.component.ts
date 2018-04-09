import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-egresoInternacion',
    templateUrl: 'egresoInternacion.html'
})
export class EgresoInternacionComponent extends RUPComponent implements OnInit {

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

    ngOnInit() {
        let params;
        if (!this.registro.valor) {
            this.registro.valor = {
                InformeEgreso: {
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
        // Cargamos todos los procedimientos.
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
}


