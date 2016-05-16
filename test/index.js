import 'babel-polyfill';
import SilverTabBar from '../src';
import React from 'react';
import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
import { mount } from 'enzyme';
chai.use(chaiEnzyme()).should();
describe('SilverTabBar', () => {

  it('renders a React element', () => {
    React.isValidElement(<SilverTabBar />).should.equal(true);
  });

  describe('Rendering', () => {
    let rendered = null;
    let silverTabBar = null;
    beforeEach(() => {
      rendered = mount(<SilverTabBar />);
      silverTabBar = rendered.find('.silver-tab-bar');
    });

    it('renders a top level div.silver-tab-bar', () => {
      silverTabBar.should.have.tagName('div');
      silverTabBar.should.have.className('silver-tab-bar');
    });

    xit('renders <FILL THIS IN>', () => {
      silverTabBar.should.have.exactly(1).descendants('.the-descendent-class');
      silverTabBar.find('.the-descendent-class').should.have.tagName('TAG');
    });

  });

});
