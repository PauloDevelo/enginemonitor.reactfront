import React, {useCallback} from 'react';

type Props<T> = {
    data: T;
    onDisplayData: (data:T) => void;
    classNames?: string;
    children?: JSX.Element[] | JSX.Element
}

function ClickableCell<T>({data, onDisplayData, classNames, children}: Props<T>){
    const onClick = useCallback(() => {
        onDisplayData(data);
    }, [data, onDisplayData]);

    classNames = classNames === undefined ? '' : classNames;

    return (
        <div onClick={onClick} className={classNames + ' innerTd clickable'} >
            {children}
        </div>
    );
}

export default ClickableCell;