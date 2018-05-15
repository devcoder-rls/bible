import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

import Amplify from 'aws-amplify';
import aws_exports from '../assets/aws-exports';

Amplify.configure(aws_exports);

platformBrowserDynamic().bootstrapModule(AppModule);

declare var AWS;
AWS.config.customUserAgent = AWS.config.customUserAgent + ' Ionic'; 