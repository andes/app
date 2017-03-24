import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { PacienteService } from './../../services/paciente.service';
import { IPaciente } from './../../interfaces/IPaciente';

@Component({
  selector: 'pacientesSearch',
  templateUrl: 'paciente-search.html',
  styleUrls: ['paciente-search.css']
})
export class PacienteSearchComponent {
  private timeoutHandle: number;
  private regExs: RegExp[] = [
    /[0-9]+".+".+"[M|F]"[0-9]{7,8}"[A-Z]"[0-9]{2}-[0-9]{2}-[0-9]{4}"[0-9]{2}-[0-9]{2}-[0-9]{4}/
  ];

  // Propiedades públicas
  public busquedaAvanzada = false;
  public textoLibre = null;
  public resultado = null;
  public seleccion = null;
  public esEscaneado = false;
  public loading = false;
  public cantPacientesValidados: number;
  public showCreateUpdate = false;

  // Eventos
  @Output() selected: EventEmitter<any> = new EventEmitter<any>();

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

  constructor(private pacienteService: PacienteService) {
    this.actualizarContadores();
  }

  /**
   * Controla que el texto ingresado corresponda a un documento válido, controlando todas las expresiones regulares
   *
   * @returns {RegExp} Devuelve la expresión regular encontrada
   */
  comprobarRegExs(): RegExp {
    for (let i = 0; i < this.regExs.length; i++) {
      if (this.regExs[i].test(this.textoLibre)) {
        return this.regExs[i];
      }
    }
    return null;
  }

  /**
   * Parsea el texto libre en un objeto paciente
   *
   * @param {RegExp} regEx Expresión regular para analizar
   * @returns {*} Datos del paciente
   */
  parseInput(regEx: RegExp): any {
    let datos = this.textoLibre.split('"');
    let sexo = (datos[3] === 'F') ? 'femenino' : 'masculino';
    let fecha = datos[6].split('-');
    return {
      documento: datos[4],
      apellido: datos[1],
      nombre: datos[2],
      sexo: sexo,
      fechaNacimiento: new Date(parseInt(fecha[2], 10), parseInt(fecha[1], 10) - 1, parseInt(fecha[0], 10))
    };
  }

  onReturn() {
    this.showCreateUpdate = false;
  }

  /**
   * Busca paciente cada vez que el campo de busca cambia su valor
   */
  public buscar() {
    // Limpia los resultados de la búsqueda anterior
    this.resultado = null;

    // Si matchea una expresión regular, busca inmediatamente el paciente
    let regEx = this.comprobarRegExs();
    if (regEx) {
      this.loading = true;
      let pacienteEscaneado = this.parseInput(regEx);

      // BUG DE PLEX????
      window.setTimeout(() => {
        this.textoLibre = null;
      });

      this.pacienteService.get({
        type: 'simplequery',
        apellido: pacienteEscaneado.apellido,
        nombre: pacienteEscaneado.nombre,
        documento: pacienteEscaneado.documento,
        sexo: pacienteEscaneado.sexo,
        fechaNacimiento: pacienteEscaneado.fechaNacimiento
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
      // Si está tipeando texto, espera unos milisegundos antes de buscar
      if (this.timeoutHandle) {
        window.clearTimeout(this.timeoutHandle);
      }

      if (this.textoLibre && this.textoLibre.trim()) {
        this.timeoutHandle = window.setTimeout(() => {
          this.timeoutHandle = null;
          this.loading = true;
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
        }, 300);
      }
    }
  }
}
