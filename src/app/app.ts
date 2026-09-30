import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ScrollTopComponent } from '../stories/components/scroll-top/scroll-top.component';

@Component({
  selector: 'nex-root',
  imports: [RouterOutlet, ScrollTopComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
