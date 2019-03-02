import * as React from 'react';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


class SelectC extends React.Component<any> {
  render() {
    return (
      <FormControl variant="outlined">
        <InputLabel
          // ref={ref => {
          //   this.InputLabelRef = ref;
          // }}
          htmlFor="outlined-age-native-simple"
        >
          Age
      </InputLabel>
        <Select
          native
          value={this.props.value}
          onChange={this.props.onChange}
          input={
            <OutlinedInput
              name="age"
              labelWidth={28}
              id="outlined-age-native-simple"
            />
          }
        >
          {
            this.props.options.map((option: string) => (
              <option value={option}>{option}</option>
            ))
          }
        </Select>
      </FormControl>
    )
  };
}
export default SelectC;