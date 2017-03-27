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
export class PacienteSearchComponent {
  private timeoutHandle: number;

  // Propiedades públicas
  public busquedaAvanzada = false;
  public textoLibre: string = null;
  public resultado = null;
  public seleccion = null;
  public esEscaneado = false;
  public loading = false;
  public cantPacientesValidados: number;
  public showCreateUpdate = false;

  // Eventos
  @Output() selected: EventEmitter<any> = new EventEmitter<any>();
  @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Selecciona un paciente y emite el evento 'selected'
   *
   * @private
   * @param {*} paciente Paciente para seleccionar
   */
  private seleccionarPaciente(paciente: any) {
    this.seleccion = paciente;

    // Emite el evento sólo si el paciente está en la base de datos
    if (paciente && paciente.id) {
      this.selected.emit(paciente);
      this.escaneado.emit(this.esEscaneado);
    }
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

  constructor(private plex: Plex, private server: Server, private pacienteService: PacienteService) {
    this.actualizarContadores();
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
          this.textoLibre = null;

          // Consulta API
          this.pacienteService.get({
            type: 'simplequery',
            apellido: pacienteEscaneado.apellido,
            nombre: pacienteEscaneado.nombre,
            documento: pacienteEscaneado.documento,
            sexo: pacienteEscaneado.sexo
          }).subscribe(resultado => {
            this.loading = false;
            this.resultado = resultado;
            this.esEscaneado = true;
            this.seleccionarPaciente(resultado.length ? resultado[0] : pacienteEscaneado);
            this.showCreateUpdate = true;
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
            this.seleccionarPaciente(resultado.length ? resultado[0] : null);
          }, (err) => {
            this.loading = false;
          });
        }
      }, 200);
    }
  }

  afterCreateUpdate() {
    this.showCreateUpdate = false;
    this.resultado = null;
  }
}
