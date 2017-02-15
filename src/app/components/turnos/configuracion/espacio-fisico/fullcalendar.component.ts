import { Component, AfterViewInit, Output, Input, EventEmitter } from '@angular/core';
declare var jQuery: any;
var $ = jQuery;
class FullCalendarMethod {
    viewRender
    select
}
@Component({
    selector: 'app-fullcalendar',
    templateUrl: './fullcalendar.component.html',
    //styleUrls: ['./fullcalendar.component.css']
})
export class FullcalendarComponent implements AfterViewInit {
    constructor() {}
    // default options
    defaultOption: Object = {
        header: {
            left: 'today',
            center: ' prev,title,next',
            right: 'month,agendaWeek,agendaDay'
        },
        defaultDate: new Date(),
        minTime: "07:00:00",
        maxTime: "23:00:00",
        ignoreTimezone: true,
        slotMinutes: 15,
        selectable: true,
        selectHelper: true,
        columnFormat: {
            month: 'dddd',    // Monday, Wednesday, etc
            week: 'ddd D', // Mon. 7
            day: 'dddd, MMM dS'  // Monday 9/7
        },
        titleFormat: {
            week: "MMM YYYY",
            day: 'ddd D MMM YYYY'
        },
        axisFormat: 'H:mm',
        events: [],
        views: {
            agendaDay: {
                slotDuration: '00:30',
                snapDuration: '00:30',
            },
            month: {
                eventLimit: 0
            }
        },
        allDaySlot: false
    }
    // Output for EventEmitter
    @Output() onSelect = new EventEmitter();
    @Output() onViewRender = new EventEmitter();
    // option set by user
    @Input() calendarOptions: Object;
    ngAfterViewInit() {
        // extend options
        // add this.defaultOption and this.calendarOptions to a new Object 
        let extendDefaultOption = $.extend({}, this.calendarOptions, this.defaultOption);
        // add extendDefaultOption and this.fullCalendarMethod() to a new Object 
        this.calendarOptions = $.extend({}, extendDefaultOption, this.fullCalendarMethod());
        // init full calendar
        $(".fullcalendar").fullCalendar(this.calendarOptions);
    }
    /**
     * fullCalendarMethod
     * 
     * emit event for fullcalendar
     * 
     * @return Object
     */
    fullCalendarMethod(): Object {
        let fullCalendarMethod = <FullCalendarMethod>{};
        /**
         * fullCalendarMethod.viewRender
         * 
         * emit event on viewRender
         * 
         */
        fullCalendarMethod.viewRender = (view, element) => {
            let viewRenderParams = {
                _view: view,
                _element: element
            }
            this.onViewRender.emit(viewRenderParams);
        };
        /**
         * fullCalendarMethod.select
         * 
         * emit event on select
         * 
         */
        fullCalendarMethod.select = (start, end) => {
            let dateRange = {
                _start: start,
                _end: end
            }
            this.onSelect.emit(dateRange);
        }
        // add another method here and emit event then user can use your method
        return fullCalendarMethod;
    }
}