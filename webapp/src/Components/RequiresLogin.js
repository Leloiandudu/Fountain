import React from 'react';
import classNames from 'classnames';
import ModalDialog from './ModalDialog';
import WikiButton from './WikiButton';
import { withTranslation } from './../translate';
import url from './../url';

class RequiresLogin extends React.Component {
   constructor(props) {
      super(props);
      this.state = { needLogin: false };
   }

   onClickCapture(e) {
      if (!Global.user && !this.state.needLogin) {
         this.setState({ needLogin: true });
         e.preventDefault();
         e.stopPropagation();
      }
   }

   render() {
      const { className, children, redirectTo, translation: { tr } } = this.props;
      return <div onClickCapture={e => this.onClickCapture(e)} className={classNames([ 'RequiresLogin', className ])}>
         <ModalDialog isOpen={this.state.needLogin} className='needLogin'>
            <div className='message'>
               {tr('title')}
            </div>
            <div className='buttons'>
               <WikiButton type='progressive'>
                  <a href={url(`/login?redirectTo=${redirectTo || window.location.pathname}`)}>
                     {tr('ok')}
                  </a>
               </WikiButton>
               <WikiButton onClick={() => this.setState({ needLogin: false })}>
                  {tr('cancel')}
               </WikiButton>
            </div>
         </ModalDialog>
         {children}
      </div>;
   }
}

export default withTranslation(RequiresLogin, 'SignInWarning');
