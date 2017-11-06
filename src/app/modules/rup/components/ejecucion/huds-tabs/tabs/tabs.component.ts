import { Component, ContentChildren, QueryList, ChangeDetectorRef, ElementRef, Renderer2, SimpleChanges, AfterContentInit, OnInit, Input } from '@angular/core';

import { TabComponent } from './tab.component';

@Component({
    selector: 'tabs',
    styleUrls: ['tabs.scss'],
    template: `
    <div class="container-tabs">
      <ul class="nav nav-tabs" (scroll)="onScrollTabs($event)">
        <li *ngFor="let tab of tabs; let i = index" (click)="selectTab(tab)" [class.active]="tab.active" [class]="tab.class" >

          <a href="javascript:void(0)" *ngIf="options.trim" title="{{tab.tabTitle}}">
            {{ (tab.tabTitle.length > options.trim) ? (tab.tabTitle | slice:0:options.trim) + '...' : (tab.tabTitle) }} {{i > 0 && !hayMismoNombre(tab.tabTitle) ? '(' + i + ')' : ''}}
          </a>

          <a href="javascript:void(0)" *ngIf="!options.trim" title="{{tab.tabTitle}}">
            {{tab.tabTitle}} {{i > 0 && !hayMismoNombre(tab.tabTitle) ? '(' + i + ')' : ''}}
          </a>
        </li>
      </ul>
      <ng-content></ng-content>
    </div>
  `
})
export class TabsComponent implements OnInit, AfterContentInit {


    @Input() options: any = {};

    constructor(
        private cdr: ChangeDetectorRef,
        private element: ElementRef,
        private renderer: Renderer2) {
    }

    /*
     * Contenido dentro de ng-content
     */
    @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

    ngOnInit(): void {
        // fijamos el primer elemento cuando realizamos scroll
        this.options.fixFirstOnScroll = (this.options.fixFirstOnScroll) ? this.options.fixFirstOnScroll : false;
        // hacemos un trim del texto a incluir dentro del tab
        this.options.trim = (this.options.trim && parseInt(this.options.trim, 10) > 0) ? parseInt(this.options.trim, 10) : false;
    }

    // contentChildren are set
    ngAfterContentInit() {

        // get all active tabs
        let activeTabs = this.tabs.filter((tab) => tab.active);

        // if there is no active tab set, activate the first
        if (activeTabs.length === 0) {
            // this.selectTab(this.tabs[0]);
            this.selectTab(this.tabs.first);
        }
    }

    /**
     * Activar un tab de la lista
     *
     * @param {TabComponent} tab Tab a activar
     * @memberof TabsComponent
     */
    selectTab(tab: TabComponent) {

        if (tab) {
            // desactivamos todos los tabs
            this.tabs.toArray().forEach(t => t.active = false);

            // activamos el tab que el usuario ha clickeado
            tab.active = true;
        }
    }

    onScrollTabs(event) {
        if (event.srcElement.scrollLeft > 0) {
            this.renderer.addClass(event.target, 'fixed');
        } else if (event.srcElement.scrollLeft === 0) {
            this.renderer.addClass(event.target, 'fixed');

        }

    }

    hayMismoNombre(tabTitle) {
        return this.tabs.toArray().filter(t => t.tabTitle === tabTitle).length > 0;
    }
}
