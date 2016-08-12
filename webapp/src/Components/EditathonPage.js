import React from 'react';
import Api from './../Api';

export default React.createClass({
   getInitialState() {
      return {};
   },
   getCode() {
      return this.props.params.id;
   },
   async componentWillMount() {
      const loc = this.props.location.state;

      let ed = loc && loc.editathon || null;
      this.setState({ editathon: ed });

      if (!ed || !ed.articles) {
         await this.reload();
      }
   },
   async reload() {
      this.setState({
         editathon: await Api.getEditathon(this.getCode())
      });
   },
   render() {
      return (
         <div className='EditathonPage'>
            <h1>{this.state.editathon && this.state.editathon.name}</h1>
            {React.cloneElement(this.props.children, {
               editathon: this.state.editathon,
               onReloadEditathon: this.reload,
               code: this.getCode()
            })}
         </div>
      );
   },
});
