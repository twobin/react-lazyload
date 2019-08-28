import React, { Component } from 'react';
import Operation from '../components/Operation';
import Lazyload from '../../src/';
import PlaceholderComponent from '../components/Placeholder';

export default class PreventLoading extends Component {
  constructor() {
    super();
    this.state = {
      currentItem: 0,
    };

    this.forward = () => {
      if (this.state.currentItem < 7) {
        this.setState({
          currentItem: this.state.currentItem + 1,
        });
      }
    };

    this.back = () => {
      if (this.state.currentItem > 0) {
        this.setState({
          currentItem: this.state.currentItem - 1,
        });
      }
    };
  }

  render() {
    return <div className="wrapper">
      <Operation type="preventLoading" noExtra />
      <div className="widget-list">
        <div className="gallery">
          <ul className="gallery-items-list" style={{ transform: `translateX(-${this.state.currentItem * 690}px)` }}>
            <li className="gallery-item">
              <Lazyload height={1231} placeholder={<PlaceholderComponent />} offset={9999} preventLoading={this.state.currentItem < 0}>
                <img src="http://ww3.sinaimg.cn/mw690/62aad664jw1f2nxvya0u2j20u01hc16p.jpg" />
              </Lazyload>
            </li>
            <li className="gallery-item">
              <Lazyload height={1231} placeholder={<PlaceholderComponent />} offset={9999} preventLoading={this.state.currentItem < 1}>
                <img src="http://ww1.sinaimg.cn/mw690/62aad664jw1f2nxvyo52qj20u01hcqeq.jpg" />
              </Lazyload>
            </li>
            <li className="gallery-item">
              <Lazyload height={1231} placeholder={<PlaceholderComponent />} offset={9999} preventLoading={this.state.currentItem < 2}>
                <img src="http://ww2.sinaimg.cn/mw690/62aad664jw1f2nxvz2cj6j20u01hck1o.jpg" />
              </Lazyload>
            </li>
            <li className="gallery-item">
              <Lazyload height={1231} placeholder={<PlaceholderComponent />} offset={9999} preventLoading={this.state.currentItem < 3}>
                <img src="http://ww1.sinaimg.cn/mw690/62aad664jw1f2nxvzfjv6j20u01hc496.jpg" />
              </Lazyload>
            </li>
            <li className="gallery-item">
              <Lazyload height={1231} placeholder={<PlaceholderComponent />} offset={9999} preventLoading={this.state.currentItem < 4}>
                <img src="http://ww1.sinaimg.cn/mw690/62aad664jw1f2nxw0e1mlj20u01hcgvs.jpg" />
              </Lazyload>
            </li>
            <li className="gallery-item">
              <Lazyload height={1231} placeholder={<PlaceholderComponent />} offset={9999} preventLoading={this.state.currentItem < 5}>
                <img src="http://ww4.sinaimg.cn/mw690/62aad664jw1f2nxw0p95dj20u01hc7d8.jpg" />
              </Lazyload>
            </li>
            <li className="gallery-item">
              <Lazyload height={1231} placeholder={<PlaceholderComponent />} offset={9999} preventLoading={this.state.currentItem < 6}>
                <img src="http://ww2.sinaimg.cn/mw690/62aad664jw1f2nxw134xqj20u01hcqjg.jpg" />
              </Lazyload>
            </li>
            <li className="gallery-item">
              <Lazyload height={1231} placeholder={<PlaceholderComponent />} offset={9999} preventLoading={this.state.currentItem < 7}>
                <img src="http://ww1.sinaimg.cn/mw690/62aad664jw1f2nxw1kcykj20u01hcn9p.jpg" />
              </Lazyload>
            </li>
          </ul>
          <button className="gallery-control left" onClick={this.back}>{"<<"}</button>
          <button className="gallery-control right" onClick={this.forward}>{">>"}</button>
        </div>
      </div>
    </div>;
  }
}