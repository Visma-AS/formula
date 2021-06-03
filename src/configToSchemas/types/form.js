import configToProps from '..';

export default ({ config, ...otherProps }) => {
  const properties = config.elements.map((element, index) => [
    element.key ?? String(index),
    configToProps({ ...otherProps, config: element }),
  ]);
  return {
    schema: {
      type: 'object',
      properties: Object.fromEntries(
        properties.map(([name, { schema }]) => [name, schema])
      ),
    },
    uiSchema: Object.fromEntries(
      properties.map(([name, { uiSchema }]) => [name, uiSchema])
    ),
  };
};
