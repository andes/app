import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-egresoInternacion',
    templateUrl: 'egresoInternacion.html'
})
export class EgresoInternacionComponent extends RUPComponent implements OnInit {

    public procedimientosQuirurgicos: any[];
    public causaExterna = {
        producidaPor: [{ id: 'accidente', nombre: 'Accidente' }, { id: 'lesionAutoinfligida', nombre: 'Lesión autoinflingida' },
        { id: 'agresion', nombre: 'Agresión' }, { id: 'seIgnora', nombre: 'Se ignora' }
        ],
        lugar: [{ id: 'domicilioParticular', nombre: 'Domicilio Particular' }, { id: 'viaPublico', nombre: 'Vía pública' },
        { id: 'lugarDetrabajo', nombre: 'Lugar de trabajo' }, { id: 'otro', nombre: 'otro' }, { id: 'seIgnora', nombre: 'Se ignora' }
        ]
    }

    ngOnInit() {
        let params;
        if (!this.registro.valor) {
            this.registro.valor = {
                InformeEgreso: {
                    causaExterna: {}
                }
            };
        }
        // Cargamos todos los procedimientos.
        this.procedimientosQuirurgicosService.get(params).subscribe(rta => {
            this.procedimientosQuirurgicos = rta.map(elem => {
                return { id: elem._id, nombre: elem.nombre };
            });
        });


    }


    codigoCIE10(event) {
        console.log(event);
        let query = {
            nombre: event.query
        };
        if (event.query) {
            this.Cie10Service.get(query).subscribe((datos) => {
                event.callback(datos);
            });
        } else {
            let callback = [];
            if (this.registro.valor.InformeEgreso.diagnosticoPrincipal &&
                this.registro.valor.InformeEgreso.otrosDiagnosticos &&
                this.registro.valor.InformeEgreso.causaExterna.comoSeProdujo) {

                callback = [this.registro.valor.InformeEgreso.diagnosticoPrincipal,
                this.registro.valor.InformeEgreso.otrosDiagnosticos,
                this.registro.valor.InformeEgreso.causaExterna.comoSeProdujo
                ];

            }
            event.callback(callback);

        }
    }

}


