import * as React from 'react';
import Button from '@mui/joy/Button';
import ToggleButtonGroup from '@mui/joy/ToggleButtonGroup';

export default function ToggleGroup({ value, setValue, values }) {
  const [clicked, setClicked] = React.useState(false)
  //const [value, setValue] = React.useState();
  return (

    <ToggleButtonGroup
    //because value only recive number or string as argument
      value={value.toString()}

      onChange={(event, newValue) => {
        if (newValue !== null) {
         // (newValue == "true") ? true : false) because want to convert string to boolean
          setValue((newValue == "true") ? true : false);
        }
      }}

    >
      {values?.map((arrvalue, index) => {
        return (<Button key={index} value={arrvalue?.value.toString()} >{arrvalue?.label}</Button>)

      })}
    </ToggleButtonGroup>

  );
}
