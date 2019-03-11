import React, { Component } from 'react';
import './Calendar.css';
import moment from 'moment';
import Event from "../Event/Event.js";

/*
    Calendar Component
    Author: Ellinor Bakhuizen
    Version: 2019-03-11
 */

let CryptoJS = require("crypto-js");
let textEncoding = require('text-encoding');
let TextDecoder = textEncoding.TextDecoder;

const api_key = process.env.REACT_APP_API_KEY;
const crypto_key = process.env.REACT_APP_CRYPTO_KEY;

const BASE_URL = "https://projects.teamengine.com/calendar/events";
const httpOptions = {
    headers: { "x-teamengine-test": api_key }
};

class Calendar extends Component {
    state = {
        eventsFromAPI: null,
        today: moment(),
        selectedMoment: moment(),
    }

    constructor(props){
        super(props);

        this.getEventsFromAPI();
    }


    // ------------------ GETTERS ------------------

    getToday = () => {
        return this.state.today;
    }

    getSelectedDay = () => {
        return this.state.selectedMoment.format("D");
    }

    getSelectedMonth = () => {
        return this.state.selectedMoment.format("MMMM");
    }

    getSelectedYear = () => {
        return this.state.selectedMoment.format("YYYY");
    }

    getDaysInSelectedMonth = () => {
        return this.state.selectedMoment.daysInMonth();
    }

    getWeekdaysShort = () => {
        return(moment.weekdaysShort());
    }

    getEventsFromAPI() {
        const url = `${BASE_URL}`;
        return fetch(url, httpOptions)
        // Retrieve its body as ReadableStream
            .then(response => {
                let reader = response.body.getReader().read();
                return reader;
            })
            .then( reader =>{
                let str = new TextDecoder("utf-8").decode(reader.value);
                let bytes  = CryptoJS.AES.decrypt(str, crypto_key);
                let text = bytes.toString(CryptoJS.enc.Utf8);
                this.setState({eventsFromAPI: JSON.parse(text)});

                //return JSON.parse(text);
            });
    }


    // ------------------ ON CLICKS ------------------

    onClickMonthDown(e){
        let newSelectedMonth = this.state.selectedMoment.subtract(1, 'month');
        this.setState({selectedMoment: newSelectedMonth});
        //console.log("Current month: "+this.getSelectedMonth());
    }

    onClickMonthUp(e){
        let newSelectedMonth = this.state.selectedMoment.add(1, 'month');
        this.setState({selectedMoment: newSelectedMonth});
        //console.log("Current month: "+this.getSelectedMonth());
    }

    onClickDay(e, selectedDay){
        let newDay = this.state.selectedMoment.set('date', selectedDay);
        this.setState({selectedMoment: newDay});
    }


    // ------------------ RENDER ------------------

    render() {
        //console.log(this.state.selectedMoment);

        // Check for events
        let daysWithEvents = [];
        let eventsOfSelectedDay = [];
        if(this.state.eventsFromAPI!=null){
            let event = this.state.eventsFromAPI.events;
            for(let i = 0; i<this.state.eventsFromAPI.events.length; i++){
                if(!daysWithEvents.includes(event[i].date.substr(0, 10))){
                    daysWithEvents.push(event[i].date.substr(0, 10));
                }
                if(event[i].date.substr(0, 10) === this.state.selectedMoment.format('YYYY[-]MM[-]DD')){
                    eventsOfSelectedDay.push(event[i]);
                }

            }
        }

        // Add the weekdays
        let wdays = this.getWeekdaysShort();
        let weekdays = wdays.map((day) => {
            let className = "day weekday "+day;
            return (
                <div key={day} className={className} >{day}</div>
            )
        });

        // Add the blank days (days from Monday til the first day of selected month)
        let daysInMonth = [];
        let offset = moment(this.state.selectedMoment).startOf('month').weekday();
        for(let i = 0; i<offset; i++){
            daysInMonth.push(<div key={"blank"+i} className="day blankDay">{""}</div>)
        }

        // Add the Days of the selected month
        for(let i=1; i<=this.getDaysInSelectedMonth(); i++){
            let className = "day";

            // If today is part of selectedMonth, add className "today"
            if(this.state.selectedMoment.format('Y') === this.state.today.format("Y")
                && this.state.selectedMoment.format('M') === this.state.today.format('M')){
                if(i == this.getToday().format('D')){
                    className += " today";
                }
            }

            if(i == this.getSelectedDay()){
                className += " selected-day";
            }

            // Give days with events a special className
            let dayWithEvent = "";
            let day = this.state.selectedMoment.format('YYYY[-]MM[-]');
            if(i<10){
                day += '0'+i;
            } else{
                day+=i;
            }
            if(daysWithEvents.includes(day)){
                dayWithEvent+="day-with-event";
            }

            daysInMonth.push(<div key={i} className={className} onClick={(e)=>{this.onClickDay(e, i)}}>{i} <span className={dayWithEvent}></span></div>);
        }

        let events = eventsOfSelectedDay.map((event) => {
            return(
                <Event key={event.database_id} event={event}/>
            );
        });

        let noEvents = "";
        if(eventsOfSelectedDay.length === 0){
            noEvents = "You don't have any events on this day";
        }




        return (
            <div className="calendar-container">
                <div className="calendar-header">
                    <button onClick={(e)=>{this.onClickMonthDown(e)}}>{"<"}</button>
                    <span className="month-and-year">{this.getSelectedMonth()+" "+this.getSelectedYear()}</span>
                    <button onClick={(e)=>{this.onClickMonthUp(e)}}>{">"}</button>
                </div>
                <div className="calendar">
                    {weekdays}
                    {daysInMonth}
                </div>
                <div className="event-container">
                    <div className="events-title">Events on {this.state.selectedMoment.format('MMMM Do YYYY')}</div>
                    <div className="no-events">{noEvents}</div>
                    {events}
                </div>
            </div>
        );
    }
}

export default Calendar;