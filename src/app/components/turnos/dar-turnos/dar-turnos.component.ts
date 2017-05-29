type Estado = 'seleccionada' | 'noSeleccionada' | 'confirmacion' | 'noTurnos';
import { Component, AfterViewInit, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { TurnoService } from './../../../services/turnos/turno.service';
import * as moment from 'moment';

// Interfaces
import { IBloque } from './../../../interfaces/turnos/IBloque';
import { ITurno } from './../../../interfaces/turnos/ITurno';
import { IAgenda } from './../../../interfaces/turnos/IAgenda';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IListaEspera } from './../../../interfaces/turnos/IListaEspera';
import { ILlavesTipoPrestacion } from './../../../interfaces/llaves/ILlavesTipoPrestacion';

import { CalendarioDia } from './calendario-dia.class';

// Servicios
import { PacienteService } from '../../../services/paciente.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { AgendaService } from '../../../services/turnos/agenda.service';
import { ListaEsperaService } from '../../../services/turnos/listaEspera.service';
import { PrestacionPacienteService } from '../../../services/rup/prestacionPaciente.service';

import { LlavesTipoPrestacionService } from './../../../services/llaves/llavesTipoPrestacion.service';

import { patientRealAgePipe } from './../../../utils/patientPipe';
import { Pipe, PipeTransform } from '@angular/core';

const size = 4;

@Component({
  selector: 'dar-turnos',
  templateUrl: 'dar-turnos.html'
})

export class DarTurnosComponent implements OnInit {
  private _reasignaTurnos: any;
  llaveTP: any;

  @Output() selected: EventEmitter<any> = new EventEmitter<any>();
  @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();

  @Input('reasignar')
  set reasignar(value: any) {
    this._reasignaTurnos = value;
  }
  get reasignar(): any {
    return this._reasignaTurnos;
  }

  public agenda: IAgenda;
  public agendas: IAgenda[];
  public opciones = {
    fecha: new Date(),
    tipoPrestacion: null,
    profesional: null,
  };

  paciente: IPaciente;
  public estadoT: Estado;
  private turno: ITurno;
  private bloque: IBloque;
  private bloques: IBloque[];
  private indiceTurno: number;
  private indiceBloque: number;
  private telefono: String = '';
  private busquedas: any[] = localStorage.getItem('busquedas') ? JSON.parse(localStorage.getItem('busquedas')) : [];
  private alternativas: any[] = [];
  private reqfiltros = false;
  private tipoPrestaciones: String = '';
  private tipoPrestacionesArray: Object[];
  private turnoTipoPrestacion: any = {};
  private delDiaDisponibles: number;
  private programadosDisponibles: number;
  private gestionDisponibles: number;
  countBloques: any[];
  countTurnos: any = {};

  public seleccion = null;
  public esEscaneado = false;

  ultimosTurnos: any[];

