import React, { useCallback } from 'react';

import classnames from 'classnames';

type Props<T> = {
    data: T;
    onDisplayData: (data:T) => void;
    className?: string;
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
