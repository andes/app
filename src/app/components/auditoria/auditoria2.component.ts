import { AuditoriaPorBloqueComponent } from './auditoriaPorBloque.component';
import {
  Plex
} from '@andes/plex';
import {
  Component,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {
  AuditoriaPorBloqueService
} from '../../services/auditoria/auditoriaPorBloque.service';
import {
  AuditoriaService
} from '../../services/auditoria/auditoria.service';
import {
  IAudit
} from '../../interfaces/auditoria/IAudit';
import {
  PacienteService
} from './../../services/paciente.service';
import * as moment from 'moment';
import {
  Ng2DragDropModule
} from 'ng2-drag-drop';


@Component({
  selector: 'auditoria2',
  templateUrl: 'auditoria2.html',
  styleUrls: ['auditoria2.css']
})


export class Auditoria2Component implements OnInit {

  seleccionada = false;
  verDuplicados = false;
  draggingPatient = true;

  //pacienteSelected: any;
  pacientesAudit: any[];
  pacientesVinculados = [];
  pacientesDesvinculados = [];

  // Lo dejamos hardcodeado, luego sería un input desde otro componente
  pacienteSelected : any = {
    "documento": "",
    "estado": "",
    "nombre": "",
    "apellido": "",
    "sexo": "",
    "genero": "",
    "fechaNacimiento": "",
    "estadoCivil": null,
    "activo": true,
  }


  constructor(
    private formBuilder: FormBuilder,
    private auditoriaService: AuditoriaService,
    private auditoriaPorBloqueService: AuditoriaPorBloqueService,
    private pacienteService: PacienteService,
    private plex: Plex,
  ) { }

  ngOnInit() {

    this.inicializar();
    
  }


  inicializar() {
    /* Ejecutar una consulta que obtenga un array con todos los pacientes que tienen la misma clave de blocking.
      Vamos a suponer que el paciente a buscar viene en un input desde otro componente.
    */
  this.pacienteService.getById('586e6e8527d3107fde11125d').subscribe(data => {
        if (data) {
          this.pacienteSelected = data;
          this.loadPacientePorBloque();
          /* Levanta todos los pacientes cuyos objectId están asociados al paciente seleccionado */
          this.loadPacientesVinculados();
        }
      })
  }

  loadPacientesVinculados(){
    let idVinculados = this.pacienteSelected.identificadores;
    idVinculados.forEach(identificador => {
      if (identificador.entidad === 'ANDES') {
        this.pacienteService.getById(identificador.valor).subscribe(pac => {
          this.pacientesVinculados.push(pac);
        })
      }
    });
  }

  loadPacientePorBloque() {
    // Obtenemos la lista de pacientes que tienen la misma clave de blocking y hardcodeamos el tipo de clave a METAPHONE Nombre + Apellido
     let tipoClave: number = 0;
     let dto: any = {
       idTipoBloque: tipoClave, 
       idBloque: this.pacienteSelected.claveBlocking[tipoClave].toString()
     };
     
    this.auditoriaPorBloqueService.getListaBloques(dto).subscribe(rta => {
      if (rta) {
        rta.forEach(element => {
          if (element.id !== this.pacienteSelected.id){
            this.pacientesDesvinculados.push(element)
          }
        });
      };
    })
  }

  arrastrandoPaciente(dragging) {
    this.draggingPatient = dragging;
  }

  /**
   * Función que realiza la vinculación desde clic en el clip
   * 
   * @param {*} pac 
   * @memberof Auditoria2Component
   */
  vincularPacienteClic(pac: any) {
    this.plex.confirm(' Ud. está por vincular los registros del paciente seleccionado a: ' + this.pacienteSelected.apellido + ' ' + this.pacienteSelected.nombre + ' ¿seguro desea continuar?').then((resultado) => {
      let rta = resultado;
      if (rta) {
        this.pacientesDesvinculados.splice(this.pacientesDesvinculados.indexOf(pac), 1);
        this.pacientesVinculados.push(pac);
        this.vincular(pac);
      }
    });
  }

  /**
   * Función que realiza la vinculación desde un Drag&Drop
   * 
   * @param {*} evt 
   * @memberof Auditoria2Component
   */
  vincularPacienteDrop(evt: any) {
    this.plex.confirm(' Ud. está por vincular los registros del paciente seleccionado a: ' + this.pacienteSelected.apellido + ' ' + this.pacienteSelected.nombre + ' ¿seguro desea continuar?').then((resultado) => {
      let rta = resultado;
      if (rta) {
        debugger;
        this.pacientesDesvinculados.splice(this.pacientesDesvinculados.indexOf(evt.dragData), 1);
        this.pacientesVinculados.push(evt.dragData);
        this.vincular(evt.dragData);
      }
    });
  }


  /**
   * Vincula el paciente seleccionado tanto por Drag&Drop como por el clic en el clip
   * 
   * @param {*} paciente : El paciente a vincualar
   * @memberof Auditoria2Component
   */
  vincular(paciente: any) {
    debugger;
    /* Acá hacemos el put con el update de los pacientes */
        let dataLink = {entidad:'ANDES', valor: paciente.id};
        this.pacienteService.patch(this.pacienteSelected.id, {'op': 'updateIdentificadores', 'dto': dataLink}).subscribe(resultado => {
          if (resultado) {
            let activo = false
            debugger;
            this.pacienteService.patch(paciente.id, {'op':'desactivarPaciente', 'dto':activo}).subscribe(resultado2 => {
              if (resultado2) {
                this.plex.toast('success','La vinculación ha sido realizada correctamente', 'Información', 3000);
              }
            })
          }
        })
  }

  desvincularPaciente(pac: any) {

    this.plex.confirm('¿Está seguro que desea desvincular a este paciente?').then((resultado) => {
      let rta = resultado;
      if (rta) {
        this.pacientesVinculados.splice(this.pacientesVinculados.indexOf(pac), 1);
        this.pacientesDesvinculados.push(pac);
      }
    });

  }

  verificaPaciente(paciente) {
    if (paciente.nombre && paciente.apellido && paciente.documento && paciente.fechaNacimiento && paciente.sexo) {

      let dto: any = {
        type: 'suggest',
        claveBlocking: 'documento',
        percentage: true,
        apellido: paciente.apellido.toString(),
        nombre: paciente.nombre.toString(),
        documento: paciente.documento.toString(),
        sexo: ((typeof paciente.sexo === 'string')) ? paciente.sexo : (Object(paciente.sexo).id),
        fechaNacimiento: paciente.fechaNacimiento
      };


    }
  }
}
