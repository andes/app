import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { HomeComponent } from './login/home.component';

import { PortalPacienteComponent } from './portal-paciente/portal-paciente.component';
import { MiHudsComponent } from './portal-paciente/portal-paciente-main/mi-huds/mi-huds.component';
import { MisVacunasComponent } from './portal-paciente/portal-paciente-main/mis-vacunas/mis-vacunas.component';
import { MisLaboratoriosComponent } from './portal-paciente/portal-paciente-main/mis-laboratorios/mis-laboratorios.component';
import { MisTurnosComponent } from './portal-paciente/portal-paciente-main/mis-turnos/mis-turnos.component';
import { MisFamiliaresComponent } from './portal-paciente/portal-paciente-main/mis-familiares/mis-familiares.component';
import { MisProblemasComponent } from './portal-paciente/portal-paciente-main/mis-problemas/mis-problemas.component';
import { MisPrescripcionesComponent } from './portal-paciente/portal-paciente-main/mis-prescripciones/mis-prescripciones.component';
import { MisConsultasComponent } from './portal-paciente/portal-paciente-main/mis-consultas/mis-consultas.component'
import { MiEquipoComponent } from './portal-paciente/portal-paciente-main/mi-equipo/mi-equipo.component';
import { MisMensajesComponent } from './portal-paciente/portal-paciente-main/mis-mensajes/mis-mensajes.component';
import { MisOrganizacionesComponent } from './portal-paciente/portal-paciente-main/mis-organizaciones/mis-organizaciones.component';
import { MisDocumentosComponent } from './portal-paciente/portal-paciente-main/mis-documentos/mis-documentos.component';
import { MisSolicitudesComponent } from './portal-paciente/portal-paciente-main/mis-solicitudes/mis-solicitudes.component';

import { DetalleVacunaComponent } from './portal-paciente/portal-paciente-sidebar/detalle-vacuna/detalle-vacuna.component';
import { DetalleLaboratorioComponent } from './portal-paciente/portal-paciente-sidebar/detalle-laboratorio/detalle-laboratorio.component';
import { DetalleTurnoComponent } from './portal-paciente/portal-paciente-sidebar/detalle-turno/detalle-turno.component';
import { DetalleHudsComponent } from './portal-paciente/portal-paciente-sidebar/detalle-huds/detalle-huds.component';
import { DetalleFamiliarComponent } from './portal-paciente/portal-paciente-sidebar/detalle-familiar/detalle-familiar.component';
import { DetalleProblemaComponent } from './portal-paciente/portal-paciente-sidebar/detalle-problema/detalle-problema.component';
import { DetallePrescripcionComponent } from './portal-paciente/portal-paciente-sidebar/detalle-prescripcion/detalle-prescripcion.component';
import { DetalleConsultaComponent } from './portal-paciente/portal-paciente-sidebar/detalle-consulta/detalle-consulta.component';
import { DetalleProfesionalComponent } from './portal-paciente/portal-paciente-sidebar/detalle-profesional/detalle-profesional.component';
import { DetalleMensajeComponent } from './portal-paciente/portal-paciente-sidebar/detalle-mensaje/detalle-mensaje.component';
import { DetalleOrganizacionComponent } from './portal-paciente/portal-paciente-sidebar/detalle-organizacion/detalle-organizacion.component';
import { DetalleSolicitudComponent } from './portal-paciente/portal-paciente-sidebar/detalle-solicitud/detalle-solicitud.component';

const appRoutes: Routes = [
  {
    path: 'portal-paciente', component: PortalPacienteComponent,

    children: [
      { path: 'miHuds', component: MiHudsComponent, outlet: 'listado' },
      { path: ':id', component: DetalleHudsComponent, outlet: 'detalleHuds' },

      { path: 'misVacunas', component: MisVacunasComponent, outlet: 'listado' },
      { path: ':id', component: DetalleVacunaComponent, outlet: 'detalleVacuna' },

      { path: 'misLaboratorios', component: MisLaboratoriosComponent, outlet: 'listado' },
      { path: ':id', component: DetalleLaboratorioComponent, outlet: 'detalleLaboratorio' },

      { path: 'misTurnos', component: MisTurnosComponent, outlet: 'listado' },
      { path: ':id', component: DetalleTurnoComponent, outlet: 'detalleTurno' },

      { path: 'misFamiliares', component: MisFamiliaresComponent, outlet: 'listado' },
      { path: ':id', component: DetalleFamiliarComponent, outlet: 'detalleFamiliar' },

      { path: 'misProblemas', component: MisProblemasComponent, outlet: 'listado' },
      { path: ':id', component: DetalleProblemaComponent, outlet: 'detalleProblema' },

      { path: 'misPrescripciones', component: MisPrescripcionesComponent, outlet: 'listado' },
      { path: ':id', component: DetallePrescripcionComponent, outlet: 'detallePrescripcion' },

      { path: 'misConsultas', component: MisConsultasComponent, outlet: 'listado' },
      { path: ':id', component: DetalleConsultaComponent, outlet: 'detalleConsulta' },

      { path: 'miEquipo', component: MiEquipoComponent, outlet: 'listado' },
      { path: ':id', component: DetalleProfesionalComponent, outlet: 'detalleProfesional' },

      { path: 'misMensajes', component: MisMensajesComponent, outlet: 'listado' },
      { path: ':id', component: DetalleMensajeComponent, outlet: 'detalleMensaje' },

      { path: 'misOrganizaciones', component: MisOrganizacionesComponent, outlet: 'listado' },
      { path: ':id', component: DetalleOrganizacionComponent, outlet: 'detalleOrganizacion' },

      { path: 'misSolicitudes', component: MisSolicitudesComponent, outlet: 'listado' },
      { path: ':id', component: DetalleSolicitudComponent, outlet: 'detalleSolicitud' },

      { path: 'misDocumentos', component: MisDocumentosComponent, outlet: 'listado' },
    ]
  },
  { path: '', component: HomeComponent },
];

export const appPortalRoutingProviders: any[] = [];
export const appPortalRouting: ModuleWithProviders = RouterModule.forRoot(appRoutes,
  { enableTracing: true });

export class AppRoutingModule { }
