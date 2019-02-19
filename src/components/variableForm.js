import React from "react";
import style from "./variableForm.module.css";

class VariableForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.active };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    this.props.handleFieldSelect(event.target.value);
  }

  render() {
    const { value } = this.state;
    const { variableValues } = this.props;
    const variableOptions = variableValues.map((variable, index) => {
      const { name, description } = variable;
      return (
        <option key={index} value={name}>
          {name}
          {description && `  -  ${description}`}
        </option>
      );
    });

    return (
      <label>
        Pick your measurement:
        <select
          value={value}
          onChange={this.handleChange}
          className={style.select}
        >
          {variableOptions}
        </select>
      </label>
    );
  }
}

export default VariableForm;
