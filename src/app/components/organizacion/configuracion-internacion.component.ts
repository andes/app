import { Plex } from '@andes/plex';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SnomedService } from 'src/app/apps/mitos';
import { IMaquinaEstados } from 'src/app/apps/rup/mapa-camas/interfaces/IMaquinaEstados';
import { MaquinaEstadosHTTP } from 'src/app/apps/rup/mapa-camas/services/maquina-estados.http';
import { IOrganizacion } from 'src/app/interfaces/IOrganizacion';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { Auth } from '@andes/auth';

interface ICapaRef {
    id: string;
    nombre: string;
    activa?: boolean;
}
@Component({
    selector: 'configuracion-internacion',
    templateUrl: 'configuracion-internacion.html'
})

export class ConfiguracionInternacionComponent implements OnInit {
    @ViewChild('form', { static: true }) form: NgForm;

    private capasOrganizacionActual: IMaquinaEstados[] = [];
    public organizacionActual;
    public usaCapasUnificadas = false;
    public capasTotales: ICapaRef[] = [];
    public capaSelected: ICapaRef;
    public unidadesOrganizativas;
    public capaModel: IMaquinaEstados;
    private expression = '<<284548004'; // con esta query de snomed se traen todos los servicios
    public columns = [
        {
            key: 'registro',
            label: 'Registro',
            sorteable: false,
            opcional: false
        },
        {
            key: 'unidadOrganizativa',
            label: 'Unidad Organizativa',
            sorteable: false,
            opcional: false
        },
        {
            key: 'concepto',
            label: 'Concepto',
            sorteable: false,
            opcional: false
        },
        {
            key: 'acciones',
            label: 'Acciones',
            sorteable: false,
            opcional: false
        }
    ];

    constructor(
        private maquinaEstadosService: MaquinaEstadosHTTP,
        private organizacionService: OrganizacionService,
        private router: Router,
        private route: ActivatedRoute,
        public snomed: SnomedService,
        public auth: Auth,
        private plex: Plex
    ) {}

    ngOnInit() {
        const idOrganizacionActual = this.route.snapshot.params['id'];

        this.organizacionService.get({ internacionDefault : true }).pipe(
            switchMap(organizaciones => {
                if (!organizaciones[0]) {
                    return throwError('no hay organizacion por defecto');
                }
                return forkJoin([
                    this.maquinaEstadosService.get('internacion', undefined, idOrganizacionActual),
                    this.maquinaEstadosService.get('internacion', undefined, organizaciones[0].id),
                    this.organizacionService.getById(idOrganizacionActual)
                ]).pipe(
                    map(([capasOrgActual, capasOrgRef, orgActual]) => [capasOrgActual, capasOrgRef, orgActual, organizaciones[0]])
                );
            })
        ).subscribe(([capasOrgActual, capasOrgReferencia, orgActual, orgReferencia]: [IMaquinaEstados[], IMaquinaEstados[], IOrganizacion, IOrganizacion]) => {
            this.organizacionActual = orgActual;
            this.usaCapasUnificadas = orgActual.usaEstadisticaV2;
            this.capasTotales = capasOrgReferencia.map(capa => ({ id: capa.capa, nombre: capa.capa }))
                .sort((a, b) => a.nombre.localeCompare(b.nombre));

            /*  Se cargan las capas pre-existentes de la organizacion actual. Las capas no configuradas se completan
                con las correspondientes de la organizacion de referencia */
            this.capasTotales.forEach(capa => {
                const capaActual = capasOrgActual.find(c => c.capa === capa.nombre);
                if (capaActual) {
                    this.capasOrganizacionActual[capa.nombre] = capaActual;
                    capa.activa = true;
                } else {
                    this.capasOrganizacionActual[capa.nombre] = capasOrgReferencia.find(c => c.capa === capa.nombre);
                    this.capasOrganizacionActual[capa.nombre].organizacion = orgActual.id;
                    delete this.capasOrganizacionActual[capa.nombre].id;
                    delete this.capasOrganizacionActual[capa.nombre]._id;
                }
            });
            this.changeCapasActivas();
            // Se recuperan las UO del efector
            this.unidadesOrganizativas = orgActual.unidadesOrganizativas ? orgActual.unidadesOrganizativas : orgReferencia.unidadesOrganizativas;
        });
    }

