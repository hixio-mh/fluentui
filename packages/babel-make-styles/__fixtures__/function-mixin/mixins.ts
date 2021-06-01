import { MakeStylesStyleRule } from '@fluentui/make-styles';
import { Theme } from '@fluentui/react-theme';

export const mixinFunction: MakeStylesStyleRule<Theme> = theme => ({ color: theme.alias.color.brand.brandBackground });
export const mixinFactory = (): MakeStylesStyleRule<Theme> => {
  return theme => ({ color: theme.alias.color.brand.brandBackground });
};
