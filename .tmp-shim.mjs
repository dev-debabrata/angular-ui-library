import { encapsulateStyle } from '@angular/compiler';
import { readFileSync } from 'fs';
console.log(encapsulateStyle(readFileSync(process.argv[2], 'utf8'), 'x'));
