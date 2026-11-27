import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { dia, shapes } from '@joint/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

export type TipoSimbolo =
    | 'cuadrado'
    | 'circulo'
    | 'rombo'
    | 'rombo-desconocido'
    | 'embarazo'
    | 'perdida-espontanea'
    | 'perdida-voluntaria';

export type TipoRelacion =
    | 'matrimonio'
    | 'consanguinidad'
    | 'concubinato'
    | 'noviazgo'
    | 'separacion'
    | 'divorcio'
    | 'filial'
    | 'biologica'
    | 'muy-unida'
    | 'unida'
    | 'distante'
    | 'conflictiva';

export interface PersonaMeta {
    kind: 'persona';
    simbolo: TipoSimbolo;
    nombre: string;
    pronombre: string;
    anios: string;
    padecimiento: string;
    esIndice: boolean;
    fallecido: boolean;
    adoptado: boolean;
    rolEspecial: '' | 'D' | 'S';
}

export interface AgrupamientoMeta {
    kind: 'agrupamiento';
    permeable: boolean;
    etiqueta: string;
    ancho: number;
    alto: number;
}

export interface RelacionMeta {
    kind: 'relacion';
    tipo: TipoRelacion;
    etiqueta: string;
}

@Component({
    selector: 'rup-familiograma',
    templateUrl: 'familiograma.html',
    styleUrls: ['familiograma.scss']
})
@RupElement('FamiliogramaComponent')
export class FamiliogramaComponent extends RUPComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('paperContainer', { static: false }) paperContainer: ElementRef<HTMLDivElement>;

    private graph: dia.Graph;
    private paper: dia.Paper;
    private zoomLevel = 1;
    private isUpdatingFromInspector = false;

    public svgPreview: SafeHtml = null;
    public snapshotPreview: string = null;
    public observaciones = '';

    // Estado de herramienta activa
    public modoConectar = false;
    public origenConexion: dia.Cell = null;
    public tipoRelacionNueva: any = { id: 'matrimonio', nombre: 'Matrimonio (línea continua)' };

    // Selección actual para el inspector lateral
    public elementoSeleccionado: dia.Element = null;
    public enlaceSeleccionado: dia.Link = null;
    public personaForm: PersonaMeta = null;
    public agrupamientoForm: AgrupamientoMeta = null;
    public relacionForm: RelacionMeta = null;

    public opcionesSimbolo = [
        { id: 'cuadrado', nombre: 'Cuadrado (pene / testículos)' },
        { id: 'circulo', nombre: 'Círculo (vulva)' },
        { id: 'rombo', nombre: 'Rombo (intersex)' },
        { id: 'rombo-desconocido', nombre: 'Rombo ? (desconocidos)' },
        { id: 'embarazo', nombre: 'Embarazo en curso' },
        { id: 'perdida-espontanea', nombre: 'Pérdida gestacional espontánea' },
        { id: 'perdida-voluntaria', nombre: 'Pérdida gestacional voluntaria' }
    ];

    public opcionesPronombre = [
        { id: '', nombre: 'Sin especificar' },
        { id: 'él', nombre: '(él)' },
        { id: 'ella', nombre: '(ella)' },
        { id: 'elle', nombre: '(elle)' }
    ];

    public opcionesRolEspecial = [
        { id: '', nombre: 'Ninguno' },
        { id: 'D', nombre: 'D — Ovodonación / Espermodonación' },
        { id: 'S', nombre: 'S — Subrogación uterina' }
    ];

    public opcionesRelacion = [
        { id: 'matrimonio', nombre: 'Matrimonio (continua)' },
        { id: 'consanguinidad', nombre: 'Matrimonio consanguinidad (doble)' },
        { id: 'concubinato', nombre: 'Unión / Concubinato (discontinua)' },
        { id: 'noviazgo', nombre: 'Noviazgo (punteada)' },
        { id: 'separacion', nombre: 'Separación (/)' },
        { id: 'divorcio', nombre: 'Divorcio (//)' },
        { id: 'filial', nombre: 'Filiación / Adopción (continua)' },
        { id: 'biologica', nombre: 'Progenitores / Donación (discontinua)' },
        { id: 'muy-unida', nombre: 'Afectiva: Muy unida (triple)' },
        { id: 'unida', nombre: 'Afectiva: Unida (doble)' },
        { id: 'distante', nombre: 'Afectiva: Distante (punteada)' },
        { id: 'conflictiva', nombre: 'Afectiva: Conflictiva (zigzag)' }
    ];

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                version: 1,
                engine: 'jointjs',
                data: null,
                svg: '',
                observaciones: ''
            };
        }
        this.observaciones = this.registro.valor.observaciones || '';
        if (this.soloValores) {
            if (this.registro.valor.snapshot) {
                this.snapshotPreview = this.registro.valor.snapshot;
            }
            if (this.registro.valor.svg) {
                this.svgPreview = this.sanitazer.bypassSecurityTrustHtml(this.registro.valor.svg);
            }
        }
    }

    ngAfterViewInit() {
        if (this.soloValores) {
            return;
        }
        setTimeout(() => {
            this.initJointPaper();
        }, 0);
    }

    ngOnDestroy() {
        if (this.paper) {
            this.paper.remove();
            this.paper = null;
        }
    }

    private initJointPaper() {
        if (!this.paperContainer?.nativeElement) {
            return;
        }

        const namespace = shapes;
        this.graph = new dia.Graph({}, { cellNamespace: namespace });

        this.paper = new dia.Paper({
            el: this.paperContainer.nativeElement,
            model: this.graph,
            width: '100%',
            height: 520,
            gridSize: 10,
            drawGrid: {
                name: 'dot',
                args: { color: '#cbd5e1', thickness: 1.5 }
            },
            background: { color: '#ffffff' },
            cellViewNamespace: namespace,
            interactive: { linkMove: true, labelMove: true },
            defaultConnectionPoint: { name: 'boundary' }
        });

        // Cargar grafo existente o inicializar con paciente índice
        if (this.registro.valor?.data?.cells?.length) {
            this.restaurarGrafoDesdeDatos(this.registro.valor.data);
            this.resetZoom();
            this.syncSvgAndPersist(false);
        } else {
            this.agregarPacienteIndiceInicial();
        }

        // Eventos de interacción
        this.paper.on('element:pointerclick', (elementView: dia.ElementView) => {
            const element = elementView.model;
            const meta = element.get('familiogramaMeta');

            if (this.modoConectar && meta?.kind === 'persona') {
                this.manejarClickConexion(element);
                return;
            }
            this.seleccionarElemento(element);
        });

        this.paper.on('link:pointerclick', (linkView: dia.LinkView) => {
            if (this.modoConectar) {
                this.manejarClickConexionEnlace(linkView.model);
                return;
            }
            this.seleccionarEnlace(linkView.model);
        });

        this.paper.on('blank:pointerclick', () => {
            this.limpiarSeleccion();
        });

        this.graph.on('change:position add remove', () => {
            if (!this.isUpdatingFromInspector) {
                this.syncSvgAndPersist(true);
            }
        });
    }

    private agregarPacienteIndiceInicial() {
        const nombrePaciente = this.paciente
            ? `${this.paciente.alias || this.paciente.nombre || ''} ${this.paciente.apellido || ''}`.trim()
            : 'Paciente índice';
        const anioNac = this.paciente?.fechaNacimiento
            ? `${new Date(this.paciente.fechaNacimiento).getFullYear()} -`
            : '';
        let simboloInicial: TipoSimbolo = 'rombo';
        if (this.paciente?.sexo === 'masculino') {
            simboloInicial = 'cuadrado';
        } else if (this.paciente?.sexo === 'femenino') {
            simboloInicial = 'circulo';
        }

        this.crearNodoPersona(280, 220, {
            kind: 'persona',
            simbolo: simboloInicial,
            nombre: nombrePaciente || 'Paciente índice',
            pronombre: '',
            anios: anioNac,
            padecimiento: '',
            esIndice: true,
            fallecido: false,
            adoptado: false,
            rolEspecial: ''
        });
    }

    public agregarPersona(simbolo: TipoSimbolo) {
        const offset = (this.graph.getElements().length % 6) * 30;
        const el = this.crearNodoPersona(120 + offset, 120 + offset, {
            kind: 'persona',
            simbolo,
            nombre: '',
            pronombre: '',
            anios: '',
            padecimiento: '',
            esIndice: false,
            fallecido: false,
            adoptado: false,
            rolEspecial: ''
        });
        this.seleccionarElemento(el);
    }

    public agregarAgrupamiento(permeable: boolean) {
        const meta: AgrupamientoMeta = {
            kind: 'agrupamiento',
            permeable,
            etiqueta: permeable ? 'Convivientes (+ permeable)' : 'Convivientes (- permeable)',
            ancho: 260,
            alto: 170
        };

        const rect = new shapes.standard.Rectangle({
            position: { x: 160, y: 140 },
            size: { width: meta.ancho, height: meta.alto },
            attrs: {
                body: {
                    fill: 'rgba(14, 165, 233, 0.04)',
                    stroke: '#334155',
                    strokeWidth: 1.8,
                    rx: 12,
                    ry: 12,
                    strokeDasharray: permeable ? '8 5' : 'none'
                },
                label: {
                    text: meta.etiqueta,
                    fill: '#475569',
                    fontSize: 11,
                    refY: '100%',
                    refY2: 14,
                    textVerticalAnchor: 'top'
                }
            }
        });
        rect.set('familiogramaMeta', meta);
        rect.addTo(this.graph);
        rect.toBack();
        this.seleccionarElemento(rect);
        this.syncSvgAndPersist(true);
    }

    private crearNodoPersona(x: number, y: number, meta: PersonaMeta, id?: string): dia.Element {
        const config: any = {
            position: { x, y },
            size: { width: 54, height: 54 },
            markup: [
                { tagName: 'path', selector: 'brackets' },
                { tagName: 'path', selector: 'body' },
                { tagName: 'path', selector: 'innerRing' },
                { tagName: 'path', selector: 'deceasedLine' },
                { tagName: 'text', selector: 'centerSymbol' },
                { tagName: 'text', selector: 'nameLabel' },
                { tagName: 'text', selector: 'yearsLabel' },
                { tagName: 'text', selector: 'healthLabel' }
            ]
        };
        if (id) {
            config.id = id;
        }
        const node = new shapes.standard.Path(config);

        node.set('familiogramaMeta', meta);
        this.aplicarEstiloPersona(node, meta);
        node.addTo(this.graph);
        if (!this.isUpdatingFromInspector) {
            this.syncSvgAndPersist(true);
        }
        return node;
    }

    private restaurarGrafoDesdeDatos(data: any) {
        const cells: any[] = data?.cells || [];
        const tieneMeta = cells.some(c => c?.familiogramaMeta?.kind);
        if (!tieneMeta) {
            this.graph.fromJSON(data);
            return;
        }

        this.isUpdatingFromInspector = true;
        this.graph.clear();
        const celdasPorId = new Map<string, dia.Cell>();

        // 1. Restaurar agrupamientos (al fondo)
        for (const cell of cells) {
            if (cell?.familiogramaMeta?.kind === 'agrupamiento') {
                const meta: AgrupamientoMeta = { ...cell.familiogramaMeta };
                const pos = cell.position || { x: 160, y: 140 };
                const size = cell.size || { width: meta.ancho || 260, height: meta.alto || 170 };
                const rect = new shapes.standard.Rectangle({
                    id: cell.id,
                    position: { x: pos.x, y: pos.y },
                    size: { width: size.width, height: size.height },
                    attrs: {
                        body: {
                            fill: 'rgba(14, 165, 233, 0.04)',
                            stroke: '#334155',
                            strokeWidth: 1.8,
                            rx: 12,
                            ry: 12,
                            strokeDasharray: meta.permeable ? '8 5' : 'none'
                        },
                        label: {
                            text: meta.etiqueta || '',
                            fill: '#475569',
                            fontSize: 11,
                            refY: '100%',
                            refY2: 14,
                            textVerticalAnchor: 'top'
                        }
                    }
                });
                rect.set('familiogramaMeta', meta);
                rect.addTo(this.graph);
                rect.toBack();
                celdasPorId.set(String(cell.id), rect);
            }
        }

        // 2. Restaurar personas
        for (const cell of cells) {
            if (cell?.familiogramaMeta?.kind === 'persona') {
                const meta: PersonaMeta = { ...cell.familiogramaMeta };
                const pos = cell.position || { x: 120, y: 120 };
                const node = this.crearNodoPersona(pos.x, pos.y, meta, cell.id);
                celdasPorId.set(String(cell.id), node);
            }
        }

        // 3a. Restaurar vínculos entre personas (parejas, afectivas, persona -> hijo)
        const enlacesPendientes: any[] = [];
        for (const cell of cells) {
            if (cell?.familiogramaMeta?.kind === 'relacion') {
                const source = celdasPorId.get(String(cell.source?.id));
                const target = celdasPorId.get(String(cell.target?.id));
                if (source && target && source.isElement() && target.isElement()) {
                    const meta: RelacionMeta = { ...cell.familiogramaMeta };
                    const link = this.crearEnlace(source, target, meta, cell.id, false);
                    celdasPorId.set(String(cell.id), link);
                } else {
                    enlacesPendientes.push(cell);
                }
            }
        }

        // 3b. Restaurar vínculos que nacen desde otra línea (ej: línea de pareja -> hijo/a)
        for (const cell of enlacesPendientes) {
            const source = celdasPorId.get(String(cell.source?.id));
            const target = celdasPorId.get(String(cell.target?.id));
            if (source && target && target.isElement()) {
                const meta: RelacionMeta = { ...cell.familiogramaMeta };
                const link = this.crearEnlace(source, target, meta, cell.id, false);
                celdasPorId.set(String(cell.id), link);
            }
        }

        this.isUpdatingFromInspector = false;
    }

    private aplicarEstiloPersona(element: dia.Element, meta: PersonaMeta) {
        const isSolidBlack = meta.simbolo === 'perdida-espontanea';
        const isDashed = meta.simbolo === 'embarazo';
        const isCross = meta.simbolo === 'perdida-voluntaria';

        const outerPath = this.getPathPorSimbolo(meta.simbolo, false);
        const innerPath = meta.esIndice ? this.getPathPorSimbolo(meta.simbolo, true) : '';
        const deceasedPath = meta.fallecido ? 'M -6 60 L 60 -6' : '';
        const bracketsPath = meta.adoptado ? 'M -4 -4 L -12 -4 L -12 58 L -4 58 M 58 -4 L 66 -4 L 66 58 L 58 58' : '';

        let centerText = meta.rolEspecial || '';
        if (!centerText && meta.simbolo === 'rombo-desconocido') {
            centerText = '?';
        }

        const nombreConPronombre = meta.nombre
            ? (meta.pronombre ? `${meta.nombre} (${meta.pronombre})` : meta.nombre)
            : (meta.pronombre ? `(${meta.pronombre})` : '');

        element.attr({
            body: {
                d: outerPath,
                fill: isSolidBlack ? '#1e293b' : (isCross ? 'none' : '#ffffff'),
                stroke: '#1e293b',
                strokeWidth: isCross ? 3 : 2,
                strokeDasharray: isDashed ? '5 4' : 'none'
            },
            innerRing: {
                d: innerPath,
                fill: 'none',
                stroke: '#1e293b',
                strokeWidth: 1.5,
                display: meta.esIndice && !isSolidBlack && !isCross ? 'block' : 'none'
            },
            deceasedLine: {
                d: deceasedPath,
                fill: 'none',
                stroke: '#1e293b',
                strokeWidth: 2,
                display: meta.fallecido ? 'block' : 'none'
            },
            brackets: {
                d: bracketsPath,
                fill: 'none',
                stroke: '#1e293b',
                strokeWidth: 1.8,
                display: meta.adoptado ? 'block' : 'none'
            },
            centerSymbol: {
                text: centerText,
                fill: '#0f172a',
                fontSize: 16,
                fontWeight: 'bold',
                x: 27,
                y: 27,
                textAnchor: 'middle',
                textVerticalAnchor: 'middle'
            },
            nameLabel: {
                text: nombreConPronombre,
                fill: '#0f172a',
                fontSize: 12,
                fontWeight: 600,
                x: 27,
                y: -10,
                textAnchor: 'middle',
                textVerticalAnchor: 'bottom'
            },
            yearsLabel: {
                text: meta.anios || '',
                fill: '#475569',
                fontSize: 11,
                x: 62,
                y: 16,
                textAnchor: 'start',
                textVerticalAnchor: 'middle'
            },
            healthLabel: {
                text: meta.padecimiento || '',
                fill: '#0369a1',
                fontSize: 11,
                fontStyle: 'italic',
                x: 62,
                y: meta.anios ? 34 : 27,
                textAnchor: 'start',
                textVerticalAnchor: 'middle'
            }
        });
    }

    private getPathPorSimbolo(simbolo: TipoSimbolo, inner: boolean): string {
        if (!inner) {
            switch (simbolo) {
                case 'cuadrado':
                    return 'M 0 0 L 54 0 L 54 54 L 0 54 Z';
                case 'circulo':
                    return 'M 27 0 A 27 27 0 1 0 27 54 A 27 27 0 1 0 27 0 Z';
                case 'rombo':
                case 'rombo-desconocido':
                case 'embarazo':
                    return 'M 27 0 L 54 27 L 27 54 L 0 27 Z';
                case 'perdida-espontanea':
                    return 'M 27 10 L 46 44 L 8 44 Z';
                case 'perdida-voluntaria':
                    return 'M 14 14 L 40 40 M 40 14 L 14 40';
            }
        } else {
            switch (simbolo) {
                case 'cuadrado':
                    return 'M 6 6 L 48 6 L 48 48 L 6 48 Z';
                case 'circulo':
                    return 'M 27 6 A 21 21 0 1 0 27 48 A 21 21 0 1 0 27 6 Z';
                case 'rombo':
                case 'rombo-desconocido':
                case 'embarazo':
                    return 'M 27 7 L 47 27 L 27 47 L 7 27 Z';
                default:
                    return '';
            }
        }
    }

    // --- Conexiones / Vínculos ---

    public toggleModoConectar() {
        this.modoConectar = !this.modoConectar;
        this.origenConexion = null;
        if (this.modoConectar) {
            this.limpiarSeleccion();
        }
    }

    private manejarClickConexionEnlace(enlace: dia.Link) {
        const tipo: TipoRelacion = this.tipoRelacionNueva?.id || 'matrimonio';
        const esFiliacion = ['filial', 'biologica'].includes(tipo);
        if (!esFiliacion || this.origenConexion) {
            return;
        }
        // Permite seleccionar una línea de pareja como origen de un vínculo filial/biológico
        this.origenConexion = enlace;
    }

    private manejarClickConexion(elemento: dia.Element) {
        if (!this.origenConexion) {
            this.origenConexion = elemento;
            return;
        }
        if (this.origenConexion.id === elemento.id) {
            this.origenConexion = null;
            return;
        }
        const tipo: TipoRelacion = this.tipoRelacionNueva?.id || 'matrimonio';
        const link = this.crearEnlace(this.origenConexion, elemento, {
            kind: 'relacion',
            tipo,
            etiqueta: ''
        });
        this.origenConexion = null;
        this.modoConectar = false;
        this.seleccionarEnlace(link);
    }

    private crearEnlace(source: dia.Cell, target: dia.Element, meta: RelacionMeta, id?: string, persist = true): dia.Link {
        const config: any = {
            source: { id: source.id },
            target: { id: target.id }
        };
        if (id) {
            config.id = id;
        }
        const link = new shapes.standard.Link(config);
        link.set('familiogramaMeta', meta);
        this.aplicarEstiloEnlace(link, meta);
        link.addTo(this.graph);
        if (persist) {
            this.syncSvgAndPersist(true);
        }
        return link;
    }

    private aplicarEstiloEnlace(link: dia.Link, meta: RelacionMeta) {
        const esPareja = ['matrimonio', 'consanguinidad', 'concubinato', 'noviazgo', 'separacion', 'divorcio'].includes(meta.tipo);
        const esFiliacion = ['filial', 'biologica'].includes(meta.tipo);

        const sourceId = link.source().id;
        const targetId = link.target().id;
        const sourceCell = sourceId ? this.graph?.getCell(sourceId) : null;
        const origenEsEnlace = !!sourceCell && sourceCell.isLink();

        if (esPareja) {
            // Según Anexo (pág. 25): trazos horizontales que nacen desde abajo de ambos símbolos
            link.source({ id: sourceId, anchor: { name: 'bottom' } });
            link.target({ id: targetId, anchor: { name: 'bottom' } });
            link.router('manhattan', {
                step: 10,
                padding: 24,
                startDirections: ['bottom'],
                endDirections: ['bottom']
            });
            link.connector('rounded', { radius: 2 });
        } else if (esFiliacion) {
            // Filiación: nace desde el punto medio de la línea de pareja o desde abajo de la figura hacia arriba del hijo/a
            if (origenEsEnlace) {
                link.source({ id: sourceId, anchor: { name: 'connectionRatio', args: { ratio: 0.5 } } });
            } else {
                link.source({ id: sourceId, anchor: { name: 'bottom' } });
            }
            link.target({ id: targetId, anchor: { name: 'top' } });
            link.router('manhattan', {
                step: 10,
                padding: 14,
                startDirections: ['bottom'],
                endDirections: ['top']
            });
            link.connector('rounded', { radius: 2 });
        } else {
            // Relaciones afectivas: trazos directos entre símbolos
            link.source({ id: sourceId, anchor: { name: 'center' } });
            link.target({ id: targetId, anchor: { name: 'center' } });
            link.router('normal');
            link.connector(meta.tipo === 'conflictiva' ? 'jumpover' : 'normal');
        }

        let stroke = '#1e293b';
        let strokeWidth = 2;
        let strokeDasharray = 'none';
        let doubleLine = false;
        let markText = '';

        switch (meta.tipo) {
            case 'consanguinidad':
            case 'unida':
                doubleLine = true;
                strokeWidth = 6;
                break;
            case 'muy-unida':
                doubleLine = true;
                strokeWidth = 8;
                stroke = '#0f766e';
                break;
            case 'concubinato':
            case 'biologica':
                strokeDasharray = '7 5';
                break;
            case 'noviazgo':
            case 'distante':
                strokeDasharray = '3 4';
                stroke = '#475569';
                break;
            case 'separacion':
                markText = '/';
                break;
            case 'divorcio':
                markText = '//';
                break;
            case 'conflictiva':
                stroke = '#dc2626';
                strokeWidth = 2.5;
                strokeDasharray = '6 3 2 3';
                markText = '⚡';
                break;
        }

        link.attr({
            line: {
                stroke,
                strokeWidth,
                strokeDasharray,
                targetMarker: { type: 'none' }
            },
            wrapper: {
                stroke: doubleLine ? '#ffffff' : 'transparent',
                strokeWidth: doubleLine ? 2 : 10
            }
        });

        const labels: dia.Link.Label[] = [];
        if (markText) {
            labels.push({
                position: 0.5,
                attrs: {
                    text: {
                        text: markText,
                        fill: meta.tipo === 'conflictiva' ? '#dc2626' : '#0f172a',
                        fontSize: 15,
                        fontWeight: 'bold'
                    },
                    rect: {
                        fill: '#ffffff',
                        stroke: 'none',
                        refWidth: '120%',
                        refHeight: '110%'
                    }
                }
            });
        }
        if (meta.etiqueta) {
            labels.push({
                position: { distance: 0.5, offset: markText ? -18 : -12 },
                attrs: {
                    text: {
                        text: meta.etiqueta,
                        fill: '#334155',
                        fontSize: 11
                    },
                    rect: {
                        fill: '#ffffff',
                        fillOpacity: 0.85,
                        stroke: 'none'
                    }
                }
            });
        }
        link.labels(labels);
    }

    // --- Inspector / Selección ---

    private seleccionarElemento(element: dia.Element) {
        this.limpiarSeleccion();
        this.elementoSeleccionado = element;
        const meta = element.get('familiogramaMeta');
        if (meta?.kind === 'persona') {
            this.personaForm = { ...meta };
        } else if (meta?.kind === 'agrupamiento') {
            this.agrupamientoForm = { ...meta };
        }
    }

    private seleccionarEnlace(link: dia.Link) {
        this.limpiarSeleccion();
        this.enlaceSeleccionado = link;
        const meta = link.get('familiogramaMeta');
        if (meta?.kind === 'relacion') {
            this.relacionForm = { ...meta };
        }
    }

    public limpiarSeleccion() {
        this.elementoSeleccionado = null;
        this.enlaceSeleccionado = null;
        this.personaForm = null;
        this.agrupamientoForm = null;
        this.relacionForm = null;
    }

    public actualizarPersonaSeleccionada() {
        if (!this.elementoSeleccionado || !this.personaForm) {
            return;
        }
        this.isUpdatingFromInspector = true;
        const meta: PersonaMeta = {
            ...this.personaForm,
            simbolo: (this.personaForm.simbolo as any)?.id || this.personaForm.simbolo,
            pronombre: (this.personaForm.pronombre as any)?.id ?? this.personaForm.pronombre,
            rolEspecial: (this.personaForm.rolEspecial as any)?.id ?? this.personaForm.rolEspecial
        };
        this.elementoSeleccionado.set('familiogramaMeta', meta);
        this.aplicarEstiloPersona(this.elementoSeleccionado, meta);
        this.isUpdatingFromInspector = false;
        this.syncSvgAndPersist(true);
    }

    public actualizarAgrupamientoSeleccionado() {
        if (!this.elementoSeleccionado || !this.agrupamientoForm) {
            return;
        }
        this.isUpdatingFromInspector = true;
        const ancho = Math.max(120, Number(this.agrupamientoForm.ancho) || 240);
        const alto = Math.max(90, Number(this.agrupamientoForm.alto) || 160);
        const meta: AgrupamientoMeta = {
            ...this.agrupamientoForm,
            ancho,
            alto
        };
        this.elementoSeleccionado.set('familiogramaMeta', meta);
        this.elementoSeleccionado.resize(ancho, alto);
        this.elementoSeleccionado.attr({
            body: {
                strokeDasharray: meta.permeable ? '8 5' : 'none'
            },
            label: {
                text: meta.etiqueta || ''
            }
        });
        this.elementoSeleccionado.toBack();
        this.isUpdatingFromInspector = false;
        this.syncSvgAndPersist(true);
    }

    public actualizarEnlaceSeleccionado() {
        if (!this.enlaceSeleccionado || !this.relacionForm) {
            return;
        }
        this.isUpdatingFromInspector = true;
        const meta: RelacionMeta = {
            ...this.relacionForm,
            tipo: (this.relacionForm.tipo as any)?.id || this.relacionForm.tipo
        };
        this.enlaceSeleccionado.set('familiogramaMeta', meta);
        this.aplicarEstiloEnlace(this.enlaceSeleccionado, meta);
        this.isUpdatingFromInspector = false;
        this.syncSvgAndPersist(true);
    }

    public eliminarSeleccionado() {
        if (this.elementoSeleccionado) {
            this.elementoSeleccionado.remove();
            this.limpiarSeleccion();
            this.syncSvgAndPersist(true);
        } else if (this.enlaceSeleccionado) {
            this.enlaceSeleccionado.remove();
            this.limpiarSeleccion();
            this.syncSvgAndPersist(true);
        }
    }

    // --- Zoom & Plantilla de ejemplo ---

    public zoom(delta: number) {
        if (!this.paper) {
            return;
        }
        this.zoomLevel = Math.min(1.8, Math.max(0.5, this.zoomLevel + delta));
        this.paper.scale(this.zoomLevel, this.zoomLevel);
    }

    public resetZoom() {
        if (!this.paper || !this.graph) {
            return;
        }
        if (this.graph.getCells().length > 0) {
            this.paper.scaleContentToFit({
                padding: 35,
                minScale: 0.5,
                maxScale: 1.1,
                preserveAspectRatio: true
            });
            this.zoomLevel = this.paper.scale().sx;
        } else {
            this.zoomLevel = 1;
            this.paper.scale(1, 1);
            this.paper.translate(0, 0);
        }
    }

    public cargarEjemploAnexo() {
        this.graph.clear();
        this.limpiarSeleccion();

        const casa = new shapes.standard.Rectangle({
            position: { x: 60, y: 40 },
            size: { width: 470, height: 310 },
            attrs: {
                body: {
                    fill: 'rgba(14, 165, 233, 0.04)',
                    stroke: '#334155',
                    strokeWidth: 1.8,
                    rx: 14,
                    ry: 14,
                    strokeDasharray: '8 5'
                },
                label: {
                    text: 'Convivientes (+ permeable)',
                    fill: '#475569',
                    fontSize: 11,
                    refY: '100%',
                    refY2: 14,
                    textVerticalAnchor: 'top'
                }
            }
        });
        casa.set('familiogramaMeta', {
            kind: 'agrupamiento',
            permeable: true,
            etiqueta: 'Convivientes (+ permeable)',
            ancho: 470,
            alto: 310
        } as AgrupamientoMeta);
        casa.addTo(this.graph);

        const p1 = this.crearNodoPersona(130, 80, {
            kind: 'persona',
            simbolo: 'cuadrado',
            nombre: 'Claudia',
            pronombre: 'ella',
            anios: '1976 -',
            padecimiento: 'Mujer trans',
            esIndice: false,
            fallecido: false,
            adoptado: false,
            rolEspecial: ''
        });

        const p2 = this.crearNodoPersona(380, 80, {
            kind: 'persona',
            simbolo: 'circulo',
            nombre: 'Julián',
            pronombre: 'él',
            anios: '1980 -',
            padecimiento: 'Tabaquismo',
            esIndice: false,
            fallecido: false,
            adoptado: false,
            rolEspecial: ''
        });

        const hijo = this.crearNodoPersona(185, 225, {
            kind: 'persona',
            simbolo: 'rombo',
            nombre: 'Lihuen',
            pronombre: 'elle',
            anios: '2018 -',
            padecimiento: 'Control niño sano',
            esIndice: true,
            fallecido: false,
            adoptado: true,
            rolEspecial: ''
        });

        const embarazo = this.crearNodoPersona(345, 225, {
            kind: 'persona',
            simbolo: 'embarazo',
            nombre: 'Embarazo',
            pronombre: '',
            anios: '2° trim.',
            padecimiento: 'En curso',
            esIndice: false,
            fallecido: false,
            adoptado: false,
            rolEspecial: ''
        });

        const pareja = this.crearEnlace(p1, p2, { kind: 'relacion', tipo: 'concubinato', etiqueta: 'u. 2014' }, undefined, false);
        this.crearEnlace(pareja, hijo, { kind: 'relacion', tipo: 'filial', etiqueta: '' }, undefined, false);
        this.crearEnlace(pareja, embarazo, { kind: 'relacion', tipo: 'biologica', etiqueta: '' }, undefined, false);
        casa.toBack();
        this.resetZoom();
        this.syncSvgAndPersist(true);
    }

    public onObservacionesChange() {
        this.registro.valor.observaciones = this.observaciones;
        this.emitChange();
    }

    private syncSvgAndPersist(emit: boolean) {
        if (!this.graph || !this.paper) {
            return;
        }
        const svgElement = this.paper.svg.cloneNode(true) as SVGSVGElement;
        svgElement.removeAttribute('style');
        const viewport = svgElement.querySelector('.joint-viewport');
        if (viewport) {
            viewport.removeAttribute('transform');
        }
        const bbox = this.paper.getContentBBox({ useModelGeometry: true });
        let imgWidth = 800;
        let imgHeight = 420;
        if (bbox.width > 0 && bbox.height > 0) {
            const pad = 40;
            const vbX = Math.floor(bbox.x - pad);
            const vbY = Math.floor(bbox.y - pad);
            imgWidth = Math.ceil(bbox.width + pad * 2);
            imgHeight = Math.ceil(bbox.height + pad * 2);
            svgElement.setAttribute('viewBox', `${vbX} ${vbY} ${imgWidth} ${imgHeight}`);
            svgElement.setAttribute('width', `${imgWidth}`);
            svgElement.setAttribute('height', `${imgHeight}`);
            svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        }
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);

        this.registro.valor = {
            version: 1,
            engine: 'jointjs',
            data: this.graph.toJSON(),
            svg: svgString,
            snapshot: this.registro.valor?.snapshot || null,
            observaciones: this.observaciones
        };

        this.generarPngSnapshot(svgString, imgWidth, imgHeight, emit);

        if (emit) {
            this.emitChange();
        }
    }

    private generarPngSnapshot(svgString: string, width: number, height: number, emit: boolean) {
        const img = new Image();
        const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
        img.onload = () => {
            const scale = 2;
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(width, 200) * scale;
            canvas.height = Math.max(height, 150) * scale;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.scale(scale, scale);
                ctx.drawImage(img, 0, 0, width, height);
                this.registro.valor.snapshot = canvas.toDataURL('image/png');
                if (emit) {
                    this.emitChange();
                }
            }
        };
        img.src = `data:image/svg+xml;base64,${svgBase64}`;
    }
}
