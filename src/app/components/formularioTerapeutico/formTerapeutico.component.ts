import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { FormTerapeuticoService } from './../../services/formTerapeutico/formTerapeutico.service';

@Component({
selector: 'app-formTerapeutico',
templateUrl: './formTerapeutico.html',
styleUrls: ['./formTerapeutico.scss']
})
export class FormTerapeuticoComponent implements OnInit {

    public columnas = [
{
key: 'Sistema',
label: 'Sistema'},
{
key: 'funcion',
label: 'Función'},
{
key: 'grupoFarmacologico',
label: 'Grupo Farmacológico'},
{
key: 'nombre',
label: 'Nombre'},
{
key: 'conceptoSnomed',
label: 'Concepto SNOMED'}
];

    public sistemas = [
        { id: 'respiratorio', icon: 'pulmones-outline' },
        { id: 'vacunas', icon: 'vacuna', color: '#107CE6' },
        { id: 'gastrointestinal', icon: 'gastrointestinal-outline', color: '#0443BF' },
        { id: 'cardiovascular', icon: 'corazon-outline', color: '#5700FF' }, 
        { id: 'genitourinario', icon: 'riñones-outline', color: '#BA00FF' },
        { id: 'Antineoplasicos-einmunosupresores', icon: 'antineoplasicos', color: '#E6104E' },
        { id: 'endocrino', icon: 'garganta', color: '#FF00A4' },
        { id: 'anticonceptivos', icon: 'aco-outline', color: '#C54B8C' },
        { id: 'anestesicos', icon: 'anestesia', color: '#F4A47E' },
        { id: 'emergencias-toxicologicas', icon: 'toxi-emer', color: '#FFD400' }, 
        { id: 'analgesicos-puros', icon: 'frasco-outline', color: '#FF9D00' },
        { id: 'nervioso-central', icon: 'sist-nervioso', color: '#EE5A24' },
        { id: 'sanguineo', icon: 'uni-gota', color: '#FF0000' },
        { id: 'contraste-radiologicos', icon: 'rayos', color: '#96001C' },
        { id: 'antinflamatorios', icon: 'pildora', color: '#96001C' },
        { id: 'bloqueantes-neuromusculares', icon: 'bloqueante', color: '#897150' },
        { id: 'oftalmologico', icon: 'oftalmologico', color: '#4A5E18' },
    ];

    public sistemaSeleccionado: string = null;

  public funcion = [];
  public grupoFarmacologico = [];
  public medicamento = "";
  public conceptoSnomed = "";

   public opciones = [
        { id: 'a', nombre: 'alteradores de la motilidad intestinal' },
        { id: 'b', nombre: 'ablandadores fecales' },
        { id: 'c', nombre: 'antiulcerosos' },
        { id: 'd', nombre: 'antieméticos' },
        { id: 'e', nombre: 'enf inflamatorias intestinales' },
        { id: 'f', nombre: 'control hemorragia vericeal' },
        { id: 'g', nombre: 'tratamiento colestasis' }
    ];

public grupos = [
        { id: 'a', nombre: 'anticolinérgicos' },
        { id: 'b', nombre: 'procinéticos' },
        { id: 'c', nombre: 'laxantes' },
        { id: 'd', nombre: 'antidiarreicos' },
        { id: 'e', nombre: 'antagonistas h2' },
        { id: 'f', nombre: 'inhibidores de la bomba de protones' },
        { id: 'g', nombre: 'antiácidos no absorbibles' },
]


    constructor(private router: Router,
        private plex: Plex, public auth: Auth,
        public servicioFormTerapeutico: FormTerapeuticoService) { }



    ngOnInit() {}



}
