import '@builder.io/mitosis';
import { isEditing } from '../functions/is-editing';
import { registerComponent } from '../functions/register-component';

export interface FormInputProps {
  type?: string;
  attributes?: any;
  name?: string;
  value?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

export default function FormInputComponent(props: FormInputProps) {
  return (
    <input
      {...props.attributes}
      key={isEditing() && props.defaultValue ? props.defaultValue : 'default-key'}
      placeholder={props.placeholder}
      type={props.type}
      name={props.name}
      value={props.value}
      defaultValue={props.defaultValue}
      required={props.required}
    />
  );
}

registerComponent({
  name: 'Form:Input',
  builtIn: true,
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FIsxPKMo2gPRRKeakUztj1D6uqed2%2Fad6f37889d9e40bbbbc72cdb5875d6ca',
  inputs: [
    {
      name: 'type',
      type: 'text',
      enum: [
        'text',
        'number',
        'email',
        'url',
        'checkbox',
        'radio',
        'range',
        'date',
        'datetime-local',
        'search',
        'tel',
        'time',
        'file',
        'month',
        'week',
        'password',
        'color',
        'hidden',
      ],
      defaultValue: 'text',
    },
    {
      name: 'name',
      type: 'string',
      required: true,
      helperText:
        'Every input in a form needs a unique name describing what it takes, e.g. "email"',
    },
    {
      name: 'placeholder',
      type: 'string',
      defaultValue: 'Hello there',
      helperText: 'Text to display when there is no value',
    },
    // TODO: handle value vs default value automatically like ng-model
    {
      name: 'defaultValue',
      type: 'string',
    },
    {
      name: 'value',
      type: 'string',
      advanced: true,
    },

    {
      name: 'required',
      type: 'boolean',
      helperText: 'Is this input required to be filled out to submit a form',
      defaultValue: false,
    },
  ],

  noWrap: true,
  static: true,
  defaultStyles: {
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '10px',
    paddingRight: '10px',
    borderRadius: '3px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#ccc',
  },
});
