import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { PacienteService } from './../../services/paciente.service';
import * as moment from 'moment';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { IPaciente } from './../../interfaces/IPaciente';
import { DocumentoEscaneado, DocumentoEscaneados } from './documento-escaneado.const';


@Component({
  selector: 'pacientesSearch',
  templateUrl: 'paciente-search.html',
  styleUrls: ['paciente-search.css']
})
export class PacienteSearchComponent implements OnInit {
  private timeoutHandle: number;

  // Propiedades públicas
  public busquedaAvanzada = false;
  public textoLibre: string = null;
  public resultado = null;
  public pacientesSimilares = null;
  public seleccion = null;
  public esEscaneado = false;
  public loading = false;
  public cantPacientesValidados: number;
  public showCreateUpdate = false;
  public mostrarNuevo = false;
  public autoFocus: number = 0;

  // Eventos
  @Output() selected: EventEmitter<any> = new EventEmitter<any>();
  @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();

  constructor(private plex: Plex, private server: Server, private pacienteService: PacienteService) {
    this.actualizarContadores();
  }


  public ngOnInit() {
    this.autoFocus = this.autoFocus + 1;
  }


  /**
   * Selecciona un paciente y emite el evento 'selected'
   *
   * @private
   * @param {*} paciente Paciente para seleccionar
   */
  public seleccionarPaciente(paciente: any) {
    if (paciente) {
      this.seleccion = paciente;
      this.seleccion.scan = this.textoLibre;
      this.selected.emit(paciente);
      this.escaneado.emit(this.esEscaneado);
    } else {
      this.esEscaneado = false;
      this.escaneado.emit(this.esEscaneado);
    }
    this.showCreateUpdate = true;
    this.textoLibre = null;
    this.mostrarNuevo = false;
  }

  /**
   * Actualiza los contadores de pacientes cada 1 minutos
   *
   * @private
   */
  private actualizarContadores() {
    let actualizar = () => {
      this.pacienteService.getConsultas('validados')
        .subscribe(cantPacientesValidados => {
          this.cantPacientesValidados = cantPacientesValidados;
        });
    };

    actualizar();
    window.setInterval(actualizar, 1000 * 60); // Cada un minuto
  }



  /**
   * Controla que el texto ingresado corresponda a un documento válido, controlando todas las expresiones regulares
   *
   * @returns {DocumentoEscaneado} Devuelve el documento encontrado
   */
  private comprobarDocumentoEscaneado(): DocumentoEscaneado {
    for (let key in DocumentoEscaneados) {
      if (DocumentoEscaneados[key].regEx.test(this.textoLibre)) {
        // Loggea el documento escaneado para análisis
        this.server.post('/core/log/mpi/scan', { data: this.textoLibre }, { params: null, showError: false }).subscribe(() => { })
        return DocumentoEscaneados[key];
      }
    }
    if (this.textoLibre.length > 30) {
      this.server.post('/core/log/mpi/scanFail', { data: this.textoLibre }, { params: null, showError: false }).subscribe(() => { })
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
    return {
      documento: datos[documento.grupoNumeroDocumento].replace(/\D/g, ''),
      apellido: datos[documento.grupoApellido],
      nombre: datos[documento.grupoNombre],
      sexo: (datos[documento.grupoSexo].toUpperCase() === 'F') ? 'femenino' : 'masculino',
      fechaNacimiento: moment(datos[documento.grupoFechaNacimiento], 'DD/MM/YYYY')
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
      if (index >= 0 && index < 20) {
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
  public buscar() {
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
    debugger;
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

              resultado[0].scan = pacienteEscaneado.scan;

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
                debugger;
                this.pacientesSimilares = resultSuggest;
                if (this.pacientesSimilares.length > 0) {

                  let pacienteEncontrado = this.pacientesSimilares.find(valuePac => {
                    if (valuePac.paciente.scan && valuePac.paciente.scan === this.textoLibre) {
                      return valuePac.paciente;
                    }
                  });

                  if (pacienteEncontrado) {
                    this.server.post('/core/log/mpi/validadoScan', { data: { pacienteDB: this.pacientesSimilares[0], pacienteScan: pacienteEscaneado } }, { params: null, showError: false }).subscribe(() => { })
                    this.seleccionarPaciente(pacienteEncontrado);
                  } else {
                    if (this.pacientesSimilares[0].match >= 0.90) {
                      this.server.post('/core/log/mpi/macheoAlto', { data: { pacienteDB: this.pacientesSimilares[0], pacienteScan: pacienteEscaneado } }, { params: null, showError: false }).subscribe(() => { })
                      this.seleccionarPaciente(this.pacientesSimilares[0].paciente);
                    } else {
                      if (this.pacientesSimilares[0].match >= 0.80 && this.pacientesSimilares[0].match < 0.90) {
                        this.server.post('/core/log/mpi/posibleDuplicado', { data: { pacienteDB: this.pacientesSimilares[0], pacienteScan: pacienteEscaneado } }, { params: null, showError: false }).subscribe(() => { })
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
            //this.mostrarNuevo = true;
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
