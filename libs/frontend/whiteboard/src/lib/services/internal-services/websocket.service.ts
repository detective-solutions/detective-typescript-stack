import { AuthService, IAuthStatus } from '@detective.solutions/frontend/shared/auth';
import {
  EventBasedWebSocketMessage,
  RxWebSocketWrapperSubject,
  initRxWebSocketWrapper,
} from '@detective.solutions/rx-websocket-wrapper';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoService } from '@ngneat/transloco';
import { ReplaySubject, Subject, Subscription, filter, switchMap, take, tap } from 'rxjs';
import { ToastService, ToastType } from '@detective.solutions/frontend/shared/ui';

import { IWhiteboardContextState } from '../../state/interfaces';
import { LogService } from '@detective.solutions/frontend/shared/error-handling';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { buildWebSocketHost } from '@detective.solutions/frontend/shared/utils';
import { environment } from '@detective.solutions/frontend/shared/environments';
import { selectWhiteboardContextState } from '../../state';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class WebSocketService implements OnDestroy {
  private static readonly loggingPrefix = '[WebSocket Service]';

  currentWebSocket$!: RxWebSocketWrapperSubject<any>;
  readonly isConnectedToWebSocketServer$ = new Subject<boolean>();
  readonly webSocketConnectionFailedEventually$ = new Subject<boolean>();
  readonly getWebSocketSubjectAsync$ = new ReplaySubject<RxWebSocketWrapperSubject<any>>();

  private isFirstConnection = true;
  private currentToast!: MatSnackBarRef<TextOnlySnackBar>;
  private refreshTokenTimeout!: number;
  private subscriptions!: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly store: Store,
    private readonly logger: LogService,
    private readonly router: Router,
    private readonly toastService: ToastService,
    private readonly translationService: TranslocoService,
    @Inject(TRANSLOCO_SCOPE) private readonly translationScope: ProviderScope
  ) {}

  establishWebsocketConnection() {
    console.log(this.authService.getRefreshToken()); // TODO: Remove me

    // Need to create a new instance after calling unsubscribe() when resetting connection
    this.subscriptions = new Subscription();

    this.store
      .select(selectWhiteboardContextState)
      .pipe(take(1))
      .subscribe((whiteboardContext: IWhiteboardContextState) => {
        this.logger.debug(
          `${WebSocketService.loggingPrefix} Establishing connection to ${this.buildWebSocketUrl(whiteboardContext)}`
        );

        this.currentWebSocket$ = initRxWebSocketWrapper<any>({
          url: this.buildWebSocketUrl(whiteboardContext),
          reconnectInterval: 4000,
          reconnectAttempts: 3,
        });

        // Handle interrupted connections, if necessary refresh access token
        this.subscriptions.add(
          this.currentWebSocket$.connectionStatus$
            .pipe(
              tap((isConnected: boolean) => this.isConnectedToWebSocketServer$.next(isConnected)),
              tap((isConnected: boolean) => {
                if (isConnected) {
                  this.getWebSocketSubjectAsync$.next(this.currentWebSocket$);
                  this.handleSuccessfulConnection();
                } else {
                  this.handleReconnection();
                }
              }),
              filter((isConnected: boolean) => !isConnected),
              filter(() => this.authService.hasExpiredToken(this.authService.getAccessToken())),
              switchMap(() => this.authService.refreshTokens())
            )
            .subscribe(() => {
              // Set websocket url with updated access token
              this.currentWebSocket$.config = { url: this.buildWebSocketUrl(whiteboardContext) };
            })
        );

        // Reset connection and subscriptions if websocket connection failed eventually
        this.subscriptions.add(
          this.currentWebSocket$.connectionFailedEventually$.subscribe(() => this.handleConnectionError())
        );

        // Set timers to update refresh token to ensure that a user can always reconnect
        // Given that a connection has been authenticated once
        this.subscriptions.add(
          this.authService.authStatus$
            .pipe(filter((authStatus: IAuthStatus) => authStatus.isAuthenticated))
            .subscribe(() => this.startRefreshTokenTimer())
        );
        this.subscriptions.add(
          this.authService.authStatus$
            .pipe(filter((authStatus: IAuthStatus) => !authStatus.isAuthenticated))
            .subscribe(() => this.stopRefreshTokenTimer())
        );

        // Subscribe to logout to reset whiteboard websocket connection
        this.subscriptions.add(this.authService.loggedOut$.subscribe(() => this.resetWebsocketConnection()));
      });
  }

  resetWebsocketConnection() {
    if (this.currentWebSocket$) {
      this.currentWebSocket$.resetConnection();
    }
    if (this.currentToast) {
      this.currentToast.dismiss();
    }
    this.stopRefreshTokenTimer();
    this.subscriptions.unsubscribe();
    this.isFirstConnection = true;
  }

  publishMessage(message: EventBasedWebSocketMessage) {
    if (this.currentWebSocket$) {
      this.currentWebSocket$.emit(message);
    }
  }

  ngOnDestroy() {
    this.resetWebsocketConnection();
  }

  private handleSuccessfulConnection() {
    if (!this.isUserStillOnWhiteboard()) {
      return;
    }

    if (this.currentToast) {
      this.currentToast.dismiss(); // Reset possible error toasts
    }
    if (!this.isFirstConnection) {
      this.showToast(['toastMessages.webSocketConnection.reconnectionSuccessful'], ToastType.INFO, { duration: 2000 });
    }
    this.isFirstConnection = false;
    this.logger.info(`${WebSocketService.loggingPrefix} Connection established`);
  }

  private handleReconnection() {
    if (!this.isUserStillOnWhiteboard()) {
      return;
    }

    this.logger.error(`${WebSocketService.loggingPrefix} Lost connection. Trying to reconnect ...`);
    this.showToast(['toastMessages.webSocketConnection.reconnecting'], ToastType.ERROR);
  }

  private handleConnectionError() {
    if (!this.isUserStillOnWhiteboard()) {
      return;
    }

    this.logger.error(`${WebSocketService.loggingPrefix} It is currently not possible to connect to the server`);
    this.resetWebsocketConnection();
    this.showToast(['toastMessages.webSocketConnection.noConnection'], ToastType.ERROR);
    this.webSocketConnectionFailedEventually$.next(true);
  }

  private showToast(translationKeys: string[], toastType: ToastType, config: MatSnackBarConfig = {}) {
    this.translationService
      .selectTranslate(translationKeys, {}, this.translationScope.scope)
      .pipe(take(1))
      .subscribe((translation: string[]) => {
        this.currentToast = this.toastService.showToast(translation[0], translation[1] ?? '', toastType, config);
      });
  }

  private isUserStillOnWhiteboard(): boolean {
    return !!this.router.url.includes(environment.whiteboardPath);
  }

  private buildWebSocketUrl(whiteboardContext: IWhiteboardContextState) {
    const basePathV1 = `${buildWebSocketHost()}${environment.baseApiPath}${environment.webSocketApiPathV1}`;
    return `${basePathV1}/tenant/${whiteboardContext.tenantId}/casefile/${
      whiteboardContext.casefileId
    }?token=${this.authService.getAccessToken()}`;
  }

  private startRefreshTokenTimer() {
    const refreshToken = JSON.parse(atob(this.authService.getRefreshToken().split('.')[1]));
    if (!refreshToken) {
      throw new Error('Could not get refresh token to start token timer!');
    }
    if (!refreshToken.exp) {
      throw new Error('Refresh token is missing expiry information! Could not start token timer!');
    }
    const refreshOffset = 1000; // Refresh token one minute before expiry
    const expires = new Date(refreshToken.exp * refreshOffset);
    const timeout = expires.getTime() - Date.now() - 60 * 1000;
    this.refreshTokenTimeout = window.setTimeout(
      () =>
        this.authService
          .refreshTokens()
          .pipe(
            tap(() => this.logger.info(`${WebSocketService.loggingPrefix} Refreshing access tokens`)),
            switchMap(() => this.store.select(selectWhiteboardContextState)),
            take(1)
          )
          .subscribe(
            (whiteboardContext: IWhiteboardContextState) =>
              (this.currentWebSocket$.config = { url: this.buildWebSocketUrl(whiteboardContext) })
          ),
      timeout
    );
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
