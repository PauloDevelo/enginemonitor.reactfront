import React from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, Media,
} from 'reactstrap';

import { FormattedMessage, defineMessages } from 'react-intl';

import global from '../../global';

import jsonMessages from './ModalAbout.messages.json';

const aboutMsg = defineMessages(jsonMessages);

type Props = {
visible: boolean;
className?: string;
toggle: ()=>void;
}

const ModalAbout = ({ visible, className, toggle }: Props) => (
  <Modal isOpen={visible} toggle={toggle} className={className} fade>
    <ModalHeader toggle={toggle}>
      <Media left>
        <Media object src="./images/engine48.png" alt="Equipment Maintenance icon" />
      </Media>
      <Media body>
        <Media heading>
          <FormattedMessage {...aboutMsg.title} />
&nbsp;v
          {global.getAppVersion()}
        </Media>
        <FormattedMessage {...aboutMsg.about} />
      </Media>
    </ModalHeader>
    <ModalBody>
      {visible && (<Form id="aboutForm" />)}
    </ModalBody>
    <ModalFooter>
      <Button type="submit" form="aboutForm" color="success" onClick={toggle}><FormattedMessage {...aboutMsg.ok} /></Button>
    </ModalFooter>
  </Modal>
);

export default ModalAbout;
