// This file includes polyfills needed by Angular 2 and is loaded before
// the app. You can add your own extra polyfills to this file.
import { Buffer } from 'buffer';

(window as any).global = window;
(window as any).Buffer = Buffer;

import 'core-js/es/reflect';
import 'zone.js';
import 'hammerjs';
