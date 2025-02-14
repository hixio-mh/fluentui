import * as React from 'react';
import { MenuContextValue } from '../contexts/menuContext';

/**
 * Helper function that checks if a blur event moves focus outside of the menu trigger and menu popup
 * Only needed for focus moving between nested submenus with mouse
 */
export const isOutsideMenu = ({
  triggerRef,
  menuPopoverRef,
  event,
}: {
  triggerRef: MenuContextValue['triggerRef'];
  menuPopoverRef: MenuContextValue['menuPopoverRef'];
  event: React.FocusEvent; // onBlur
}) => {
  // no related target -> nothing got focus
  // don't need to handle this because focus did not move between submenus
  if (!event.relatedTarget) {
    return false;
  }

  const isOutsidePopup = !menuPopoverRef.current?.contains(event.relatedTarget as Node);
  const isOutsideTrigger = !triggerRef.current?.contains(event.relatedTarget as Node);

  return isOutsidePopup && isOutsideTrigger;
};
