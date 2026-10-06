import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ScrollTopComponent } from '../stories/components/misc/scroll-top/scroll-top.component';

@Component({
  selector: 'np-root',
  imports: [RouterOutlet, ScrollTopComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
