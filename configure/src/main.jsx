import React from 'react';

require('./index.less')

class Main extends React.Component {

  render() {
    return <div className="corespring-match-config-root">
      Hello, world.
    </div>;
  }

}

Main.propTypes = {
  model: React.PropTypes.object
};

Main.defaultProps = {
  model: {}
};

export default Main;