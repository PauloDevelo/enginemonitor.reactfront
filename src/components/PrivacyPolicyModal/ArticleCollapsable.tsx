import React, { useState, useEffect } from 'react';
import {
  Collapse,
  Card,
  CardBody,
  Badge,
} from 'reactstrap';

import './ArticleCollapsable.css';

type Props = {
  title: string;
  className?: string;
  children?: JSX.Element[] | JSX.Element;
}


const ArticleCollapsable = ({ title, className, children }: Props) => {
  const [collapse, setCollapse] = useState(false);
  const toggle = (event: React.MouseEvent) => {
    event.preventDefault();
    setCollapse(!collapse);
  };

  const [badgeClassName, setBadgeClassName] = useState('');

  useEffect(() => {
    if (collapse) {
      setBadgeClassName('active');
    } else {
      setBadgeClassName('');
    }
  }, [collapse]);


  return (
    <>
      <h3 className={className}><Badge className={badgeClassName} color="light" href="_blank" onClick={toggle}>{title}</Badge></h3>
      <Collapse isOpen={collapse}>
        <Card>
          <CardBody className="small-padding">
            {children}
          </CardBody>
        </Card>
      </Collapse>
    </>
  );
};

export default ArticleCollapsable;
