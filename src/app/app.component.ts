import { Component,OnInit } from '@angular/core';
import { Observable,noop } from 'rxjs';
import { map,tap,shareReplay } from 'rxjs/operators'

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit  {
  
  empAgeGreaterThan30$
  empAgeLessThan30$

  ngOnInit() {
      const http$ = Observable.create(observer => {
         fetch('https://dummy.restapiexample.com/api/v1/employees')
        .then(response => {return response.json()})
        .then(body => {
          observer.next(body)
          observer.complete()
        })
        .catch(err => {
          observer.error(err)
        })
    });

    const employees$ = http$.pipe(
          tap(() => console.log("From RxJS tap")),
          map(res => {
             let emp = Object.values(res["data"]) 
             return emp}),
          shareReplay()  
             
        )

/*       employees$.subscribe(employees => console.log(employees),
                           noop,
                           () => console.log("completed")) */

      this.empAgeGreaterThan30$ = employees$.pipe(map((employees:any) => {
          let empagegreater30 = employees.filter(employee => employee.employee_age > "30" )
          return empagegreater30

      }))

     /*  this.empAgeGreaterThan30$.subscribe(emp => console.log(emp)) */

      this.empAgeLessThan30$ = employees$.pipe(map((employees :any) => {
        let empagelessthan30 = employees.filter(employee => employee.employee_age <= "30")
        return empagelessthan30
      }))

     /*  this.empAgeLessThan30$.subscribe(emp => console.log(emp)) */

  } // end of ngOnInit

  /* 
                        *** Imperative Design ***

    Once we get the employees, we can filter out the employees based on the age & can store it in two separate array variables as mentioned below.

    this.employees$.subscribe(employees => {
      this.employeeGreaterThan30 = employees.filter(employee =>                                           employee.employee_age > 30);

      this.employeeAgeLessThan30 = employee.filter(employee =>                                            employee.employee_age <=30);
    })

    The problem with the above approach is we have written much logic inside the subscribe success callback, which doesn't scale well in complexity. We may end up with nested subscribe blocks which we should avoid because this creates callback hell & there's no point of using RxJS.

    Main motive of RxJS :
      1. Avoid call back hell (subscription success callabck inside          subscription).
      2. Avoiding much logic inside the subscribe.

---------------------------------------------------------------------------

                  *** Reactive Design ***

      const employees$ = http$.pipe(
          tap(() => console.log("From RxJS tap")),
          map(res => {
             let emp = Object.values(res["data"]) 
             return emp})    
        )

  Here we have one source of data stream which is employee$. And we are using same to get the employees age > 30 and employee age <= 30 in the above example by applying filters.

  In reactive design we create multiple streams of employee$ data .
  One    stream : for employees age > 30 and
  Second stream : for employee age <= 30

  Inorder to achieve this we will create two Observables

  employeeAgeGreaterThan30$ : Observable<any>;
  employeeAgeLessThan30$    : Observable<any>;

  this.employeeAgeGreaterThan30$ = employees$.pipe(
                                    map((employees) => {
                                       employees.filter(employee => {
                                         employee.employee_age > "30"
                                       })
                                    })
                                  )
  this.employeeAgeLessThan30$ = employees$.pipe(
                                    map((employees) => {
                                       employees.filter(employee => {
                                         employee.employee_age <= "30"
                                       })
                                    })
                                  )

  As we know, Here employeeAgeGreaterThan30$ and employeeAgeLessThan30$ are definitions for the observable of streams.To get the stream of values we need to subscribe to it.

  Here, we will subscribe it with the help of "async" in the html template.
        <p *ngFor="let employee of empAgeLessThan30$ | async">
        {{employee.employee_name +" - "+employee.employee_age}}
        </p>

  PROS : The pros are 
            1. We are not subscribing by ourselves instead using async        which will handle subscription by itself.
               Hence, No complex logic is written in subscribe as we not are subscribing manually.

  CONS : The cons are 
            1. Here we are calling the backend twice, Observe that in the     network tab.
               This is because, to get the employees > 30 and employees <= 30.  

  Note : In order to overcome this (calling twice to the backend) , we use shareReplay() rxjs operator.

---------------------------------------------------------------------------

                  ********* shareReplay() **********

  In the reactive design, change the code as below :

        const employees$ = http$.pipe(
          tap(() => console.log("From RxJS tap")),
          map(res => {
             let emp = Object.values(res["data"]) 
             return emp}),
          shareReplay()    
        )

  Default Observable Behavior :

    Whenever we subscribe to the observable, it will create completely new stream. If we subscribe to the same observable twice, it will create two different streams of same values.

    That's the reason why we are calling backend twice. Because to ge the employeeAge > 30 and employeeAge <=30 , we are subscribing to the employee$ observable twice.

  To overcome Default Observable Behavior :

    We use shareReplay() rxjs operator.

    Here for the first subscription, a new stream of values is generated & from then for any further subscriptions, same stream is shared/replayed.

    In this case, for the first subscription, we will call the backend & get the stream of values. For further subscriptions we dont call the backend instead we will share the initial/first received stream of values.

    
   */

}
