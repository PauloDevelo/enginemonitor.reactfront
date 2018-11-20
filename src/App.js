
import React, { Component } from 'react';

import EngineInfo from './EngineInfo';

import axios from "axios";


var mode = 'dev'; //prod or demo
var baseUrl = "http://localhost:8081";
if(mode === 'prod'){
	baseUrl = "http://arbutuspi:8080";
}
else if(mode === 'demo'){
	baseUrl = "http://192.168.0.50:8080";
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
					brand: undefined,
					model: undefined,
					age: undefined,
					installation: Date.now()
        };
    }
	
	componentDidMount() {
		axios
      .get(baseUrl + "/engine-monitor/webapi/enginemaintenance/engineinfo")
      .then(response => {

        // create a new "State" object without mutating 
				// the original State object. 
				const newState = Object.assign({}, this.state, {
					brand: response.data.brand,
					model: response.data.model,
					age: response.data.age,
					installation: new Date(response.data.installation)
				});

				// store the new state object in the component's state
				this.setState(function(prevState, props){ return newState; });
      })
      .catch(error => {
				// create a new "State" object without mutating 
				// the original State object. 
				const newState = Object.assign({}, this.state, {
					brand: undefined,
					model: undefined,
					age: undefined,
					installation: undefined
				});

				// store the new state object in the component's state
				this.setState(newState);
			});
	}
    
	render() {
		return (
			<div id="root" className="d-flex flex-wrap flex-row mb-3">
				<div className="d-flex flex-column flex-fill" style={{width: '300px'}}>
					<EngineInfo brand={this.state.brand} model={this.state.model} age={this.state.age} installation={this.state.installation}/>
					<div id="tasksTable" className="p-2 m-2 border border-primary rounded shadow"></div>
				</div>
				<div className="d-flex flex-column flex-fill" style={{width: '300px'}}>
					<div id="carrouselTaskDetails" className="p-2 m-2 border border-primary rounded shadow"></div>
					<div id="taskHistoric" className="p-2 m-2 border border-primary rounded shadow"></div>
				</div>
			</div>
		);
	}
}

export default App;
