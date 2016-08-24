import React from 'react';

export default React.createClass({
   render() {
      return (
         <div className="block header"><span>{this.props.title}</span>{this.props.children}</div>
      );
   },
});
