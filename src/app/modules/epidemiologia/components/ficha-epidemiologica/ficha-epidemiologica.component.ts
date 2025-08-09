import moment from 'moment';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { FormsService } from '../../../forms-builder/services/form.service';
import { FormsEpidemiologiaService } from '../../services/ficha-epidemiologia.service';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { SnomedService } from 'src/app/apps/mitos/services/snomed.service';
import { cache } from '@andes/shared';
import { ModalMotivoAccesoHudsService } from 'src/app/modules/rup/components/huds/modal-motivo-acceso-huds.service';

@Component({
    selector: 'app-ficha-epidemiologica',
    templateUrl: './ficha-epidemiologica.component.html'
})
export class FichaEpidemiologicaComponent implements OnInit, OnDestroy {
    fichaSelected = {};
    itemsDropdownFichas = [];
    public showFicha = null;
    public showLabel = true;
    public selectedForm = {};
    public pacienteSelected = null;
    public pacienteRup: IPaciente;
    public resultadoBusqueda = null;
    public fichasPaciente: Observable<any>;
    public fichaPaciente$: Observable<any>;
    public permisoHuds = false;
    public puedeEditar: boolean;
    public puedeCrear: boolean;
    public puedeVer: boolean;
    public editFicha = false;
    public botonRup = false;

    public columns = [
        {
            key: 'fecha',
            label: 'Fecha'
        },
        {
            key: 'nombre',
            label: 'Nombre'
        },
        {
            key: 'acciones',
            label: 'Acciones'
        }
    ];

    constructor(
        private plex: Plex,
        private formsService: FormsService,
        private formEpidemiologiaService: FormsEpidemiologiaService,
        private router: Router,
        private auth: Auth,
        private snomedService: SnomedService,
        private motivoAccesoService: ModalMotivoAccesoHudsService
    ) { }

    ngOnInit(): void {
        if (!this.auth.getPermissions('epidemiologia:?').length) {
            this.router.navigate(['inicio']);
        }
        this.puedeEditar = this.auth.check('epidemiologia:update');
        this.puedeVer = this.auth.check('epidemiologia:read');
        this.puedeCrear = this.auth.check('epidemiologia:create');

        this.plex.updateTitle([
            { route: '/', name: 'EPIDEMIOLOGÍA' },
            { name: 'Ficha epidemiológica' }
        ]);


        this.pacienteRup = this.formEpidemiologiaService.getPaciente();
        if (this.pacienteRup) {
            this.botonRup = true;
            this.onSelect(this.pacienteRup);
        }

        this.formsService.search().subscribe(fichas => {
            fichas.forEach(element => {
                if (element.active) {
                    if (element.snomedCode) {
                        this.snomedService.getQuery({ expression: element.snomedCode }).subscribe(res => {
                            this.itemsDropdownFichas.push({
                                'label': res[0] ? res[0].fsn : element.name, handler: () => {
                                    this.selectedForm = element;
                                    this.mostrarFicha(element.name);
                                }
                            });
                        });
                    } else {
                        this.itemsDropdownFichas.push({
                            'label': element.name, handler: () => {
                                this.selectedForm = element;
                                this.mostrarFicha(element.name);
                            }
                        });
                    }
                }

            });
        });
        this.permisoHuds = this.auth.check('huds:visualizacionHuds');
    }

    ruteo(id) {
        this.motivoAccesoService.getAccessoHUDS(this.pacienteSelected).subscribe(motivo => {
            if (motivo) {
                this.router.navigate(['/huds/paciente/', id]);
            }
        });
    }

    searchStart() {
        this.showLabel = false;
    }

    searchEnd(resultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
            return;
        }
        this.resultadoBusqueda = resultado.pacientes;
    }

    onSearchClear() {
        this.resultadoBusqueda = [];
        this.pacienteSelected = '';
        this.showLabel = true;
    }

    onSelect(paciente: IPaciente): void {
        if (paciente) {
            this.pacienteSelected = paciente;
            this.fichasPaciente = this.formEpidemiologiaService.search({ paciente: this.pacienteSelected._id }).pipe(
                cache()
            );
        }
    }

    mostrarFicha(nombreFicha, ficha?) {
        this.fichaPaciente$ = of(null);
        if (ficha) {
            this.fichaPaciente$ = of(ficha);
            this.getFicha(nombreFicha);
        } else {
            let check = true;
            this.fichasPaciente.subscribe(async fichas => {
                if (fichas.length) {
                    const fichasOrdenadas = fichas.sort((a, b) => b.createdAt - a.createdAt);
                    if (moment().diff(moment(fichasOrdenadas[0].createdAt), 'days') < 14) {
                        const respuesta = await this.plex.confirm('¿ Desea crear una ficha nueva de todas formas ?', `El paciente tiene una ficha registrada el día ${moment(fichasOrdenadas[0].createdAt).format('L')}`, 'Crear nueva ficha', 'Cancelar');
                        if (!respuesta) {
                            check = false;
                        }
                    }
                }
                if (check) {
                    this.getFicha(nombreFicha);
                }
            });
        }
    }

    getFicha(nombreFicha) {
        this.showFicha = nombreFicha;
        this.editFicha = true;
    }

    verFicha(ficha) {
        this.selectedForm['name'] = ficha.type.name;
        this.fichaPaciente$ = of(ficha);
        this.showFicha = ficha.type.name;
        this.editFicha = false;
    }

    volver() {
        this.showFicha = null;
        this.pacienteSelected = null;
        this.resultadoBusqueda = [];
    }

    volverRup() {
        this.router.navigate(['/rup']);
    }

    ngOnDestroy() {
        this.formEpidemiologiaService.setPaciente(null);
    }
}
