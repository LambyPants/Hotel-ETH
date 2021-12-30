import { cloneElement, Children } from 'react';

// react-big-calendar doesn't handle mobile select events
// see https://github.com/jquense/react-big-calendar/issues/1434
// this is a hack to avoid forking that repo
export function TouchCellWrapper({ children, value, onSelectSlot }) {
  return cloneElement(Children.only(children), {
    onTouchEnd: () => onSelectSlot({ action: 'click', slots: [value] }),
    style: {
      className: `${children}`,
    },
  });
}
