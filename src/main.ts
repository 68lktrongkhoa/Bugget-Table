import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {registerLicense} from '@syncfusion/ej2-base';


registerLicense("ORg4AjUWIQA/Gnt2VVhhQ1Fac11JW3xNYVF2R2FJe1RzdF9DZkwgOX1dQ19hSXtTcEVhWndceXFdQmY=");
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
