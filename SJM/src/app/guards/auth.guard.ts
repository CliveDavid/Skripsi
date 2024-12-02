import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.authService.authState$.pipe(
            take(1),
            map(isLoggedIn => {
                if (isLoggedIn) {
                    return true;
                } else {
                    const returnUrl = state.url.startsWith('/') ? state.url.slice(1) : state.url;
                    sessionStorage.setItem('returnUrl', returnUrl);

                    return this.router.createUrlTree(['/login'], {
                        queryParams: { returnUrl },
                        queryParamsHandling: 'merge'
                    });
                }
            })
        );
    }
}