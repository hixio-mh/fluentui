import { makeStyles } from '@fluentui/react-make-styles';
import { mixinFunction, mixinFactory } from './mixins';

export const useStyles = makeStyles({
  root: mixinFunction,
  image: mixinFactory(),
});
