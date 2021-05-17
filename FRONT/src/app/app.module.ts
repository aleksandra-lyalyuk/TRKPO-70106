import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import {registerLocaleData} from '@angular/common';
import {AppComponent} from './app.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterModule, Routes} from '@angular/router';
import {LoginPageComponent} from './auth/login-page/login-page.component';
import {AppRoutingModule} from './app-routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DateInputsModule} from '@progress/kendo-angular-dateinputs';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LabelModule} from '@progress/kendo-angular-label';
import {InputsModule} from '@progress/kendo-angular-inputs';
import {LayoutModule} from '@progress/kendo-angular-layout';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {AdmUsersPageComponent} from './auth/admin/adm-users-page/adm-users-page.component';
import {SiteLayoutComponent} from './auth/site-layout/site-layout.component';
import {MenuModule} from '@progress/kendo-angular-menu';
import {ButtonsModule} from '@progress/kendo-angular-buttons';
import {ManTasksPageComponent} from './auth/man/man-tasks-page/man-tasks-page.component';
import {ManWorkInspectorsPageComponent} from './auth/man/man-work-inspectors-page/man-work-inspectors-page.component';
import {ManAggregatedReportsPageComponent} from './auth/man/man-aggregated-reports-page/man-aggregated-reports-page.component';
import {ComAccessDeniedPageComponent} from './com-access-denied-page/com-access-denied-page.component';
import {AdminLayoutComponent} from './auth/admin/admin-layout/admin-layout.component';
import {ManLayoutyoutComponent} from './auth/man/man-layoutyout/man-layoutyout.component';
import {AdminEventsListPageComponent} from './auth/admin/admin-events-list-page/admin-events-list-page.component';
import {AdmSelfPageComponent} from './auth/admin/adm-self-page/adm-self-page.component';
import {BodyModule, FilterMenuModule, GridModule} from '@progress/kendo-angular-grid';
import {DialogsModule} from '@progress/kendo-angular-dialog';
import {TokenInterceptor} from './shared/classes/token.interceptor';
import {AngularYandexMapsModule, YA_MAP_CONFIG} from 'angular8-yandex-maps';
import {ComboBoxModule} from '@progress/kendo-angular-dropdowns';
import {IntlModule} from '@progress/kendo-angular-intl';
import {PhonePipe} from './data/services/phone.pipe';
import '@progress/kendo-angular-intl/locales/ru/calendar';
import localeRu from '@angular/common/locales/ru';
import { AdmUserEditDlgComponent } from './auth/admin/adm-user-edit-dlg/adm-user-edit-dlg.component';
import { ManTaskPageDlgComponent } from './auth/man/man-task-page-dlg/man-task-page-dlg.component';
import {SharedModule, UploadModule} from '@progress/kendo-angular-upload';
// import { ManUploadFileDlgComponent } from './auth/man/man-upload-file-dlg/man-upload-file-dlg.component';
import { UploadInterceptor } from './app.component';
import {ManFilesDlgComponent} from './auth/man/man-files-dlg/man-files-dlg.component';
import { ErrormsgComponentComponent } from './auth/errormsg-component/errormsg-component.component';
//
// const mapConfig: IConfig = {
//     apiKey: '87d0ca91-b742-4489-8bb2-4ab35fd7a165',
//     lang: 'ru_RU',
// };
registerLocaleData(localeRu);
const routes: Routes = [

];


@NgModule({
    declarations: [
        AppComponent,
        LoginPageComponent,
        AdmUsersPageComponent,
        AdmSelfPageComponent,
        SiteLayoutComponent,
        ManTasksPageComponent,
        ManWorkInspectorsPageComponent,
        ManAggregatedReportsPageComponent,
        ComAccessDeniedPageComponent,
        AdminLayoutComponent,
        ManLayoutyoutComponent,
        AdminEventsListPageComponent,
        PhonePipe,
        AdmUserEditDlgComponent,
        ManTaskPageDlgComponent,
        ManFilesDlgComponent,
        ErrormsgComponentComponent
    ],
    imports: [
        BrowserModule,
        NgbModule.forRoot(),
        RouterModule.forRoot(routes, {useHash: true}),
        RouterModule,
        AppRoutingModule,
        ReactiveFormsModule,
        DateInputsModule,
        BrowserAnimationsModule,
        HttpClientModule,
        LabelModule,
        InputsModule,
        LayoutModule,
        MenuModule,
        ButtonsModule,
        GridModule,
        DialogsModule,
        AngularYandexMapsModule,
        ComboBoxModule,
        FormsModule,
        FilterMenuModule,
        BodyModule,
        IntlModule,
        UploadModule,
        SharedModule
    ],
    providers: [{
        provide: HTTP_INTERCEPTORS,
        multi: true,
        useClass: TokenInterceptor,
    },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: UploadInterceptor,
            multi: true
        },
        {
            provide: YA_MAP_CONFIG,
            useValue: {
                apikey: '87d0ca91-b742-4489-8bb2-4ab35fd7a165',
                lang: 'ru_RU'
            }
        },
        { provide: LOCALE_ID, useValue: 'ru_RU' }],
    bootstrap: [AppComponent]
})
export class AppModule {
}
