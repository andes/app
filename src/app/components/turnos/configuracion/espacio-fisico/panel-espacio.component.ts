import { IEspacioFisico } from './../../../../interfaces/turnos/IEspacioFisico';
import { Plex } from '@andes/plex';
import { Component, OnInit, Input } from '@angular/core';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import * as moment from 'moment';
moment.locale('en');

@Component({
    selector: 'app-panel-espacio',
    templateUrl: 'panel-espacio.html'
})

export class PanelEspacioComponent implements OnInit {
    // private _agenda: any;
    public unidad = 60; // unidad horaria minima (en minutos)
    public fecha: Date;
    public inicio: any;
    public fin: any;
    public horarios: any[] = [];
    public agendas: any[];
    public sinConsultorio: any[];
    public colores: any[];
    private espacios: any[] = [];
    private espacioSeleccionados: any[];
    public agenda: any;
    public agendaSel: any = null;
    private ancho: String = '';
    public agendasModificar: any[] = [];
    constructor(private serviceAgenda: AgendaService, private serviceEspacio: EspacioFisicoService, public plex: Plex) { }

    ngOnInit() {
        this.colores = ['#FF9999', '#FFCC99', '#FFFF99', '#CCFF99', '#99FF99', '#99FFFF', '#99CCFF', '#9999FF', '#CC99FF',
            '#FF99FF', '#FF99CC', '#E0E0E0', '#CCCC00'];
        this.loadEspacios();
        this.espacioSeleccionados = [];
    }

    loadEspacios() {
        this.serviceEspacio.get({}).subscribe(espacios => {
            this.espacios = espacios.map(function (obj) {
                return { id: obj.id, nombre: obj.nombre };
            });
            this.ancho = String(this.espacios.length + 1) + '%';
        });
    }

