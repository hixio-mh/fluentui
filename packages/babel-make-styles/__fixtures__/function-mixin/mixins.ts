import { MakeStyles, MakeStylesStyleRule } from '@fluentui/make-styles';
import { Theme } from '@fluentui/react-theme';

export const mixinFunction: MakeStylesStyleRule<Theme> = theme => ({ color: theme.alias.color.brand.brandBackground });
export const mixinFactory = (): MakeStylesStyleRule<Theme> => {
  return theme => ({
    color: theme.alias.color.brand.brandBackground,
    display: 'flex',
  });
};
export const createMixin = (rule: MakeStyles): MakeStylesStyleRule<Theme> => {
  return theme => ({
    color: theme.alias.color.brand.brandBackground,
    ...rule,
  });
};
