import { Component, ContentChildren, QueryList, ChangeDetectorRef, ElementRef, Renderer2, SimpleChanges, AfterContentInit, OnInit, Input } from '@angular/core';
import { DragScroll } from 'angular2-drag-scroll';

import { TabComponent } from './tab.component';

@Component({
  selector: 'tabs',
  styleUrls: ['tabs.scss'],
  template: `
    <div class="container-tabs">
      <ul class="nav nav-tabs" [ngClass]="{ 'draggable': options.dragScroll === true }" (scroll)="onScrollTabs($event)">
        <li *ngFor="let tab of tabs" (click)="selectTab(tab)" [class.active]="tab.active" [class]="tab.class" >

          <a href="javascript:void(0)" *ngIf="options.trim" title="{{tab.tabTitle}}">
            {{ (tab.tabTitle.length > options.trim) ? (tab.tabTitle | slice:0:options.trim) + '..' : (tab.tabTitle) }}
          </a>

          <a href="javascript:void(0)" *ngIf="!options.trim" title="{{tab.tabTitle}}">
            {{tab.tabTitle}}
          </a>
        </li>
      </ul>
      <ng-content></ng-content>
    </div>
  `
})
export class TabsComponent implements OnInit, AfterContentInit {

  public dragScrollDom: any;
  public dragScrollRef: ElementRef;
  public dragScroll: DragScroll;

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
    this.options.dragScroll = (this.options.dragScroll) ? this.options.dragScroll : false;
    this.options.fixFirstOnScroll = (this.options.fixFirstOnScroll) ? this.options.fixFirstOnScroll : false;
    this.options.trim = (this.options.trim && parseInt(this.options.trim, 10) > 0) ? parseInt(this.options.trim, 10) : false;
  }

  // contentChildren are set
  ngAfterContentInit() {

    // get all active tabs
    let activeTabs = this.tabs.filter((tab) => tab.active);

    // if there is no active tab set, activate the first
    if (activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }


    /*
    if (this.tabs) {

      this.tabs.changes.subscribe((changes: any) => {
        setTimeout(() => {
          // never triggered
          if (this.tabs.length === 1) {
            this.tabs.first.active = true;
          }
        });
      });
    }
    */


    // creamos el los tabs draggables en forma dinámica
    if (this.options.dragScroll) {

      // attach to .nav-tabs element
      this.dragScrollDom = this.element.nativeElement.querySelector('.nav-tabs');
      this.dragScrollRef = new ElementRef(this.dragScrollDom);

      this.dragScroll = new DragScroll(this.dragScrollRef, this.renderer);

      this.dragScroll.attach({ disabled: false, scrollbarHidden: true, yDisabled: true, xDisabled: false } as any);
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

    /*
    let tabs = this.element.nativeElement.querySelector('.nav-tabs');
    */
  }
}
