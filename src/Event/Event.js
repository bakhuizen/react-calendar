import React, { Component } from 'react';
import './Event.css';

/*
    Event Component
    Author: Ellinor Bakhuizen
    Version: 2019-03-11
 */

class Event extends Component {
    constructor(props){
        super(props);
    }

    state ={
        title: this.props.event.title,
        time: this.props.event.date.substr(11, 15),
        description: this.props.event.description,
        attendents: this.props.event.attendents,
    }

    render(){
        console.log(this.props.event);

        let attendents = this.state.attendents.map((attendent) => {
            return <div key={attendent}>{attendent}</div>
        });

        return(
            <div className="event">
                <span className="event-title">{this.state.title}</span>
                <span className="event-detail"><span className="bold-text">Time: </span>{this.state.time}</span>
                <span className="event-detail"><span className="bold-text">Description: </span>{this.state.description}</span>
                <span className="event-detail"><span className="bold-text">Attendants: </span>{attendents}</span>
            </div>
        );
    }

}

export default Event;
