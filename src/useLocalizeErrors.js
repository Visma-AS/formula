/* eslint-disable formatjs/no-id */
/* eslint-disable formatjs/enforce-default-message */
import { defineMessages } from '@formatjs/intl';
import { get, mapValues } from 'lodash';
import { useIntl } from 'react-intl';

const messages = defineMessages({
  minItems: {
    defaultMessage: '"{field}" tulee sisältää vähintään {limit} alkiota',
  },
  maxItems: {
    defaultMessage: '"{field}" tulee sisältää korkeintaan {limit} alkiota',
  },
  minLength: {
    defaultMessage:
      '"{field}" {limit, plural, =1 {on pakollinen kenttä} other {tulee sisältää vähintään # merkkiä}}',
  },
  maxLength: {
    defaultMessage:
      '"{field}" {limit, plural, =1 {on pakollinen kenttä} other {tulee sisältää korkeintaan # merkkiä}}',
  },
  enum: {
    defaultMessage: '"{field}" vaatii hyväksynnän',
  },
  minimum: {
    defaultMessage: '"{field}" täytyy olla suurempi kuin {limit}',
  },
  maximum: {
    defaultMessage: '"{field}" täytyy olla pienempi kuin {limit}',
  },

  pattern: { defaultMessage: '"{field}" arvon on oltava {description}' },
  required: { defaultMessage: '"{field}" on pakollinen kenttä' },
  type: { defaultMessage: '"{field}" tulee olla {type}' },
});

const type = defineMessages({
  file: { defaultMessage: 'valittu' },
  string: { defaultMessage: 'tekstiarvo' },
  number: { defaultMessage: 'numero'},
  boolean: { defaultMessage: 'booleanarvo' },
  array: { defaultMessage: 'taulu' },
});

const params = { type };

export default (props) => {
  const intl = useIntl();

  return {
    ...props,
    transformErrors: (errors) => {
      const transformedErrors = errors.map((error) => {
        const messageDescriptor = messages[error.name];
        if (!messageDescriptor) {
          return error;
        }

        const { schema, uiSchema } = props;
        const errorProperty = error.property
          // .properties[0].enum --> [0]
          .replace(/^\.properties/, '')
          .replace(/\.enum$/, '')
          // Array item's array: ['0'][10] --> ['0']
          .replace(/\[\d+\]$/, '');
        const errorPropertyArray = errorProperty
          .slice(1, -1)
          .split('][')
        const { fieldSchema, fieldUISchema } = errorPropertyArray
          .reduce(
            function accumulator({ fieldSchema, fieldUISchema }, pathPart, index) {
              if (fieldSchema.type === 'object') {
                return {
                  fieldSchema: get(fieldSchema.properties, `[${pathPart}]`),
                  fieldUISchema: get(fieldUISchema, `[${pathPart}]`),
                };
              }
              if (fieldSchema.type === 'array') {
                return accumulator(
                  {
                    fieldSchema: fieldSchema.items,
                    fieldUISchema: fieldUISchema.items,
                  },
                  errorPropertyArray[index + 1]
                );
              }
              return {
                fieldSchema,
                fieldUISchema: fieldUISchema,
              };
            },
            {
              fieldSchema: schema,
              fieldUISchema: uiSchema,
            }
          );
        const { title } = fieldSchema;
        const { patternDescription } = fieldUISchema;
        const message = intl.formatMessage(messageDescriptor, {
          field: title,
          description: { pattern: patternDescription }[error.name],
          ...mapValues(
            mapValues(error.params, stringDataUrlToFile(fieldSchema)),
            (value, key) =>
              key in params && value in params[key]
                ? intl.formatMessage(params[key][value])
                : value
          ),
        });

        return {
          ...error,
          params: { pattern: patternDescription },
          message,
          stack: message,
        };
      });

      return props.transformErrors
        ? props.transformErrors(transformedErrors)
        : transformedErrors;
    },
  };
};

const stringDataUrlToFile = (fieldSchema) => (value) =>
  [fieldSchema.format, fieldSchema.items?.format].includes('data-url')
    ? 'file'
    : value;
