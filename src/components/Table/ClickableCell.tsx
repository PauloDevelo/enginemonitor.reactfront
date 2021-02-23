/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-unused-vars */
/* eslint-disable react/require-default-props */
// eslint-disable-next-line no-use-before-define
import React, { useCallback } from 'react';

import classnames from 'classnames';

type Props<T> = {
    data: T;
    onDisplayData: (data:T) => void;
    className?: string;
    // eslint-disable-next-line no-undef
    children?: JSX.Element[] | JSX.Element
}

function ClickableCell<T>({
  data, onDisplayData, className, children,
}: Props<T>) {
  const onClick = useCallback(() => {
    onDisplayData(data);
  }, [data, onDisplayData]);

  return (
    <div onClick={onClick} className={classnames(className, 'innerTd clickable')}>
      {children}
    </div>
  );
}

export default ClickableCell;
