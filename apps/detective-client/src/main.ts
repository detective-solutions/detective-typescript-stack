import { AppModule } from './app/app.module';
import { enableProdMode } from '@angular/core';
import { environment } from '@detective-frontend/shared/environments';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

if (environment.production) {
  enableProdMode();
}

setTimeout(() => {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
});
