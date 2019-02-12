import React from 'react';

class VariableForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: props.variableValue };
        this.handleChange = this.handleChange.bind(this)
    }


	handleChange(event) {
        this.setState({ value: event.target.value });
        this.props.handleFieldSelect(event.target.value)
	}

	render() {
		return (
			<label>
				Pick your measurement:
				<select value={this.state.value} onChange={this.handleChange}>
					<option value="Gini">GINI Index</option>
					<option value="WorldHappiness">World Happiness Report</option>
					<option value="HappyPlanet">Happy Planet Index</option>
					<option value="HumanDevIndex">Human Development Index</option>
					<option value="Seda">Sustainable Economic Development Index</option>
					<option value="EconomicFreedom">Overall Economic Freedom Score</option>
				</select>
			</label>
		);
	}
}

export default VariableForm;
