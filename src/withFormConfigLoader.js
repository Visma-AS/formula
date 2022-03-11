import {forwardRef} from 'react';
import invariant from 'tiny-invariant';
import {useAtomicForm} from './api';
import useResolveElementReferences from './useResolveElementReferences';

export default function withFormConfigLoader(Form) {
  const Resolver = forwardRef(({config, ...other}, ref) => (
    <Form
      ref={ref}
      {...other}
      config={config |> useResolveElementReferences()}
    />
  ));

  const Loader = forwardRef(({id, rev, ...other}, ref) => {
    invariant(
      !(id && other.config),
      'You should not use prop `id` with `config`'
    );

    console.log('configloader');

    return <Form ref={ref} id={id} rev={rev} {...other} config={useAtomicForm(id, rev)}/>;
  });

  return forwardRef((props, ref) => {
    const WithFormConfigLoader =
      // Load config and resolve elements
      props.id
        ? Loader
        : // Optionally resolve directly provided config
        props.resolve
          ? Resolver
          : Form;
    return <WithFormConfigLoader ref={ref} {...props} />;
  });
}
