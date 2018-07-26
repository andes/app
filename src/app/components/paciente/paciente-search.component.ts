import { Component, Output, EventEmitter, OnInit, HostBinding, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PacienteService } from './../../services/paciente.service';
import * as moment from 'moment';
import { Plex } from '@andes/plex';
import { IPaciente } from './../../interfaces/IPaciente';
import { DocumentoEscaneado, DocumentoEscaneados } from './documento-escaneado.const';
import { Auth } from '@andes/auth';
import { LogService } from './../../services/log.service';
@Component({
    selector: 'pacientesSearch',
    templateUrl: 'paciente-search.html',
    styleUrls: ['paciente-search.css']
})

export class PacienteSearchComponent implements OnInit, OnDestroy {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    private timeoutHandle: number;
    private intervalHandle: number;

    // Propiedades públicas
    public busquedaAvanzada = false;
    public textoLibre: string = null;
    public resultado = null;
    public pacientesSimilares = null;
    public seleccion = null;
    public esEscaneado = false;
    public esMegascan = false;
    public loading = false;
    public cantPacientesValidados: number;
    public showCreateUpdate = false;
    public mostrarNuevo = false;
    public autoFocus = 0;
    /**
     * Indica si muestra el botón Cancelar/Volver en el footer
     */
    @Input() mostrarCancelar = false;
    /**
     * Indica si muestra el panel lateral en la selección de pacientes
     */
    @Input() modoCompleto = true;
    /**
     * Indica si quiere bloquear la modificación del paciente una vez seleccionado
     */
    @Input() bloquearCreate = false;
    /**
     * Indica si el componente llamador requiere ocultar el footer
     */
    @Input() hideFooter = false;
    /**
     * Label del botón "cancelar"
     */
    @Input() btnCancelarLabel = 'Cancelar';
    // Eventos
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();

    constructor(private plex: Plex, private pacienteService: PacienteService, private auth: Auth, private logService: LogService, private router: Router) {
        // this.actualizarContadores();
    }

