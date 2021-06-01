const mixinFactory = () => {
  return theme => ({ color: theme.b });
};
const mixinFunction = theme => ({ color: theme.b });

const _wrap = fn => {
  try {
    return fn();
  } catch (e) {
    return e;
  }
};

const _theme = {
  b: 'green',
};

exports.__mkPreval = [
  _wrap(() =>
    (function (theme) {
      return {
        color: theme.b,
      };
    })(_theme),
  ),
  _wrap(() => (typeof mixinFunction === 'function' ? mixinFunction(_theme) : mixinFunction)),
  _wrap(() => mixinFactory()(_theme)),
];

console.log(exports.__mkPreval);
