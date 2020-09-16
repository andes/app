import { Component, OnInit } from '@angular/core';
import { QueriesService } from '../../../../services/query.service';
import { Observable } from 'rxjs';
import { ProfesionalService } from '../../../../services/profesional.service';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { TipoPrestacionService } from '../../../../services/tipoPrestacion.service';


@Component({
  selector: 'app-bi-queries',
  templateUrl: './bi-queries.component.html',
  styleUrls: ['./bi-queries.component.scss']
})
export class BiQueriesComponent implements OnInit {

  public consultaSeleccionada;
  public opciones = [];
  public queries$: Observable<any>;
  public organizaciones$: Observable<any>;
  public argumentos;
  public argumentosSalida = [];
  public resultados;
  public mostrarSalida = false;
  public tipoPrestaciones;

  constructor(private queryService: QueriesService,
    private profesionalService: ProfesionalService,
    private auth: Auth,
    private router: Router,
    public servicioPrestacion: TipoPrestacionService
  ) { }

  ngOnInit() {
    if (!this.auth.check('visualizacionInformacion:biQueries')) {
      this.router.navigate(['./inicio']);
    }
    this.queries$ = this.queryService.getAllQueries({ desdeAndes: true });

  }

  getArgumentos() {
    if (this.consultaSeleccionada) {
      this.argumentos = this.consultaSeleccionada.argumentos;
      this.organizaciones$ = this.auth.organizaciones();
    }
  }

  loadProfesionales(event) {
    let listaProfesionales = [];
    if (event.query) {
      let query = {
        nombreCompleto: event.query
      };
      this.profesionalService.get(query).subscribe(resultado => {
        listaProfesionales = resultado;
        event.callback(listaProfesionales);
      });
    } else {
      event.callback(listaProfesionales);
    }
  }

  loadConceptosTurneables(event) {
    this.servicioPrestacion.get({ turneable: 1 }).subscribe(event.callback);
  }

  loadEstadosAgenda(event) {
    const estadosAgendas = [
      { id: 'planificacion', nombre: 'Planificación' },
      { id: 'disponible', nombre: 'Disponible' },
      { id: 'publicada', nombre: 'Publicada' },
      { id: 'suspendida', nombre: 'Suspendida' },
      { id: 'pausada', nombre: 'Pausada' },
      { id: 'pendienteAsistencia', nombre: 'Pendiente Asistencia' },
      { id: 'pendienteAuditoria', nombre: 'Pendiente Auditoría' },
      { id: 'auditada', nombre: 'Auditada' },
      { id: 'borrada', nombre: 'Borrada' }
    ];
    event.callback(estadosAgendas);
  }

  loadEstadosTurno(event) {
    const estadosTurnos = [
      { id: 'disponible', nombre: 'Disponible' },
      { id: 'asignado', nombre: 'Asignado' },
      { id: 'suspendido', nombre: 'Suspendido' },
      { id: 'turnoDoble', nombre: 'Turno Doble' }
    ];
    event.callback(estadosTurnos);
  }

  descargar() {
    let resultado = this.queries$.find(query => query.nombre === this.consultaSeleccionada.nombre);
    if (resultado) {
      const params = {};

      this.argumentos.forEach(arg => {
        const key = arg.key;
        const valor = this.argumentos[key];
        params[key] = valor;
        if (valor instanceof Date) {
          params[key] = moment(valor).format();
        } else {
          if (valor && valor.id) {
            params[key] = valor.id;
          } else if (valor === undefined && arg.tipo === 'salida') {
            params[key] = arg.check;
          }
        }
      });
      this.queryService.descargarCsv(this.consultaSeleccionada.nombre, params).subscribe();
    }
  }
}