    changeCapasActivas() {
        const estadistica = this.capasTotales.find(c => c.nombre === 'estadistica');
        const estadisticaV2 = this.capasTotales.find(c => c.nombre === 'estadistica-v2');
        if (estadistica.activa || estadisticaV2.activa) {
            estadistica.activa = !this.usaCapasUnificadas;
            estadisticaV2.activa = this.usaCapasUnificadas;
        }
    }

    changeCapa(capa: ICapaRef) {
        if (!capa.activa) {
            this.capaSelected = null;
            return;
        }
        this.capaSelected = capa;
        if (this.capaModel) {
            this.capasOrganizacionActual[this.capaModel.capa] = this.capaModel;
        }
        this.capaModel = this.capasOrganizacionActual[capa.id];
        this.capaModel.historialMedico = this.capaModel?.historialMedico || false;

        const estadoOcupado = this.capaModel?.estados.find(e => e.key === 'ocupada');

        estadoOcupado?.acciones.forEach((acc: any) => {
            acc.parametros.unidadOrganizativa = acc.parametros.unidadOrganizativa || [];
            const unidadOrg = acc.parametros.unidadOrganizativa[0];
            if (unidadOrg) {
                acc.parametros.unidadExceptuada = unidadOrg.substring(0, 1) === '!' || false;
                acc.parametros.unidadOrg = unidadOrg;
                if (acc.parametros.unidadExceptuada) {
                    acc.parametros.unidadOrg = unidadOrg.substring(1);
                }
            }
        });
    }

    // retorna true si existe algún campo sin completar
    campoFaltante() {
        return this.capasTotales.some(capa => {
            return this.capasOrganizacionActual[capa.id].estados[1].acciones?.some(accion => !accion.label || !accion.parametros.concepto);
        });
    }

    loadListadoUO(event) {
        if (event) {
            this.snomed.getQuery({ expression: this.expression }).subscribe(result => {
                this.form.control.markAllAsTouched(); // De otra forma no marca erróneos los campos que ya estaban vacíos.
                event.callback(result);
            });
        }
    }
    loadConceptos(event) {
        if (event.query) {
            this.snomed.get({
                search: event.query,
                semanticTag: ['procedimiento']
            }).subscribe(result => event.callback(result));
        } else {
            event.callback([]);
        }
    }

    nuevaAccion() {
        const nueva = {
            tipo: 'nuevo-registro',
            label: '',
            parametros: {
                unidadOrganizativa: [],
                concepto: null
            }
        };
        const estadoOcupado = this.capaModel.estados.find(e => e.key === 'ocupada');
        estadoOcupado.acciones.unshift(nueva);
    }

    deleteAccion(index) {
        const estadoOcupado = this.capaModel.estados.find(e => e.key === 'ocupada');
        estadoOcupado?.acciones.splice(index, 1);
    }

    volver() {
        this.router.navigate(['/tm/organizacion/']);
    }

    guardar(formValid) {
        if (!this.campoFaltante() && formValid) {
            // TODO: agregar propiedad 'activa' a las capas reales para poder inactivar una pre-existente en caso necesario
            const saveArray = this.capasTotales.filter(c => c.activa).map((c: any) => {
                const organizacionCapa = this.capasOrganizacionActual[c.id];
                const estadoOcupado = organizacionCapa.estados.find(e => e.key === 'ocupada');
                estadoOcupado?.acciones.map((acc: any) => {
                    const unidadOrg = acc.parametros.unidadOrg;
                    if (unidadOrg) {
                        if (acc.parametros.unidadExceptuada) {
                            acc.parametros.unidadOrganizativa[0] = `!${unidadOrg?.conceptId || unidadOrg}`;
                        } else {
                            acc.parametros.unidadOrganizativa[0] = unidadOrg?.conceptId || unidadOrg;
                        }
                    } else {
                        acc.parametros.unidadOrganizativa = [];
                    }
                    delete acc.parametros.unidadExceptuada;
                    delete acc.parametros.unidadOrg;
                });
                delete (organizacionCapa as any).updatedAt;
                delete (organizacionCapa as any).updatedBy;
                return this.maquinaEstadosService.save(organizacionCapa);
            });
            forkJoin(saveArray).subscribe(() => {
                this.plex.toast('success', 'Cambios guardados exitosamente');
                this.volver();
            }, error => {
                this.plex.info('danger', 'Ocurrió un error guardando los cambios');
            });
        } else {
            this.plex.info('warning', 'Existen campos incompletos. Revise todas las capas.');
        }
    }
}
