import { Component, Input, ChangeDetectorRef, ElementRef } from '@angular/core';

@Component({
  selector: '[svgLogo]',
  template: `
  <svg version="1.1" class="logo" xmlns="http://www.w3.org/2000/svg" fill="url(#my-gradient)" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
    width="100%" height="100%"  viewBox="0 0 283.4 133.2" enable-background="new 0 0 283.4 133.2" xml:space="preserve">

    <linearGradient id="my-gradient" x2="100%" y2="0%">
        <stop offset="0%" stop-color="var(--color-stop-1)" />
        <stop offset="50%" stop-color="var(--color-stop-2)" />
        <stop offset="100%" stop-color="var(--color-stop-3)" />
    </linearGradient>

    <path d="M270.4,105.8c-15.3-1.5-20.2-8.9-25.4-16.7c-6.8-10.3-13.9-21-44.2-12.4l0,0.1c-10.1,1.5-15.6,14.1-20.9,26.3
    c-1,2.4-2.1,4.7-3.1,7c-1.8-3.3-3.7-7.3-5.6-11.8c-4.5-10.8-9-24.4-13.4-37.8c-4.3-13.1-8.1-24.3-11.6-33.2
    c-5.8-15.1-10.6-23.9-16-25.3c-1.2-0.4-17.1-5.4-29,1.7c-7.6,4.1-13.6,19.1-22,39.8c-4.6,11.4-9.7,24.1-15.8,36.4
    c-5.5-8.2-10.7-15.5-17.1-15.5c-5,0-10.1,5.3-17.2,12.7C21.2,85.3,11.3,95.5,0,99.5l1.9,5.2c12.6-4.5,22.9-15.2,31.2-23.8
    c5.2-5.4,10.6-11,13.2-11c3.8,0,9.2,8.1,13.5,14.6c1.9,2.9,3.8,5.7,5.7,8.2c1.2,1.6,2.4,3,3.6,4.2c2.5,2.4,5,4,7.8,4.2
    c0.5,0.1,0.9,0.1,1.4,0.1c12.3,0,21.2-25.2,30.6-51.9c2.2-6.4,4.8-13.6,7.4-20.2c3.9,10.1,8,22.6,12.3,35.8
    c13.1,40.4,21.8,65,32.5,66.6l0,0.3c5.3,1,9.9,1.5,14,1.5c23.2,0,29.3-15.2,34.8-28.8c2.1-5.2,4.1-10.1,6.9-14.1
    c1.6,1.7,3.1,3.5,4.8,5.5c7,8.2,14.9,17.6,26.9,18.8c0.1,0,1.2,0.1,3,0.1c3.7,0,10.7-0.5,19.7-3.5l12.4-4.1L270.4,105.8z
        M103.6,47.3c-7.2,20.4-17,48.2-25.4,48.2c-1.9,0-3.8-1.2-5.7-3.1c-1-1.1-2-2.3-3.1-3.7c-0.9-1.2-1.7-2.5-2.5-3.7
    c6.7-13.3,12.4-27.2,17.3-39.5c7.4-18.2,13.7-33.9,19.5-37c0,0,0.1,0,0.1-0.1c5.7-3.4,12.9-3.3,18-2.6c-0.1,0.1-0.2,0.2-0.3,0.3
    c-2,2.3-3.9,5.4-5.8,9.4C112.1,23.4,108.2,34.2,103.6,47.3z M133.7,63c-5-15.5-9.8-30.2-14.4-41.2c0.5-1.4,1.1-2.7,1.6-3.9
    c1-2,2-3.9,2.9-5.4c1.6-2.4,3.2-4.1,4.8-4.9c3.7,2.1,8,10.6,12.3,21.5c3.5,9.1,7.1,20,10.9,31.3c4.6,13.7,9.2,27.7,13.9,39
    c0,0.1,0.1,0.2,0.1,0.3c0.4,0.9,0.7,1.8,1.1,2.6c0.2,0.4,0.3,0.8,0.5,1.2c0.2,0.4,0.4,0.8,0.5,1.2c0.3,0.7,0.6,1.3,0.9,2
    c0.1,0.3,0.3,0.6,0.4,0.9c0.3,0.6,0.6,1.2,0.9,1.8c0.2,0.4,0.4,0.8,0.6,1.1c0.2,0.4,0.4,0.8,0.6,1.2c0.3,0.6,0.6,1.1,0.9,1.6
    c0.1,0.2,0.2,0.4,0.3,0.6c0.4,0.6,0.7,1.2,1.1,1.8c0,0,0,0.1,0.1,0.1c-2.3,4.1-4.8,7.4-7.6,9c-1.4,0.8-2.9,1.1-4.3,0.9
    C153.8,124.9,142.2,89.1,133.7,63z M204.7,102.3c-5.5,13.6-10.6,26.5-32.6,25.2c0.2-0.2,0.4-0.4,0.6-0.6c0,0,0,0,0.1-0.1
    c0.2-0.2,0.3-0.3,0.5-0.5c3.1-3.2,5.2-7.1,6.3-9.1l0.8-1.5l-0.1-0.1c1.7-3.3,3.2-6.8,4.7-10.3c5-11.4,10.1-23.1,17.8-23.1
    c4.5,0,7,1.7,9.8,4.2C209.2,91.1,206.9,96.8,204.7,102.3z M248.9,109c-9.9-1-16.7-9.1-23.3-16.9c-1.8-2.1-3.6-4.2-5.4-6.2l0.1-0.1
    l-1.5-1.3c-1.7-1.7-3.5-3.3-5.4-4.6c-0.1-0.1-0.2-0.1-0.3-0.2c-0.1-0.1-0.2-0.1-0.3-0.2c17.5-2.7,22,4.2,27.5,12.5
    c4,6.1,8.4,12.7,17.7,16.5C252.4,109.4,249,109,248.9,109z"/>
</svg>
  `
})
export class LogoSvgComponent { }

