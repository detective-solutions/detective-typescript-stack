import { APOLLO_OPTIONS, Apollo } from 'apollo-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthModule } from '@detective.solutions/frontend/shared/auth';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CoreModule } from './core.module';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { NgModule } from '@angular/core';
import { SharedErrorHandlingModule } from '@detective.solutions/frontend/shared/error-handling';
import { SharedUiModule } from '@detective.solutions/frontend/shared/ui';
import { TranslocoRootModule } from './transloco-root.module';
import { offsetLimitPagination } from '@apollo/client/utilities';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CoreModule,
    AppRoutingModule,
    TranslocoRootModule,
    AuthModule,
    SharedUiModule,
    BrowserAnimationsModule,
    SharedErrorHandlingModule, // Import last due to interceptor chain
  ],
  providers: [
    Apollo,
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        return {
          cache: new InMemoryCache({
            addTypename: false,
            typePolicies: {
              Query: {
                fields: {
                  queryCasefile: offsetLimitPagination(),
                  querySourceConnection: offsetLimitPagination(),
                },
              },
            },
          }),
          link: httpLink.create({
            uri: '/graphql',
          }),
        };
      },
      deps: [HttpLink],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