  indice: number = -1;
  semana: String[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  public permisos = [];
  public autorizado = false;
  pacientesSearch = true;
  showDarTurnos = false;
  cambioTelefono = false;
  showCreateUpdate = false;
  tipoTurno: string;
  tiposTurnosSelect: String;
  tiposTurnosLabel: String;
  public filtradas: any = [];
  public llaves: any = [];
  hoy: Date;
  constructor(
    public serviceProfesional: ProfesionalService,
    public serviceAgenda: AgendaService,
    public serviceListaEspera: ListaEsperaService,
    public serviceTurno: TurnoService,
    public servicePaciente: PacienteService,
    public servicioTipoPrestacion: TipoPrestacionService,
    public servicioPrestacionPaciente: PrestacionPacienteService,
    private llaveTipoPrestacionService: LlavesTipoPrestacionService,
    public plex: Plex,
    public auth: Auth,
    private router: Router) { }

  ngOnInit() {
    this.hoy = new Date();
    this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
    this.opciones.fecha = moment().toDate();

    if (this._reasignaTurnos) {
      this.paciente = this._reasignaTurnos.paciente;
      this.telefono = this.turno.paciente.telefono;
    }

    this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
    // this.actualizar('sinFiltro');
  }

  loadTipoPrestaciones(event) {
    this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data) => {
      console.log('permisos ', this.permisos);
      let dataF = data.filter((x) => { return this.permisos.indexOf(x.id) >= 0; });
      let data2 = this.verificarLlaves(dataF, event);
    });
  }

  public verificarLlaves(tipoPrestaciones: any[], event) {
    console.log('tipoPrestaciones ', tipoPrestaciones);
    tipoPrestaciones.forEach((tipoPrestacion, index) => {
      let band = true;
      this.llaveTipoPrestacionService.get({ idTipoPrestacion: tipoPrestacion.id, activa: true }).subscribe(
        llaves => {
          console.log('llaves ',llaves);
          this.llaveTP = llaves[0];
          if (!this.llaveTP) {
            band = true;
          } else {
            // Verifico que si la llave tiene rango de edad, el paciente esté en ese rango
            if (this.llaveTP.llave && this.llaveTP.llave.edad && this.paciente) {
              let edad = new patientRealAgePipe().transform(this.paciente, []);
              // Edad desde
              if (this.llaveTP.llave.edad.desde) {
                let edadDesde = String(this.llaveTP.llave.edad.desde.valor) + ' ' + this.llaveTP.llave.edad.desde.unidad;
                if (edad < edadDesde) {
                  band = false;
                }
              }
              // Edad hasta
              if (this.llaveTP.llave.edad.hasta) {
                let edadHasta = String(this.llaveTP.llave.edad.hasta.valor) + ' ' + this.llaveTP.llave.edad.hasta.unidad;
                if (edad > edadHasta) {
                  band = false;
                }
              }
            }
            // Verifico que si la llave tiene seteado sexo, el sexo del paciente coincida
            if (this.llaveTP.llave && this.llaveTP.llave.sexo && this.paciente) {
              if (this.llaveTP.llave.sexo !== this.paciente.sexo) {
                band = false;
              }
            }
          }
          if (band) {
            this.filtradas.push(tipoPrestacion);
            if (this.llaveTP) {
              this.llaves = [...this.llaves, this.llaveTP];
              // this.llaves.push(this.llaveTP);
            }
          }
        },
        err => {
          if (err) {
            console.log(err);
            band = false;
          }
        }, () => {
          if (tipoPrestaciones.length - 1 === index) {
            // console.log('funcion loca', this.filtradas);
            // console.log('Llaves', this.llaves);
            // event.callback(this.filtradas);
            // Se actualiza el calendario con las agendas filtradas por permisos y llaves
            this.cargarDatosLlaves(event);
          }
        });
    });
  }

  cargarDatosLlaves(event) {
    this.llaves.forEach((cadaLlave, indiceLlave) => {
      console.log(cadaLlave);
      let solicitudVigente = false;
      // TODO si la llave requiere solicitud, verificar en prestacionPaciente la fecha de solicitud
      if (cadaLlave.llave && cadaLlave.llave.solicitud && this.paciente) {
        // TODO: Buscar si hay una solicitud para ese paciente y ese tipo de prestación. Si tiene vencimiento verificar que no esté vencida
        let params = {
          estado: 'pendiente',
          idPaciente: this.paciente.id,
          idTipoPrestacion: cadaLlave.tipoPrestacion.id
        };
        this.servicioPrestacionPaciente.get(params).subscribe(
          prestacionPaciente => {
            if (prestacionPaciente.length > 0) {
              console.log('prestacionPaciente', prestacionPaciente[0].solicitud.profesional);
              if (cadaLlave.llave.solicitud.vencimiento) {
                if (cadaLlave.llave.solicitud.vencimiento.unidad === 'Días') {
                  this.llaves[indiceLlave].profesional = prestacionPaciente[0].solicitud.profesional;
                  this.llaves[indiceLlave].fechaSolicitud = prestacionPaciente[0].solicitud.fecha;
                  let end = moment(prestacionPaciente[0].solicitud.fecha).add(cadaLlave.llave.solicitud.vencimiento.valor, 'days');
                  solicitudVigente = moment().isBefore(end);
                  console.log('fecha ', end.toDate(), 'condicion ', solicitudVigente);
                  this.llaves[indiceLlave].solicitudVigente = solicitudVigente;
                  this.llaves[indiceLlave].prestacionOrigen = 'Consulta de medicina general';
                  if (!solicitudVigente) {
                    let indiceFiltradas = this.filtradas.indexOf(cadaLlave);
                    this.filtradas.splice(indiceFiltradas, 1);
                    this.filtradas = [...this.filtradas];
                  }
                }
              }
            } else {
              // Si no existe una solicitud para el paciente y el tipo de prestacion, saco la llave de la lista y saco la prestacion del select
              this.llaves.splice(indiceLlave, 1);
              this.llaves = [...this.llaves];

              let indiceFiltradas = this.filtradas.indexOf(cadaLlave);
              this.filtradas.splice(indiceFiltradas, 1);
              this.filtradas = [...this.filtradas];
              console.log('0__0', this.llaves);
            }
          },
          err => {
            if (err) {
              console.log(err);
            }
          },
          () => {
            console.log('yesss', this.llaves);
            event.callback(this.filtradas);
            this.actualizar('sinFiltro');
          }
        );

      } else {
        // Elimino la llave del arreglo
        let ind = this.llaves.indexOf(cadaLlave);
        this.llaves.splice(ind, 1);
        this.llaves = [...this.llaves];

        let indiceFiltradas = this.filtradas.indexOf(cadaLlave);
        this.filtradas.splice(indiceFiltradas, 1);
        this.filtradas = [...this.filtradas];

        console.log('noooou dsdsadsda', this.llaves);
      }
    });
  }

  loadProfesionales(event) {
    if (event.query) {
      let query = {
        nombreCompleto: event.query
      };
      this.serviceProfesional.get(query).subscribe(event.callback);
    } else {
      event.callback(this.opciones.profesional || []);
    }
  }

  filtrar() {
    let search = {
      'tipoPrestacion': this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion : null,
      'profesional': this.opciones.profesional ? this.opciones.profesional : null
    };
    if (this.busquedas.length === size) {
      this.busquedas.shift();
    }

    if (search.tipoPrestacion || search.profesional) {
      this.busquedas.push(search);
      localStorage.setItem('busquedas', JSON.stringify(this.busquedas));
    }

    this.actualizar('');
  }

  /**
   *
   * @param etiqueta: define qué filtros usar para traer todas las Agendas
   */
  actualizar(etiqueta) {

    // 1) Auth general (si puede ver esta pantalla)
    this.autorizado = this.auth.getPermissions('turnos:darTurnos:?').length > 0;

    // 2) Permisos
    this.permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');

    let params: any = {};
    this.estadoT = 'noSeleccionada';
    this.agenda = null;

    let fechaHasta = (moment(this.opciones.fecha).endOf('month')).toDate();

    if (etiqueta !== 'sinFiltro') {

      // Filtro búsqueda
      params = {
        // Mostrar sólo las agendas a partir de hoy en adelante
        rango: true, desde: new Date(), hasta: fechaHasta,
        idTipoPrestacion: (this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion.id : ''),
        idProfesional: (this.opciones.profesional ? this.opciones.profesional.id : ''),
        organizacion: this.auth.organizacion._id
      };

    } else {
      // Resetear opciones
      this.opciones.tipoPrestacion = null;
      this.opciones.profesional = null;
      console.log('filtradas ', this.filtradas.map((f) => { return f.id; }));
      params = {
        // Mostrar sólo las agendas a partir de hoy en adelante
        rango: true, desde: new Date(), hasta: fechaHasta,
        // tipoPrestaciones: this.permisos,
        tipoPrestaciones: this.filtradas.map((f) => { return f.id; }),
        organizacion: this.auth.organizacion._id
      };

    }
    // Traer las agendas
    this.serviceAgenda.get(params).subscribe(agendas => {

      // Sólo traer agendas disponibles o publicadas
      this.agendas = agendas.filter((data) => {
        if (data.horaInicio >= moment(new Date()).startOf('day').toDate() && data.horaInicio <= moment(new Date()).endOf('day').toDate()) {
          return (data.estado === 'Publicada');
        } else {
          return (data.estado === 'Disponible' || data.estado === 'Publicada');
        }
      });

      // Ordena las Agendas por fecha/hora de inicio
      this.agendas = this.agendas.sort(
        function (a, b) {
          let inia = a.horaInicio ? new Date(a.horaInicio.setHours(0, 0, 0, 0)) : null;
          let inib = b.horaInicio ? new Date(b.horaInicio.setHours(0, 0, 0, 0)) : null;
          {
            return inia ? (inia.getTime() - inib.getTime() || b.turnosDisponibles - a.turnosDisponibles) : b.turnosDisponibles - a.turnosDisponibles;
          }
        }
      );

    });
  }

  /**
   * Selecciona una Agenda (click en el calendario)
   * @param agenda: objeto con una agenda completa
   */
  seleccionarAgenda(agenda) {
    // Asigno agenda
    this.agenda = agenda;

    // Ver si cambió el estado de la agenda en otro lado
    this.serviceAgenda.getById(this.agenda.id).subscribe(a => {

      // Si cambió el estado y ya no está Disponible ni Publicada, mostrar un alerta y cancelar cualquier operación
      if (a.estado !== 'Disponible' && a.estado !== 'Publicada') {

        this.plex.alert('Esta agenda ya no está disponible.');
        return false;

      } else {

        // Asigno bloques
        this.bloques = this.agenda.bloques;

        // Iniciar alternativas (para cuando los turnos están completos)
        this.alternativas = [];

        // Tipo de Prestación, para poder filtrar las agendas
        let tipoPrestacion: String = this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion.id : '';

        /*Filtra los bloques segun el filtro tipoPrestacion*/
        this.bloques = this.agenda.bloques.filter(
          function (value) {
            let prestacionesBlq = value.tipoPrestaciones.map(function (obj) {
              return obj.id;
            });
            if (tipoPrestacion) {
              return (prestacionesBlq.indexOf(tipoPrestacion) >= 0);
            } else {
              return true;
            }
          }
        );

        // hay agenda?
        if (this.agenda) {

          let myBloques = [];
          let isDelDia = false;

          let idAgendas = this.agendas.map(elem => {
            return elem.id;
          });

          this.indice = idAgendas.indexOf(this.agenda.id);

          // Usamos CalendarioDia para hacer chequeos
          // TODO: Cleanup y usar sólo la clase donde se pueda
          let cal = new CalendarioDia(null, this.agenda);

          /*Si hay turnos disponibles para la agenda, se muestra en el panel derecho*/
          if (cal.estado !== 'ocupado') {

            if (this.agenda.estado === 'Disponible') {
              this.tiposTurnosSelect = 'gestion';
              this.tiposTurnosLabel = 'Para gestión de pacientes';
            }

            if (this.agenda.estado === 'Publicada') {
              this.tiposTurnosSelect = 'programado';
              this.tiposTurnosLabel = 'Programado';
            }

            let countBloques = [];
            this.programadosDisponibles = 0;
            this.gestionDisponibles = 0;
            this.delDiaDisponibles = 0;
            // let tiposTurnosSelect = [];

            // Si la agenda es de hoy, los turnos deberán sumarse al contador "delDia"
            if (this.agenda.horaInicio >= moment().startOf('day').toDate() && this.agenda.horaInicio <= moment().endOf('day').toDate()) {

              isDelDia = true;
              this.tiposTurnosSelect = 'delDia';
              this.tiposTurnosLabel = 'Del día';

              // Recorro los bloques y cuento los turnos programados como "delDia", luego descuento los ya asignados
              this.agenda.bloques.forEach((bloque, indexBloque) => {

                countBloques.push({
                  delDia: ((bloque.accesoDirectoDelDia as number) + (bloque.accesoDirectoProgramado as number)),
                  programado: 0,
                  gestion: bloque.reservadoGestion,
                  profesional: bloque.reservadoProfesional
                });

                bloque.turnos.forEach((turno) => {

                  console.log('tipoTurno', turno.tipoTurno);
                  // Si el turno está asignado o está disponible pero ya paso la hora
                  if (turno.estado === 'asignado' || (turno.estado === 'disponible' && turno.horaInicio < this.hoy)) {
                    switch (turno.tipoTurno) {
                      case ('delDia'):
                        countBloques[indexBloque].delDia--;
                        break;
                      case ('programado'):
                        countBloques[indexBloque].delDia--;
                        break;
                      case ('profesional'):
                        countBloques[indexBloque].profesional--;
                        break;
                      case ('gestion'):
                        countBloques[indexBloque].gestion--;
                        break;
                      default:
                        this.delDiaDisponibles--;
                        break;
                    }
                  }

                });
                this.delDiaDisponibles = this.delDiaDisponibles + countBloques[indexBloque].delDia;
              });
              if (this.agenda.estado === 'Publicada') {
                this.estadoT = (this.delDiaDisponibles > 0) ? 'seleccionada' : 'noTurnos';
              }

            } else {
              // En caso contrario, se calculan  los contadores por separado
              this.agenda.bloques.forEach((bloque, indexBloque) => {

                countBloques.push({
                  // Asignamos a contadores dinamicos la cantidad inicial de c/u
                  // de los tipos de turno respectivamente
                  delDia: bloque.accesoDirectoDelDia,
                  programado: bloque.accesoDirectoProgramado,
                  gestion: bloque.reservadoGestion,
                  profesional: bloque.reservadoProfesional
                });

                bloque.turnos.forEach((turno) => {
                  if (turno.estado === 'asignado') {
                    switch (turno.tipoTurno) {
                      case ('delDia'):
                        countBloques[indexBloque].delDia--;
                        break;
                      case ('programado'):
                        countBloques[indexBloque].programado--;
                        break;
                      case ('profesional'):
                        countBloques[indexBloque].profesional--;
                        break;
                      case ('gestion'):
                        countBloques[indexBloque].gestion--;
                        break;
                    }
                  }
                });
                this.delDiaDisponibles = countBloques[indexBloque].delDia;
                this.programadosDisponibles = + countBloques[indexBloque].programado;
                this.gestionDisponibles = + countBloques[indexBloque].gestion;
              });
              if (this.agenda.estado === 'Disponible') {
                (this.gestionDisponibles > 0) ? this.estadoT = 'seleccionada' : this.estadoT = 'noTurnos';
              }
              if (this.agenda.estado === 'Publicada') {
                (this.programadosDisponibles > 0) ? this.estadoT = 'seleccionada' : this.estadoT = 'noTurnos';
              }
            }
            // contador de turnos por Bloque
            this.countBloques = countBloques;

            this.tipoPrestaciones = '';

            let tipoPrestacionesArray = [];

            if (this.agenda.tipoPrestaciones.length > 1) {
              this.agenda.tipoPrestaciones.forEach((cadaprestacion, ind) => {
                this.tipoPrestaciones = this.tipoPrestaciones ? this.tipoPrestaciones + '\n' + cadaprestacion.nombre : cadaprestacion.nombre;
                tipoPrestacionesArray.push({ nombre: cadaprestacion.nombre });
              });
            } else {
              this.tipoPrestaciones = this.agenda.tipoPrestaciones[0].nombre;
              this.turnoTipoPrestacion = this.agenda.tipoPrestaciones[0];
              tipoPrestacionesArray.push({ nombre: this.agenda.tipoPrestaciones[0].nombre });
            }
            this.tipoPrestacionesArray = tipoPrestacionesArray;

            // no hay turnos disponibles
          } else {

            /*Si no hay turnos disponibles, se muestran alternativas (para eso deben haber seteado algún filtro)*/
            this.estadoT = 'noTurnos';

            if (this.opciones.tipoPrestacion || this.opciones.profesional) {
              this.serviceAgenda.get({
                fechaDesde: moment(this.agenda.horaInicio).add(1, 'day').toDate(),
                idTipoPrestacion: this.opciones.tipoPrestacion ? this.opciones.tipoPrestacion.id : null,
                idProfesional: this.opciones.profesional ? this.opciones.profesional.id : null,
                estados: ['Disponible', 'Publicada']
              }).subscribe(alternativas => {
                this.alternativas = alternativas;
                this.reqfiltros = false;
              });
            } else {
              this.reqfiltros = true;
            }
          }
        }
      }
    });
  }

  seleccionarTurno(bloque: any, indice: number) {
    if (this.paciente) {
      this.bloque = bloque;
      this.indiceBloque = this.agenda.bloques.indexOf(this.bloque);
      this.indiceTurno = indice;
      this.turno = bloque.turnos[indice];
      if (this.bloque.tipoPrestaciones.length === 1) {
        this.turno.tipoPrestacion = this.bloque.tipoPrestaciones[0];
      }
      this.estadoT = 'confirmacion';
    } else {
      this.plex.alert('Seleccione un paciente');
    }
  }

  seleccionarBusqueda(indice: number) {
    this.opciones.tipoPrestacion = this.busquedas[indice].tipoPrestacion;
    this.opciones.profesional = this.busquedas[indice].profesional;
    this.actualizar('');
  }

  seleccionarAlternativa(indice: number) {
    this.seleccionarAgenda(this.alternativas[indice]);
  }

  seleccionarLlave(indice: number) {
    this.opciones.tipoPrestacion = this.llaves[indice].tipoPrestacion;
    this.actualizar('');
  }

  verAgenda(direccion: String) {
    if (this.agendas) {
      // Asegurar que no nos salimos del rango de agendas (agendas.length)
      let enRango = direccion === 'der' ? ((this.indice + 1) < this.agendas.length) : ((this.indice - 1) >= 0);
      if (enRango) {
        if (direccion === 'der') {
          this.indice++;
        } else {
          this.indice--;
        }
        this.agenda = this.agendas[this.indice];
        this.seleccionarAgenda(this.agenda);
      }
    }
  }

  cambiarMes(signo) {
    if (signo === '+') {
      this.opciones.fecha = moment(this.opciones.fecha).add(1, 'M').toDate();
    } else {
      this.opciones.fecha = moment(this.opciones.fecha).subtract(1, 'M').toDate();
    }
    this.actualizar('');
  }

  cambiarTelefono() {
    this.cambioTelefono = true;
  }

  primerSimultaneoDisponible(bloque: IBloque, turno: ITurno, indiceT: number) {
    return (indiceT - 1 < 0)
      || (turno.horaInicio.getTime() !== bloque.turnos[(indiceT - 1)].horaInicio.getTime())
      || ((turno.horaInicio.getTime() === bloque.turnos[(indiceT - 1)].horaInicio.getTime())
        && (bloque.turnos[(indiceT - 1)].estado !== 'disponible'));
  }

  getUltimosTurnos() {
    let ultimosTurnos = [];
    this.serviceAgenda.find(this.paciente.id).subscribe(agendas => {
      agendas.forEach((agenda, indexAgenda) => {
        agenda.bloques.forEach((bloque, indexBloque) => {
          bloque.turnos.forEach((turno, indexTurno) => {
            if (turno.paciente) {
              // TODO. agregar la condicion turno.asistencia
              if (turno.paciente.id === this.paciente.id) {
                ultimosTurnos.push({
                  tipoPrestacion: turno.tipoPrestacion.nombre,
                  horaInicio: moment(turno.horaInicio).format('L'),
                  estado: turno.estado,
                  organizacion: agenda.organizacion.nombre,
                  profesionales: agenda.profesionales
                });
              }
            }
          });
        });
      });
    });
    this.ultimosTurnos = ultimosTurnos;
  }

  /**
   *
   */
  onSave() {
    // Ver si cambió el estado de la agenda desde otro lado
    this.serviceAgenda.getById(this.agenda.id).subscribe(a => {

      if (a.estado !== 'Disponible' && a.estado !== 'Publicada') {

        this.plex.alert('Esta agenda ya no está disponible.');
        this.actualizar('sinFiltro');
        return false;

      } else {

        let estado: String = 'asignado';

        let pacienteSave = {
          id: this.paciente.id,
          documento: this.paciente.documento,
          apellido: this.paciente.apellido,
          nombre: this.paciente.nombre,
          telefono: this.telefono
        };

        this.agenda.bloques[this.indiceBloque].turnos[this.indiceTurno].estado = 'asignado';
        this.agenda.bloques[this.indiceBloque].cantidadTurnos = Number(this.agenda.bloques[this.indiceBloque].cantidadTurnos) - 1;

        let datosTurno = {
          idAgenda: this.agenda.id,
          idTurno: this.turno.id,
          idBloque: this.bloque.id,
          paciente: pacienteSave,
          tipoPrestacion: this.turnoTipoPrestacion,
          tipoTurno: this.tiposTurnosSelect
        };

        let operacion: Observable<any>;
        operacion = this.serviceTurno.save(datosTurno);
        operacion.subscribe(resultado => {
          this.estadoT = 'noSeleccionada';
          this.agenda = null;
          this.actualizar('sinFiltro');
          this.borrarTurnoAnterior();
          this.plex.alert('El turno se asignó correctamente');
        });


        // Guardar Prestación Paciente

        let nuevaPrestacion;
        this.paciente['_id'] = this.paciente.id;
        nuevaPrestacion = {
            paciente: this.paciente,
            solicitud: {
              tipoPrestacion: this.turnoTipoPrestacion,
              fecha: new Date(),
              listaProblemas: [],
              idTurno: this.turno.id,
            },
            estado: {
              timestamp: new Date(),
              tipo: 'pendiente'
            },
            ejecucion: {
              fecha: new Date(),
              evoluciones: []
            }
        };

        // TODO: Revisar alert
         this.servicioPrestacionPaciente.post(nuevaPrestacion).subscribe(prestacion => {
           this.plex.alert('prestacion paciente creada');
         });

        // });
        // Si cambió el teléfono lo actualizo en el MPI
        if (this.cambioTelefono) {
          let nuevoCel = {
            'tipo': 'celular',
            'valor': this.telefono,
            'ranking': 1,
            'activo': true,
            'ultimaActualizacion': new Date()
          };
          let mpi: Observable<any>;
          let flagTelefono = false;
          // Si tiene un celular en ranking 1 y activo cargado, se reemplaza el nro
          // sino, se genera un nuevo contacto
          if (this.paciente.contacto.length > 0) {
            this.paciente.contacto.forEach((contacto, index) => {
              if (contacto.tipo === 'celular') {
                contacto.valor = this.telefono;
                flagTelefono = true;
              }
            });
            if (!flagTelefono) {
              this.paciente.contacto.push(nuevoCel);
            }
          } else {
            this.paciente.contacto = [nuevoCel];
          }
          console.log(this.paciente.contacto);
          let cambios = {
            'op': 'updateContactos',
            'contacto': this.paciente.contacto
          };
          mpi = this.servicePaciente.patch(pacienteSave.id, cambios);
          mpi.subscribe(resultado => {

            if (resultado) {
              this.plex.alert('Se actualizó el numero de telefono');
            }
          });

        }
      };
    });
    this.buscarPaciente();
  }

  borrarTurnoAnterior() {
    if (this._reasignaTurnos) {
      let patch = {
        'op': 'reasignarTurno',
        'idAgenda': this._reasignaTurnos.idAgenda,
        'idTurno': this._reasignaTurnos.idTurno
      };

      this.serviceAgenda.patch(this._reasignaTurnos.idAgenda, patch).subscribe();
    }
  }

  buscarPaciente() {
    this.showDarTurnos = false;
    this.pacientesSearch = true;
  }

  public tieneTurnos(bloque: IBloque): boolean {
    let turnos = bloque.turnos;
    if (turnos.find(turno => turno.estado === 'disponible' && turno.horaInicio >= this.hoy)) {
      return true;
    } else {
      return false;
    }
  }

  afterCreateUpdate(paciente) {
    this.showCreateUpdate = false;
    this.showDarTurnos = true;
    if (paciente) {
      this.paciente = paciente;
      this.verificarTelefono(this.paciente);
    } else {
      this.buscarPaciente();
    }
  }

  onReturn(pacientes: IPaciente): void {
    if (pacientes.id) {
      this.paciente = pacientes;
      this.verificarTelefono(this.paciente);
      this.showDarTurnos = true;
      this.pacientesSearch = false;
      window.setTimeout(() => this.pacientesSearch = false, 100);
      this.getUltimosTurnos();
    } else {
      this.seleccion = pacientes;
      // this.verificarTelefono(this.seleccion);
      this.esEscaneado = true;
      this.escaneado.emit(this.esEscaneado);
      this.selected.emit(this.seleccion);
      this.pacientesSearch = false;
      this.showCreateUpdate = true;
    }
  }

  verificarTelefono(paciente: IPaciente) {
    // se busca entre los contactos si tiene un celular
    this.telefono = '';
    this.cambioTelefono = false;
    if (paciente.contacto) {
      if (paciente.contacto.length > 0) {
        paciente.contacto.forEach((contacto) => {
          if (contacto.tipo === 'celular') {
            this.telefono = contacto.valor;
          }
        });
      }
    }
  }

  noSeAsignaTurno() {
    let listaEspera: any;
    let operacion: Observable<IListaEspera>;
    let datosPrestacion = !this.opciones.tipoPrestacion ? null : {
      id: this.opciones.tipoPrestacion.id,
      nombre: this.opciones.tipoPrestacion.nombre
    };
    let datosProfesional = !this.opciones.profesional ? null : {
      id: this.opciones.profesional.id,
      nombre: this.opciones.profesional.nombre,
      apellido: this.opciones.profesional.apellido
    };
    let datosPaciente = !this.paciente ? null : {
      id: this.paciente.id,
      nombre: this.paciente.nombre,
      apellido: this.paciente.apellido,
      documento: this.paciente.documento
    };
    listaEspera = !this.agenda ? null : {
      fecha: this.agenda.horaInicio,
      estado: 'Demanda Rechazada',
      tipoPrestacion: datosPrestacion,
      profesional: datosProfesional,
      paciente: datosPaciente,
    };
    if (listaEspera !== null) {
      operacion = this.serviceListaEspera.post(listaEspera);
      operacion.subscribe();
    }
    this.buscarPaciente();
  }

  cancelar() {
    this.pacientesSearch = true;
    this.showDarTurnos = false;
  }

  redirect(pagina: string) {
    this.router.navigate(['./' + pagina]);
    return false;
  }

}
