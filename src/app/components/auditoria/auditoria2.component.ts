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
   styleUrls: ['auditoria.css']
})


export class Auditoria2Component implements OnInit {

  seleccionada = false;
  verDuplicados = false;
  posiblesDuplicados: any[];
  pacientesAudit: any[];
  pacientesSimilares: any[];
  pacienteSelected = {
    "documento": "36433556",
    "estado": "validado",
    "nombre": "MARCOS DANIEL",
    "apellido": "OSMAN",
    "sexo": "masculino",
    "genero": "masculino",
    "fechaNacimiento": moment("1991-08-07T00:00:00.000-03:00"),
    "matchSisa": "0.88",

  }


  pacientesVinculados = [{
    "seleccionado": false,
    "documento": "36433556",
    "estado": "temporal",
    "nombre": "MARCO",
    "apellido": "OSLAM",
    "sexo": "masculino",
    "genero": "masculino",
    "fechaNacimiento": moment("1991-08-07T00:00:00.000-03:00"),
    "matchSisa": "0.88",

  }]


  pacientesDesvinculados = [{
      "seleccionado": false,
      "documento": "36433556",
      "estado": "temporal",
      "nombre": "DANIEL ORLANDO",
      "apellido": "OSMANAN",
      "sexo": "masculino",
      "genero": "masculino",
      "fechaNacimiento": moment("1991-08-07T00:00:00.000-03:00"),
      "matchSisa": "0.88",

    }, {
      "seleccionado": false,
      "documento": "30096099",
      "estado": "validado",
      "nombre": "RRICHARD HORACIO",
      "apellido": "OSS",
      "sexo": "masculino",
      "genero": "masculino",
      "fechaNacimiento": moment("1983-10-27T00:00:00.000-03:00"),
      "matchSisa": "0.82",
    },
    {
      "seleccionado": false,
      "documento": "39682204",
      "estado": "temporal",
      "nombre": "MAURO LEANDRO",
      "apellido": "JARA",
      "sexo": "masculino",
      "genero": "masculino",
      "fechaNacimiento": moment("1996-06-21T00:00:00.000-03:00"),
      "matchSisa": "0.72",
    },
    {
      "seleccionado": false,
      "documento": "30096099",
      "estado": "validado",
      "nombre": "RICARDO DANIEL",
      "apellido": "LOPEZ",
      "sexo": "masculino",
      "genero": "masculino",
      "fechaNacimiento": moment("1983-10-27T00:00:00.000-03:00"),
      "matchSisa": "0.82",
    }
  ]

  constructor(
    private formBuilder: FormBuilder,
    private auditoriaService: AuditoriaService,
    private pacienteService: PacienteService,
    private plex: Plex,
  ) {}

  ngOnInit() {

  }


  vincularPaciente(pac: any) {
      this.plex.confirm(' Ud. está por vincular los registros del paciente seleccionado a:' + this.pacienteSelected.apellido +' '+ this.pacienteSelected.nombre  + '¿seguro desea continuar?').then((resultado) => {
      let rta = resultado;
      if (rta) {
        this.pacientesDesvinculados.splice(this.pacientesDesvinculados.indexOf(pac), 1);
        this.pacientesVinculados.push(pac);
      }
    });
  }

  vincularPacienteDrop(evt: any) {
    this.plex.confirm(' Ud. está por vincular los registros del paciente seleccionado a:' + this.pacienteSelected.apellido +' '+ this.pacienteSelected.nombre  + '¿seguro desea continuar?').then((resultado) => {
      let rta = resultado;
      if (rta) {
        this.pacientesDesvinculados.splice(this.pacientesDesvinculados.indexOf(evt.dragData), 1);
        this.pacientesVinculados.push(evt.dragData);
      }
    });
  }

  desvincularPaciente(pac: any) {

    this.plex.confirm('¿Está seguro que desea desvincular a este paciente?').then((resultado) => {
      let rta = resultado;
      if (rta) {
          debugger;
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
