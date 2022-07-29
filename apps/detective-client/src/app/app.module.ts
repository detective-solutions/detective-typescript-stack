import { APOLLO_OPTIONS, Apollo } from 'apollo-angular';
import { InMemoryCache, split } from '@apollo/client/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthModule } from '@detective.solutions/frontend/shared/auth';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CoreModule } from './core.module';
import { HttpLink } from 'apollo-angular/http';
import { NgModule } from '@angular/core';
import { OperationDefinitionNode } from 'graphql';
import { SharedErrorHandlingModule } from '@detective.solutions/frontend/shared/error-handling';
import { SharedUiModule } from '@detective.solutions/frontend/shared/ui';
import { TranslocoRootModule } from './transloco-root.module';
import { WebSocketLink } from '@apollo/client/link/ws';
import { buildWebSocketHost } from '@detective.solutions/frontend/shared/utils';
import { environment } from '@detective.solutions/frontend/shared/environments';
import { getMainDefinition } from '@apollo/client/utilities';
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
      useFactory(httpLink: HttpLink) {
        const http = httpLink.create({
          uri: `${environment.baseApiPath}${environment.dbApiPath}`,
        });

        const ws = new WebSocketLink({
          uri: `${buildWebSocketHost()}${environment.baseApiPath}${environment.dbApiPath}`,
          options: {
            reconnect: true,
          },
        });

        // Using the ability to split links, you can send data to each link
        // depending on what kind of operation is being sent
        const link = split(
          ({ query }) => {
            const { kind, operation } = getMainDefinition(query) as OperationDefinitionNode;
            return kind === 'OperationDefinition' && operation === 'subscription';
          },
          ws,
          http
        );
        return {
          link,
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
        };
      },
      deps: [HttpLink],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
