import {Component, OnInit} from '@angular/core';
import {GridDataResult, RowClassArgs} from '@progress/kendo-angular-grid';
import {map} from 'rxjs/operators';
import {process, State} from '@progress/kendo-data-query';
import {UserService} from '../../../data/services/user.service';
import {Observable} from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
    selector: 'app-admin-events-list-page',
    templateUrl: './admin-events-list-page.component.html',
    styleUrls: ['./admin-events-list-page.component.css']
})
export class AdminEventsListPageComponent implements OnInit {
    public view: Observable<GridDataResult>;
    public gridData: Observable<GridDataResult>;
    public lastinput: any;
    public datePic = new Date();
    public lastViewState: any;
    public min: Date = new Date(2020, 0, 1);
    public max: Date = new Date(new Date().getFullYear() + 1, new Date().getMonth() + 12, new Date().getDate() + 30);
    public gridState: State = {
        sort: [],
        skip: 0,
        take: 25
    };
    public registerForm: FormGroup = new FormGroup({
        date: new FormControl(new Date())
    });

    constructor(private userService: UserService) {

    }

    public onDatePicker(event) {
        this.view = this.userService.pipe(map(
            data => process(data, this.gridState)));
        this.userService.readEvents(this.datePic.toLocaleDateString());

    }

    // public onFilter(inputValue: string, event): void {
    //     console.log(this.lastinput, this.lastViewState);
    //     this.view = this.userService.pipe(map(
    //         data => process(data, this.gridState)));
    //     if (inputValue === null || inputValue === ' ' || inputValue === '') {
    //         this.userService.readEvents(this.datePic.toLocaleDateString())
    //         localStorage.setItem('lastInput', null);
    //         localStorage.setItem('lastViewState', null);
    //     }
    //     if (event.data === null && this.lastinput === inputValue) {
    //         this.view['destination']._value = this.lastViewState;
    //     } else {
    //         this.view['destination']._value = process(this.view['destination']._value, {
    //             filter: {
    //                 logic: 'or',
    //                 filters: [
    //                     {
    //                         field: 'ACTION',
    //                         operator: 'contains',
    //                         value: inputValue
    //                     },
    //                     {
    //                         field: 'FIO',
    //                         operator: 'contains',
    //                         value: inputValue
    //                     },
    //                     {
    //                         field: 'SUCCESS',
    //                         operator: 'contains',
    //                         value: inputValue
    //                     },
    //                     {
    //                         field: 'ERRORS',
    //                         operator: 'contains',
    //                         value: inputValue
    //                     },
    //                     {
    //                         field: 'PUSER',
    //                         operator: 'contains',
    //                         value: inputValue
    //                     },
    //                     {
    //                         field: 'DTC',
    //                         operator: 'contains',
    //                         value: inputValue
    //                     },
    //                 ],
    //             }
    //         }).data;
    //         if (event.data !== null && this.lastinput !== undefined && this.lastinput.length === inputValue.length - 2) {
    //             localStorage.setItem('lastInput', inputValue);
    //             localStorage.setItem('lastViewState', JSON.stringify(this.view['destination']._value));
    //             this.lastinput = localStorage.getItem('lastInput');
    //             this.lastViewState = JSON.parse(localStorage.getItem('lastViewState'));
    //         } else if (event.data !== null && this.lastinput === undefined) {
    //             localStorage.setItem('lastInput', inputValue);
    //             localStorage.setItem('lastViewState', JSON.stringify(this.view['destination']._value));
    //             this.lastinput = localStorage.getItem('lastInput');
    //             this.lastViewState = JSON.parse(localStorage.getItem('lastViewState'));
    //         }
    //     }
    // }
    public tm = null;

    public onFilter(event) {
        if (this.tm !== null) {
            clearTimeout(this.tm);
        }
        this.tm = setTimeout(() => {
            this.onFilterr(event);
        }, 500);
    }

    public async onFilterr(event) {

        // await setTimeout(() => {
        // }, 500);
        await this.userService.search_event(this.datePic.toLocaleDateString(), event.target.value).subscribe(res => {
            // this.view['destination']._value = res;
            this.view = this.userService.pipe(map(
                data => process(data, this.gridState)));
        });
    }

    ngOnInit() {
        this.view = this.userService.pipe(map(
            data => process(data, this.gridState)));
        this.userService.readEvents(this.datePic.toLocaleDateString());
        // this.userService.getEvents();
        localStorage.setItem('lastInput', null);
        localStorage.setItem('lastViewState', null);
    }


    public rowCallback = (context: RowClassArgs) => {
        switch (context.dataItem.lock) {
            case true:
                return {gold: true};
            case false:
                return {green: true};
            default:
                return {};
        }
    };
}