    buscarAgendas() {
        let params = {
            fechaDesde: this.fecha.setHours(0, 0, 0, 0),
            fechaHasta: this.fecha.setHours(23, 59, 0, 0),
        };
        this.serviceAgenda.get(params).subscribe(
            agendas => {
                this.agendas = agendas.filter(function (value) {
                    return (value.espacioFisico);
                });
                this.sinConsultorio = agendas.filter(function (value) {
                    return (!value.espacioFisico);
                });
                this.llenarConsultorios();
            },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    llenarConsultorios() {
        this.horarios = [];
        this.inicio = new Date(this.fecha.setHours(8, 0, 0, 0));
        let inicioM = moment(this.inicio);
        this.fin = new Date(this.fecha.setHours(22, 0, 0, 0));
        let diferencia = (this.fin.getTime() - this.inicio.getTime()) / 60000;
        let cantidadBloques = diferencia / this.unidad;
        this.sinConsultorio.forEach((unconsul, index) => {
            unconsul.color = this.colores[index + this.agendas.length];
        });

        for (let j = 0; j < cantidadBloques; j++) {
            let lista = [];
            for (let i = 0; i < this.espacios.length; i++) {
                let bandera = false;
                for (let k = 0; k < this.agendas.length; k++) {
                    this.agenda = this.agendas[k];
                    this.agenda.color = this.colores[k];
                    if (!this.agenda.rows) {
                        this.agenda.rows = moment(this.agenda.horaFin).diff(this.agenda.horaInicio, 'm') / this.unidad;
                    }
                    if (inicioM.isBetween(this.agenda.horaInicio, this.agenda.horaFin, null, '[)') &&
                        this.agenda.espacioFisico._id === this.espacios[i].id) {
                        bandera = true;
                        break;
                    }
                };
                if (bandera) {
                    let elto = {
                        agenda: this.agenda,
                        espacio: this.espacios[i]
                    };
                    if (this.agenda.rows > 1 && !this.agenda.saltear) {
                        lista.push(elto);
                        this.agenda.saltear = true;
                    }
                } else {
                    let elto = {
                        agenda: '',
                        espacio: this.espacios[i]
                    };
                    lista.push(elto);
                }
            }
            let elemento = {
                hora: inicioM.format('HH:mm'),
                lista: lista.sort(
                    function (a, b) {
                        return a.espacio.nombre - b.espacio.nombre;
                    }
                )
            };
            this.horarios.push(elemento);
            inicioM.add(this.unidad, 'm');
        }
        // console.log('horarios ', this.horarios);
    }

    public seleccionarAgenda(agenda) {
        if (this.agendaSel) {
            this.agendaSel = null;
            this.sinConsultorio.forEach((unconsul) => {
                unconsul.seleccionada = false;
            });
        }
        if (this.espacioSeleccionados[0]) {
            this.espacioSeleccionados[0].seleccionado = false;
        }

        this.espacioSeleccionados = [];
        agenda.seleccionada = !agenda.seleccionada;
        this.agendaSel = agenda;
    }

    public seleccionarEspacio(espacio) {
        let arrayTemp = this.horarios.map(elem => { return elem.hora; });
        let i1Horarios: number;
        let i2Horarios: number;
        let bandera = true;
        let rows = 0;
        if (!espacio.seleccionado) {
            if (this.espacioSeleccionados.length === 0) {
                espacio.seleccionado = true;
                this.espacioSeleccionados.push(espacio);
                i1Horarios = arrayTemp.indexOf(moment(this.agendaSel.horaInicio).format('HH:mm'));
                i2Horarios = arrayTemp.indexOf(moment(this.agendaSel.horaFin).format('HH:mm'));
                for (let i = i1Horarios; i < i2Horarios; i++) {
                    let ind = this.horarios[i].lista.map(function (obj) {
                        return obj.espacio.id;
                    }).indexOf(espacio.id);
                    bandera = bandera && (this.horarios[i].lista[ind].agenda === '');
                    rows++;
                }
                // Si el consultorio tiene el intervalo de la agenda libre
                if (bandera) {
                    this.sinConsultorio.splice(this.sinConsultorio.indexOf(this.agendaSel), 1);
                    this.agendaSel.rows = rows;
                    // espacio.seleccionado = false;
                    this.agendaSel.espacioFisico = espacio;
                    let indice = this.agendasModificar.map(
                        function (obj) {
                            return obj.id;
                        }
                    ).indexOf(this.agendaSel.id);
                    if (indice >= 0) {
                        this.agendasModificar[indice].espacioFisico = espacio;
                    } else {
                        this.agendasModificar.push({ id: this.agendaSel.id, espacioFisico: espacio });
                    }
                    //this.agendasModificar.push({ id: this.agendaSel.id, espacioFisico: espacio });
                    for (let i = i1Horarios; i < i2Horarios; i++) {
                        let ind = this.horarios[i].lista.map(function (obj) {
                            return obj.espacio.id;
                        }).indexOf(espacio.id);
                        if (this.agendaSel.rows > 1 && !this.agendaSel.saltear) {
                            this.horarios[i].lista[ind].agenda = this.agendaSel;
                            this.agendaSel.saltear = true;
                        } else {
                            if (this.agendaSel.rows > 1 && this.agendaSel.saltear) {
                                let lista = this.horarios[i].lista;
                                lista.splice(ind, 1);
                            }
                        }
                    }
                }
            }
        } else {
            this.espacioSeleccionados.splice(this.espacioSeleccionados.indexOf(espacio));
            espacio.seleccionado = false;
        }
    }

    eliminar(agenda, horario, indiceConsultorio) {
        let filas = agenda.rows;
        let ef = agenda.espacioFisico;
        agenda.saltear = false;
        agenda.espacioFisico = null;
        agenda.rows = 0;
        agenda.seleccionada = null;
        this.sinConsultorio.push(agenda);
        let indice = this.agendasModificar.map(
            function (obj) {
                return obj.id;
            }
        ).indexOf(agenda.id);
        if (indice >= 0) {
            this.agendasModificar[indice].espacioFisico = null;
        } else {
            this.agendasModificar.push({ id: agenda.id, espacioFisico: null });
        }
        let indiceHorarios = this.horarios.indexOf(horario);
        let ii = this.horarios[indiceHorarios].lista.map(function (obj) {
            return obj.espacio.id;
        }).indexOf(ef.id);
        ef.seleccionado = false;
        this.horarios[indiceHorarios].lista[ii].agenda = '';
        for (let i = 1; i < filas; i++) { //
            this.horarios[indiceHorarios + i].lista.push({
                agenda: '',
                espacio: ef
            });
            this.horarios[indiceHorarios + i].lista = this.horarios[indiceHorarios + i].lista.sort(function (a, b) {
                { return (a.espacio.nombre > b.espacio.nombre) ? 1 : ((b.espacio.nombre > a.espacio.nombre) ? -1 : 0); }
            });
        }
    }

    confirmar() { // TODO: verificar mensaje de ok
        let band = true;
        for (let i = 0; i < this.agendasModificar.length; i++) {
            let espacio = this.agendasModificar[i].espacioFisico ?
                { _id: this.agendasModificar[i].espacioFisico.id, nombre: this.agendasModificar[i].espacioFisico.nombre } : null;
            let patch = {
                'op': 'editarAgenda',
                'espacioFisico': espacio
            };
            console.log('patch ', patch);
            console.log('idAgenda ', this.agendasModificar[i].id);
            this.serviceAgenda.patch(this.agendasModificar[i].id, patch).subscribe(resultado => {
                band = true;
            }, err => {
                if (err) {
                    console.log(err);
                }
            });
        }
        if (band) {
            this.plex.alert('Los cambios se guardaron correctamente');
        }
    }
}
