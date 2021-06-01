import { makeStyles } from '@fluentui/react-make-styles';
import { createMixin, mixinFunction, mixinFactory } from './mixins';

export const useStyles = makeStyles({
  // root: mixinFunction,
  image: mixinFactory(),
  avatar: createMixin({ display: 'block', opacity: '0' }),
});
