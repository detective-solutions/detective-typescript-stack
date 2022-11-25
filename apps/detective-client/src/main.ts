import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';
import { environment } from '@detective.solutions/frontend/shared/environments';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

console.log(); // TODO: REMOVE ME!

if (environment.production) {
  enableProdMode();
}

setTimeout(() => {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
});
