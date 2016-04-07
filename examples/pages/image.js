import React, {Component} from 'react';
import Lazyload from '../../src/';
import Widget from '../components/Widget';
import Operation from '../components/Operation';
import {uniqueId} from '../utils';


export default class Image extends Component {
  render() {
    return (
      <div className="wrapper">
        <Operation type="image" noExtra />
        <div className="widget-list image-container">
          <Lazyload>
            <img src="http://ww3.sinaimg.cn/mw690/62aad664jw1f2nxvya0u2j20u01hc16p.jpg" width="366" height="651" />
          </Lazyload>
          <Lazyload>
            <img src="http://ww1.sinaimg.cn/mw690/62aad664jw1f2nxvyo52qj20u01hcqeq.jpg" width="366" height="651" />
          </Lazyload>
          <Lazyload>
            <img src="http://ww2.sinaimg.cn/mw690/62aad664jw1f2nxvz2cj6j20u01hck1o.jpg" width="366" height="651" />
          </Lazyload>
          <Lazyload>
            <img src="http://ww1.sinaimg.cn/mw690/62aad664jw1f2nxvzfjv6j20u01hc496.jpg" width="366" height="651" />
          </Lazyload>
          <Lazyload>
            <img src="http://ww1.sinaimg.cn/mw690/62aad664jw1f2nxw0e1mlj20u01hcgvs.jpg" width="366" height="651" />
          </Lazyload>
          <Lazyload>
            <img src="http://ww4.sinaimg.cn/mw690/62aad664jw1f2nxw0p95dj20u01hc7d8.jpg" width="366" height="651" />
          </Lazyload>
          <Lazyload>
            <img src="http://ww2.sinaimg.cn/mw690/62aad664jw1f2nxw134xqj20u01hcqjg.jpg" width="366" height="651" />
          </Lazyload>
          <Lazyload>
            <img src="http://ww1.sinaimg.cn/mw690/62aad664jw1f2nxw1kcykj20u01hcn9p.jpg" width="366" height="651" />
          </Lazyload>
        </div>
      </div>
    );
  }
}

