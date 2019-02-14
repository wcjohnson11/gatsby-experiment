import React from "react";

class VariableForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.active, variables: props.variableValues };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    this.props.handleFieldSelect(event.target.value);
  }

  render() {
    const { variables } = this.state;
    const variableOptions = variables.map((variable, index) => {
      var label = variable.label;
      return (
        <option key={index} value={variable.value}>
          {label}
          {variable.description && `  -  ${variable.description}`}
        </option>
      );
    });
    return (
      <label>
        Pick your measurement:
        <select value={this.state.value} onChange={this.handleChange}>
          {variableOptions}
        </select>
      </label>
    );
  }
}

export default VariableForm;
