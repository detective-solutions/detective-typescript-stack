import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';

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
import { environment } from '@detective.solutions/frontend/shared/environments';
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
    ApolloModule,
  ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink) {
        return {
          link: httpLink.create({
            uri: `${environment.baseApiPath}${environment.dbApiPath}`,
          }),
          cache: new InMemoryCache({
            addTypename: false,
            typePolicies: {
              Query: {
                keyFields: ['xid'],
                fields: {
                  queryCasefile: offsetLimitPagination(),
                  queryMasking: offsetLimitPagination(),
                  queryUserGroup: offsetLimitPagination(),
                  queryUser: offsetLimitPagination(),
                  querySourceConnection: offsetLimitPagination(),
                },
              },
            },
          }),
        };
      },
      deps: [HttpLink],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
