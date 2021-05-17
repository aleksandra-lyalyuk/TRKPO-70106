import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LoginPageComponent} from './auth/login-page/login-page.component';
import {SiteLayoutComponent} from './auth/site-layout/site-layout.component';
import {AuthGuard} from './shared/classes/auth.guard';

import {ManTasksPageComponent} from './auth/man/man-tasks-page/man-tasks-page.component';
import {ManWorkInspectorsPageComponent} from './auth/man/man-work-inspectors-page/man-work-inspectors-page.component';
import {ManAggregatedReportsPageComponent} from './auth/man/man-aggregated-reports-page/man-aggregated-reports-page.component';
import {ComAccessDeniedPageComponent} from './com-access-denied-page/com-access-denied-page.component';
import {AdminLayoutComponent} from './auth/admin/admin-layout/admin-layout.component';
import {ManLayoutyoutComponent} from './auth/man/man-layoutyout/man-layoutyout.component';
import {AdmUsersPageComponent} from './auth/admin/adm-users-page/adm-users-page.component';
import {AdminEventsListPageComponent} from './auth/admin/admin-events-list-page/admin-events-list-page.component';
import {AdmSelfPageComponent} from './auth/admin/adm-self-page/adm-self-page.component';


const routes: Routes = [
  {
    path: '', redirectTo: '/login', pathMatch: 'full'
  },
  {
    path: 'login', component: LoginPageComponent
  },
  {
    path: '', component: SiteLayoutComponent, canActivate: [AuthGuard], children: [
      {
        path: 'access-denied', component: ComAccessDeniedPageComponent
      }
      ,
      {
        path: 'admin', canActivate: [AuthGuard], component: AdminLayoutComponent, children: [
          {path: 'adm_users', canActivate: [AuthGuard], component: AdmUsersPageComponent},
          {path: 'adm_events_list', canActivate: [AuthGuard], component: AdminEventsListPageComponent}
        ]
      },
      {
        path: 'man', canActivate: [AuthGuard], component: ManLayoutyoutComponent, children: [
          {path: 'man_tasks', canActivate: [AuthGuard], component: ManTasksPageComponent},
          {path: 'man_work_inspectors', canActivate: [AuthGuard], component: ManWorkInspectorsPageComponent},
          {path: 'man_aggregated_reports', canActivate: [AuthGuard], component: ManAggregatedReportsPageComponent}
        ]
      },
      {
        path: 'adm_self', canActivate: [AuthGuard], component: AdmSelfPageComponent
      }
    ]
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {

}