    public ngOnInit() {
        // controlamos si tiene acceso a MPI
        let autorizado = this.auth.getPermissions('mpi:?').length > 0;
        if (!autorizado) {
            this.modoCompleto = false;
            // Si no está autorizado redirect al home
            this.router.navigate(['./inicio']);
            return false;
        };
        // controla el input y bloquea dashboard si no tiene permisos
        // Lo quitamos junto con el html del dashboard
        // if (this.modoCompleto) {
        //     this.modoCompleto = this.auth.check('mpi:paciente:dashboard');
        // }
        this.autoFocus = this.autoFocus + 1;
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalHandle);
    }

    /**
     * Selecciona un paciente y emite el evento 'selected'
     *
     * @param {*} paciente Paciente para seleccionar
     */
    public seleccionarPaciente(paciente: any) {
        if (paciente) {
            this.seleccion = paciente;
            if (this.esEscaneado) {
                this.seleccion.scan = this.textoLibre;
            }
            this.selected.emit(paciente);
            this.escaneado.emit(this.esEscaneado);
        } else {
            this.esEscaneado = false;
            this.selected.emit({});
            this.escaneado.emit(this.esEscaneado);
        }
        if (!this.bloquearCreate) {
            if (this.auth.check('mpi:editarPaciente')) {
                this.showCreateUpdate = true;
            } else {
                this.seleccion = {};
            }
        }

        // Mostrar formulario update si no hay paciente
        if (!paciente) {
            this.showCreateUpdate = true;
        }

        this.textoLibre = null;
        this.mostrarNuevo = false;
    }

    /**
     * Actualiza los contadores de pacientes cada 1 minutos
     *
     * @private
     */
    // Lo quitamos junto con el html del Dashboard
    // private actualizarContadores() {
    //     let actualizar = () => {
    //         this.pacienteService.getConsultas('validados')
    //             .subscribe(cantPacientesValidados => {
    //                 this.cantPacientesValidados = cantPacientesValidados;
    //             });
    //     };

    //     actualizar();
    //     this.intervalHandle = window.setInterval(actualizar, 1000 * 60); // Cada un minuto
    // }

    /**
     * Controla que el texto ingresado corresponda a un documento válido, controlando todas las expresiones regulares
     *
     * @returns {DocumentoEscaneado} Devuelve el documento encontrado
     */
    private comprobarDocumentoEscaneado(): DocumentoEscaneado {
        for (let key in DocumentoEscaneados) {
            if (DocumentoEscaneados[key].regEx.test(this.textoLibre)) {
                // Loggea el documento escaneado para análisis
                this.logService.post('mpi', 'scan', { data: this.textoLibre }).subscribe(() => { });
                return DocumentoEscaneados[key];
            }
        }
        if (this.textoLibre.length > 30) {
            this.logService.post('mpi', 'scanFail', { data: this.textoLibre }).subscribe(() => { });
        }
        return null;
    }

    /**
     * Parsea el texto libre en un objeto paciente
     *
     * @param {DocumentoEscaneado} documento documento escaneado
     * @returns {*} Datos del paciente
     */
    private parseDocumentoEscaneado(documento: DocumentoEscaneado): any {
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
     * Emite el evento 'cancel' cuando no se selecciona ningún paciente
     */
    public cancelar() {
        this.cancel.emit();
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

        // Limpia los resultados de la búsqueda anterior
        this.resultado = null;
        this.pacientesSimilares = null;
        this.mostrarNuevo = false;

        // Controla el scanner
        if (!this.controlarScanner()) {
            return;
        }

        // Inicia búsqueda
        if (this.textoLibre && this.textoLibre.trim()) {
            this.timeoutHandle = window.setTimeout(() => {
                this.timeoutHandle = null;
                // Si matchea una expresión regular, busca inmediatamente el paciente
                let documentoEscaneado = this.comprobarDocumentoEscaneado();
                if (documentoEscaneado) {
                    this.loading = true;
                    let pacienteEscaneado = this.parseDocumentoEscaneado(documentoEscaneado);
                    // Consulta API
                    this.pacienteService.get({
                        type: 'simplequery',
                        apellido: pacienteEscaneado.apellido.toString(),
                        nombre: pacienteEscaneado.nombre.toString(),
                        documento: pacienteEscaneado.documento.toString(),
                        sexo: pacienteEscaneado.sexo.toString(),
                        escaneado: true
                    }).subscribe(resultado => {
                        this.loading = false;
                        this.resultado = resultado;
                        this.esEscaneado = true;
                        // Encontramos un matcheo al 100%
                        if (resultado.length) {
                            this.seleccionarPaciente(resultado.length ? resultado[0] : pacienteEscaneado);
                            this.showCreateUpdate = true;
                        } else {
                            // Realizamos una busqueda por Suggest
                            this.pacienteService.get({
                                type: 'suggest',
                                claveBlocking: 'documento',
                                percentage: true,
                                apellido: pacienteEscaneado.apellido.toString(),
                                nombre: pacienteEscaneado.nombre.toString(),
                                documento: pacienteEscaneado.documento.toString(),
                                sexo: pacienteEscaneado.sexo.toString(),
                                fechaNacimiento: pacienteEscaneado.fechaNacimiento,
                                escaneado: true
                            }).subscribe(resultSuggest => {
                                this.pacientesSimilares = resultSuggest;
                                if (this.pacientesSimilares.length > 0) {
                                    let pacienteEncontrado = this.pacientesSimilares.find(valuePac => {
                                        if (valuePac.paciente.scan && valuePac.paciente.scan === this.textoLibre) {
                                            this.resultado = [valuePac.paciente];
                                            return valuePac.paciente;
                                        }
                                    });
                                    let datoDB = {
                                        id: this.pacientesSimilares[0].paciente.id,
                                        apellido: this.pacientesSimilares[0].paciente.apellido,
                                        nombre: this.pacientesSimilares[0].paciente.nombre,
                                        documento: this.pacientesSimilares[0].paciente.documento,
                                        sexo: this.pacientesSimilares[0].paciente.sexo,
                                        fechaNacimiento: this.pacientesSimilares[0].paciente.fechaNacimiento,
                                        match: this.pacientesSimilares[0].match
                                    };
                                    if (pacienteEncontrado) {
                                        this.logService.post('mpi', 'validadoScan', { pacienteDB: datoDB, pacienteScan: pacienteEscaneado }).subscribe(() => { });
                                        this.seleccionarPaciente(pacienteEncontrado.paciente ? pacienteEncontrado.paciente : pacienteEncontrado);
                                    } else {
                                        if (this.pacientesSimilares[0].match >= 0.94) {
                                            this.logService.post('mpi', 'macheoAlto', { pacienteDB: datoDB, pacienteScan: pacienteEscaneado }).subscribe(() => { });
                                            //
                                            // Actualizamos los datos del paciente con los datos obtenidos del DNI
                                            //
                                            if (!(this.pacientesSimilares[0].paciente.estado === 'validado')) {

                                                this.pacientesSimilares[0].paciente.nombre = pacienteEscaneado.nombre;
                                                this.pacientesSimilares[0].paciente.apellido = pacienteEscaneado.apellido;
                                                this.pacientesSimilares[0].paciente.documento = pacienteEscaneado.documento;
                                                this.pacientesSimilares[0].paciente.fechaNacimiento = pacienteEscaneado.fechaNacimiento;
                                            }
                                            this.seleccionarPaciente(this.pacientesSimilares[0].paciente);
                                        } else {
                                            if (this.pacientesSimilares[0].match >= 0.80 && this.pacientesSimilares[0].match < 0.94) {
                                                this.logService.post('mpi', 'posibleDuplicado', { pacienteDB: datoDB, pacienteScan: pacienteEscaneado }).subscribe(() => { });
                                            }
                                            this.seleccionarPaciente(pacienteEscaneado);
                                        }
                                    }

                                } else {
                                    this.pacientesSimilares = null;
                                    this.seleccionarPaciente(pacienteEscaneado);
                                }
                            });

                        }

                    }, (err) => {
                        this.loading = false;
                    });


                } else {
                    // Si no es un documento escaneado, hace una búsqueda multimatch
                    this.pacienteService.get({
                        type: 'multimatch',
                        cadenaInput: this.textoLibre
                    }).subscribe(resultado => {
                        this.loading = false;
                        this.resultado = resultado;
                        this.esEscaneado = false;
                        this.mostrarNuevo = this.auth.check('mpi:nuevoPaciente');
                    }, (err) => {
                        this.loading = false;
                    });
                }
            }, 200);
        }
    }

    afterCreateUpdate(paciente) {
        this.showCreateUpdate = false;
        this.seleccion = null;
        this.autoFocus = this.autoFocus + 1;
        this.textoLibre = '';
        if (paciente) {
            this.resultado = [paciente];
            // Comentado para evitar mal funcionamiento de turnos
            // this.seleccionarPaciente(paciente);
        }
    }
}
