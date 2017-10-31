import React from 'react';
import Loader from './Loader';

export default class Remote extends React.Component {
   constructor(props) {
      super(props);
      this.state = { data: null };
   }

   async componentDidMount() {
      this.update(this.props.getData);
   }

   update() {
      return this._update(this.props.getData);
   }

   async _update(getData) {
      if (!getData) return false;

      this.setState({
         data: await getData(),
      });

      return true;
   }

   componentWillReceiveProps({ getData }) {
      this.update(getData);
   }

   render() {
      const { children, render, propName = 'data' } = this.props;
      const { data } = this.state;
      
      if (!children && !render) return null;
      if (!data) return <Loader />;

      if (render) {
         return render(data);
      } else {
         return React.cloneElement(children, { [propName]: data });
      }
   }
}
