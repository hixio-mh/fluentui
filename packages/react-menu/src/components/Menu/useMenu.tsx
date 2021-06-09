import * as React from 'react';
import { usePopper } from '@fluentui/react-positioning';
import {
  makeMergePropsCompat,
  resolveShorthandProps,
  useControllableValue,
  useId,
  useOnClickOutside,
  useEventCallback,
} from '@fluentui/react-utilities';
import { useFluent } from '@fluentui/react-provider';
import { elementContains } from '@fluentui/react-portal';
import { useFocusFinders } from '@fluentui/react-tabster';
import { MenuProps, MenuState } from './Menu.types';
import { MenuTrigger } from '../MenuTrigger/index';
import { useMenuContext } from '../../contexts/menuContext';
import { useOnMenuEnterOutside } from '../../utils';

export const menuShorthandProps: (keyof MenuProps)[] = ['menuPopup'];

// eslint-disable-next-line deprecation/deprecation
const mergeProps = makeMergePropsCompat<MenuState>({ deepMerge: menuShorthandProps });

/**
 * Create the state required to render Menu.
 *
 * The returned state can be modified with hooks such as useMenuStyles,
 * before being passed to renderMenu.
 *
 * @param props - props from this instance of Menu
 * @param ref - reference to root HTMLElement of Menu
 * @param defaultProps - (optional) default prop values provided by the implementing type
 *
 * {@docCategory Menu }
 */
export const useMenu = (props: MenuProps, defaultProps?: MenuProps): MenuState => {
  const { targetDocument } = useFluent();
  const triggerId = useId('menu');
  const isSubmenu = useMenuContext(context => context.hasMenuContext);

  const state = mergeProps(
    {
      menuPopup: { as: 'div' },
      position: isSubmenu ? 'after' : 'below',
      align: isSubmenu ? 'top' : 'start',
      openOnHover: isSubmenu,
      triggerId,
    },
    defaultProps,
    resolveShorthandProps(props, menuShorthandProps),
  );

  state.isSubmenu = isSubmenu;

  // TODO Better way to narrow types ?
  const children = React.Children.toArray(state.children) as React.ReactElement[];

  if (children.length !== 2 && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('Menu can only take one MenuTrigger and one MenuList as children');
  }

  const { targetRef: triggerRef, containerRef: menuPopoverRef } = usePopper({
    align: state.align,
    position: state.position,
    coverTarget: state.coverTarget,
  });
  state.menuPopoverRef = menuPopoverRef;
  state.triggerRef = triggerRef;
  children.forEach(child => {
    if (child.type === MenuTrigger) {
      state.menuTrigger = child;
    } else {
      state.menuPopover = child;
    }
  });

  useMenuOpenState(state);
  useMenuSelectableState(state);
  useOnClickOutside({
    contains: elementContains,
    disabled: !state.open,
    element: targetDocument,
    refs: [state.menuPopoverRef, triggerRef],
    callback: e => {
      state.setOpen(e, { open: false, keyboard: false });
    },
  });
  useOnMenuEnterOutside({
    element: document,
    callback: e => state.setOpen(e, { open: false }),
    disabled: !open,
    refs: [state.menuPopoverRef, state.triggerRef],
  });

  return state;
};

/**
 * Adds appropriate state values and handlers for selectable items
 * i.e checkboxes and radios
 */
const useMenuSelectableState = (state: MenuState) => {
  const [checkedValues, setCheckedValues] = useControllableValue(state.checkedValues, state.defaultCheckedValues);
  const { onCheckedValueChange: onCheckedValueChangeOriginal } = state;
  state.checkedValues = checkedValues;
  state.onCheckedValueChange = useEventCallback((e, name, checkedItems) => {
    if (onCheckedValueChangeOriginal) {
      onCheckedValueChangeOriginal(e, name, checkedItems);
    }

    setCheckedValues(s => {
      return s ? { ...s, [name]: checkedItems } : { [name]: checkedItems };
    });
  });
};

const useMenuOpenState = (state: MenuState) => {
  const shouldHandleKeyboadRef = React.useRef(false);
  const shouldHandleTabRef = React.useRef(false);
  const pressedShiftRef = React.useRef(false);
  const parentSetOpen = useMenuContext(context => context.setOpen);
  const onOpenChange: MenuState['onOpenChange'] = useEventCallback((e, data) => state.onOpenChange?.(e, data));

  const [open, setOpen] = useControllableValue(state.open, state.defaultOpen);
  state.open = open !== undefined ? open : state.open;

  state.setOpen = React.useCallback(
    (e, data) => {
      setOpen(prevOpen => {
        // More than one event (mouse, focus, keyboard) can request the popup to close
        // We assume the first event is the correct one
        if (prevOpen !== data.open) {
          onOpenChange?.(e, { ...data });
        }

        if (data.keyboard) {
          shouldHandleKeyboadRef.current = true;
          shouldHandleTabRef.current = (e as React.KeyboardEvent).key === 'Tab';
          pressedShiftRef.current = (e as React.KeyboardEvent).shiftKey;
        }

        if (data.bubble) {
          parentSetOpen(e, { ...data });
        }

        return data.open;
      });
    },
    [setOpen, onOpenChange, parentSetOpen],
  );

  // Manage focus for open state
  const { findFirstFocusable, findNextFocusable, findPrevFocusable } = useFocusFinders();
  const focusFirst = React.useCallback(() => {
    const firstFocusable = findFirstFocusable(state.menuPopoverRef.current);
    firstFocusable?.focus();
  }, [findFirstFocusable, state.menuPopoverRef]);

  const focusAfterMenuTrigger = React.useCallback(() => {
    const nextFocusable = findNextFocusable(state.triggerRef.current);
    nextFocusable?.focus();
  }, [findNextFocusable, state.triggerRef]);

  const focusBeforeMenuTrigger = React.useCallback(() => {
    const prevFocusable = findPrevFocusable(state.triggerRef.current);
    prevFocusable?.focus();
  }, [findPrevFocusable, state.triggerRef]);

  React.useEffect(() => {
    if (!shouldHandleKeyboadRef.current) {
      return;
    }

    if (open) {
      focusFirst();
    } else {
      if (shouldHandleTabRef.current && !state.isSubmenu) {
        pressedShiftRef.current ? focusBeforeMenuTrigger() : focusAfterMenuTrigger();
      } else {
        state.triggerRef.current?.focus();
      }
    }

    shouldHandleKeyboadRef.current = false;
    shouldHandleTabRef.current = false;
    pressedShiftRef.current = false;
  }, [state.triggerRef, state.isSubmenu, open, focusFirst, focusAfterMenuTrigger, focusBeforeMenuTrigger]);

  // Above effect handles only keyboard
  // When a root menu is opened always focus the first menu item
  React.useEffect(() => {
    if (!state.isSubmenu && open) {
      focusFirst();
    }
  }, [state.isSubmenu, open, focusFirst]);
};
