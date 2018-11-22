import { Component, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { Plex, SelectEvent } from '@andes/plex';
import { ICodificacionPrestacion } from './../../../../modules/rup/interfaces/ICodificacion';



@Component({
    selector: 'fuera-agenda',
    templateUrl: 'fuera-agenda.html'
})
export class RevisionFueraAgendaComponent implements OnInit {
    // Propiedades privadas

    // Propiedades públicas
    public prestaciones: ICodificacionPrestacion[];
    public prestacionSeleccionada: ICodificacionPrestacion;
    // Eventos
    @Output() save: EventEmitter<ICodificacionPrestacion[]> = new EventEmitter<ICodificacionPrestacion[]>();

    // Constructor
    constructor(private plex: Plex) { }

    // Métodos
    ngOnInit() {
        this.prestaciones = [{
            id: '5bf55f13ca9bf5331aa2c34d',
            idPrestacion: '5bf55ef0ca9bf5331aa2c334',
            paciente: {
                id: '58da55ed0bb1a96b254dda54',
                nombre: 'JUAN FRANCISCO',
                apellido: 'GABRIEL',
                documento: '26108063',
                sexo: 'masculino',
                fechaNacimiento: new Date('1977-10-02T00:00:00.000-03:00')
            },
            diagnostico: {
                codificaciones: [{
                    'codificacionProfesional': {
                        'snomed': {
                            'refsetIds': [
                                '900000000000497000'
                            ],
                            'conceptId': '58214004',
                            'term': 'esquizofrenia',
                            'fsn': 'esquizofrenia (trastorno)',
                            'semanticTag': 'trastorno'
                        },
                        'cie10': {
                            'causa': 'F20',
                            'subcausa': '9',
                            'codigo': 'F20.9',
                            'nombre': 'Esquizofrenia, no especificada',
                            'sinonimo': 'Esquizofrenia',
                            'c2': false
                        },
                    },
                    primeraVez: false
                }]
            }

        },
        {
            id: '5bf58911da5b26600c0d90eb',
            'diagnostico': {
                'codificaciones': [
                    {
                        'codificacionProfesional': {
                            'snomed': {
                                'refsetIds': [
                                    '900000000000497000'
                                ],
                                'conceptId': '58214004',
                                'term': 'esquizofrenia',
                                'fsn': 'esquizofrenia (trastorno)',
                                'semanticTag': 'trastorno'
                            },
                            'cie10': {
                                'causa': 'F20',
                                'subcausa': '9',
                                'codigo': 'F20.9',
                                'nombre': 'Esquizofrenia, no especificada',
                                'sinonimo': 'Esquizofrenia',
                                'c2': false
                            },
                        },
                        primeraVez: false
                    }
                ]
            },
            idPrestacion: '5bf5888eda5b26600c0d905b',
            'paciente': {
                'id': '586e6e8e27d3107fde1487f5',
                'nombre': 'ELBA',
                'apellido': 'ROA',
                'documento': '12235825',
                'sexo': 'femenino',
                'fechaNacimiento': new Date('1956-01-15T03:00:00.000-03:00')
            }
        }];
    }

    estaSeleccionada(prestacion: ICodificacionPrestacion) {
        // this.showRegistrosTurno = true;
        // return (this.turnoSeleccionado === turno); //
    }

    seleccionarPrestacion(prestacion: ICodificacionPrestacion) {
        this.prestacionSeleccionada = prestacion;
    }

    /**
     * Guarda los datos del formulario y emite el dato guardado
     *
     * @param {any} $event formulario a validar
     */
    guardar($event) {
        if ($event.formValid) {
            // ...
            this.plex.info('success', 'Los datos están correctos');
            this.save.emit(this.prestaciones);
        } else {
            this.plex.info('warning', 'Completar datos requeridos');
        }
    }


}
