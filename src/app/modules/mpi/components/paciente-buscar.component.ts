import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { PacienteService } from './../../../services/paciente.service';
import * as moment from 'moment';
import { DocumentoEscaneado, DocumentoEscaneados } from './../../../components/paciente/documento-escaneado.const';
import { LogService } from './../../../services/log.service';
import { IPacienteMatch } from '../interfaces/IPacienteMatch.inteface';
import { Plex } from '@andes/plex';
import { PacienteBuscarResultado } from '../interfaces/PacienteBuscarResultado.inteface';


interface PacienteEscaneado {
    documento: string;
    apellido: string;
    nombre: string;
    sexo: string;
    fechaNacimiento: Date;
}

@Component({
    selector: 'paciente-buscar',
    templateUrl: 'paciente-buscar.html',
    styleUrls: ['paciente-buscar.scss']
})
export class PacienteBuscarComponent implements OnInit, OnDestroy {
    private timeoutHandle: number;
    public textoLibre: string = null;
    public autoFocus = 0;

    // Eventos
    @Output() searchStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() searchEnd: EventEmitter<PacienteBuscarResultado> = new EventEmitter<PacienteBuscarResultado>();
    @Output() searchClear: EventEmitter<any> = new EventEmitter<any>();

    constructor(private plex: Plex, private pacienteService: PacienteService, private logService: LogService) {
    }

    public ngOnInit() {
        this.autoFocus = this.autoFocus + 1;
    }

    ngOnDestroy(): void {
        clearInterval(this.timeoutHandle);
    }

    /**
     * Controla que el texto ingresado corresponda a un documento válido, controlando todas las expresiones regulares
     *
     * @returns {DocumentoEscaneado} Devuelve el documento encontrado
     */
    private comprobarDocumentoEscaneado(textoLibre: string): DocumentoEscaneado {
        for (let key in DocumentoEscaneados) {
            if (DocumentoEscaneados[key].regEx.test(textoLibre)) {
                // Loggea el documento escaneado para análisis
                this.logService.post('mpi', 'scan', { data: textoLibre }).subscribe(() => { });
                return DocumentoEscaneados[key];
            }
        }
        if (textoLibre.length > 30) {
            this.logService.post('mpi', 'scanFail', { data: textoLibre }).subscribe(() => { });
        }
        return null;
    }

    /**
     * Parsea el texto libre en un objeto paciente
     *
     * @param {DocumentoEscaneado} documento documento escaneado
     * @returns {*} Datos del paciente
     */
    private parseDocumentoEscaneado(documento: DocumentoEscaneado): PacienteEscaneado {
        let datos = this.textoLibre.match(documento.regEx);
        let sexo = '';
        if (documento.grupoSexo > 0) {
            sexo = (datos[documento.grupoSexo].toUpperCase() === 'F') ? 'femenino' : 'masculino';
        }

        let fechaNacimiento = null;
        if (documento.grupoFechaNacimiento > 0) {
            fechaNacimiento = moment(datos[documento.grupoFechaNacimiento], 'DD/MM/YYYY');
        }

        return {
            documento: datos[documento.grupoNumeroDocumento].replace(/\D/g, ''),
            apellido: datos[documento.grupoApellido],
            nombre: datos[documento.grupoNombre],
            sexo: sexo,
            fechaNacimiento: fechaNacimiento
        };
    }

    /**
     * Controla si se ingresó el caracter " en la primera parte del string, indicando que el scanner no está bien configurado
     *
     * @private
     * @returns {boolean} Indica si está bien configurado
     */
    private controlarScanner(): boolean {
        if (this.textoLibre) {
            let index = this.textoLibre.indexOf('"');
            if (index >= 0 && index < 20 && this.textoLibre.length > 5) {
                /* Agregamos el control que la longitud sea mayor a 5 para incrementar la tolerancia de comillas en el input */
                this.plex.alert('El lector de código de barras no está configurado. Comuníquese con la Mesa de Ayuda de TICS');
                this.textoLibre = null;
                return false;
            }
        }
        return true;
    }

