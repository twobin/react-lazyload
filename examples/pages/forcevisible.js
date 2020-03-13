import React, { Component } from 'react';
import { forceVisible } from '../../src/';
import Normal from './normal';

export default class ForceVisible extends Component {
  componentDidMount() {
    forceVisible();
  }
  render() {
    return (
      <Normal />
    );
  }
}

