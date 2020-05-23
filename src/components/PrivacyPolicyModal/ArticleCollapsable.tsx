import React, { useState } from 'react';
import {
  Collapse,
  Card,
  CardBody,
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

  return (
    <>
      <a href="_blank" onClick={toggle}><h3 className={className}>{title}</h3></a>
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