    /**
     * Busca paciente cada vez que el campo de busca cambia su valor
     */
    public buscar($event) {
        /* Error en Plex, ejecuta un change cuando el input pierde el foco porque detecta que cambia el valor */
        if ($event.type) {
            return;
        }
        // Cancela la búsqueda anterior
        if (this.timeoutHandle) {
            window.clearTimeout(this.timeoutHandle);
        }

        // Controla el scanner
        if (!this.controlarScanner()) {
            return;
        }

        let textoLibre = this.textoLibre && this.textoLibre.trim();
        // Inicia búsqueda
        if (textoLibre) {
            this.timeoutHandle = window.setTimeout(() => {
                this.searchStart.emit();
                this.timeoutHandle = null;

                // Si matchea una expresión regular, busca inmediatamente el paciente
                let documentoEscaneado = this.comprobarDocumentoEscaneado(textoLibre);
                if (documentoEscaneado) {
                    // 1. Busca por documento escaneado
                    let pacienteEscaneado = this.parseDocumentoEscaneado(documentoEscaneado);
                    this.pacienteService.getMatch({
                        type: 'simplequery',
                        apellido: pacienteEscaneado.apellido,
                        nombre: pacienteEscaneado.nombre,
                        documento: pacienteEscaneado.documento,
                        sexo: pacienteEscaneado.sexo,
                        escaneado: true
                    }).subscribe(resultado => {
                        if (resultado.length) {
                            // 1.2. Si encuentra el paciente (un matcheo al 100%) finaliza la búsqueda
                            return this.searchEnd.emit({ pacientes: resultado, err: null });
                        } else {
                            // 1.3. Si no encontró el paciente escaneado, busca uno similar
                            this.pacienteService.getMatch({
                                type: 'suggest',
                                claveBlocking: 'documento',
                                percentage: true,
                                apellido: pacienteEscaneado.apellido,
                                nombre: pacienteEscaneado.nombre,
                                documento: pacienteEscaneado.documento,
                                sexo: pacienteEscaneado.sexo,
                                fechaNacimiento: pacienteEscaneado.fechaNacimiento,
                                escaneado: true
                            }).subscribe(resultadoSuggest => {
                                // 1.3.1. Si no encontró ninguno, finaliza la búsqueda
                                if (!resultadoSuggest.length) {
                                    return this.searchEnd.emit({ pacientes: [], err: null });
                                }
                                // 1.3.2. Busca a uno con el mismo código de barras
                                let match = resultadoSuggest.find(i => i.paciente.scan && i.paciente.scan === textoLibre);
                                if (match) {
                                    // TODO: this.logService.post('mpi', 'validadoScan', { pacienteDB: datoDB, pacienteScan: pacienteEscaneado }).subscribe(() => { });
                                    return this.searchEnd.emit({ pacientes: [match], err: null });
                                } else {
                                    // 1.3.3. Busca uno con un porcentaje alto de matcheo
                                    if (resultadoSuggest[0].match >= 0.94) {
                                        // TODO: this.logService.post('mpi', 'macheoAlto', { pacienteDB: datoDB, pacienteScan: pacienteEscaneado }).subscribe(() => { });
                                        if (resultadoSuggest[0].paciente.estado === 'validado') {
                                            this.searchEnd.emit({ pacientes: [resultadoSuggest[0]], err: null });
                                            return;
                                        } else {
                                            // Si es un paciente temporal, actualizados con los datos del DNI escaneado
                                            let pacienteActualizado: IPacienteMatch;
                                            Object.assign(pacienteActualizado, resultadoSuggest[0]);
                                            match.paciente.nombre = pacienteEscaneado.nombre;
                                            match.paciente.apellido = pacienteEscaneado.apellido;
                                            match.paciente.documento = pacienteEscaneado.documento;
                                            match.paciente.fechaNacimiento = pacienteEscaneado.fechaNacimiento;
                                            return this.searchEnd.emit({ pacientes: [pacienteActualizado], err: null });
                                        }
                                    } else {
                                        return this.searchEnd.emit({ pacientes: [], err: null });
                                    }
                                }
                            });
                        }
                    }, (err) => this.searchEnd.emit({ pacientes: [], err: err }));
                } else {
                    // 2. Busca por texto libre
                    this.pacienteService.getMatch({
                        type: 'multimatch',
                        cadenaInput: textoLibre
                    }).subscribe(
                        resultado => this.searchEnd.emit({ pacientes: resultado, err: null }),
                        (err) => this.searchEnd.emit({ pacientes: [], err: err })
                    );
                }
            }, 200);
        } else {
            this.searchClear.emit();
        }
    }
}
