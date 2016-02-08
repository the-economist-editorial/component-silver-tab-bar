import React from 'react';

export default class SilverTabBar extends React.Component {

  static get propTypes() {
    return {
      contextDefinitions: React.PropTypes.array.isRequired,
    };
  }

  static get defaultProps() {
    return {
    };
  }

  // GET SUB CONTEXT
  // Called from buildContextMenu to assemble children
  // of one main context 'tab'
  getSubContext(tabDef) {
    // Array JSX elements to return
    const childArray = [];
    // Append child <li> elements
    for (let i = 0; i < tabDef.children.length; i++) {
      const child = tabDef.children[i];
      const eventObject = {
        parent: tabDef.parent,
        child,
      };
      childArray.push(
        <li
          className="sub-context"
          key={`${tabDef.parent}-child-${i}`}
          onClick={this.catchSubContextClick.bind(this, eventObject)}
        >
          {tabDef.children[i]}
        </li>
      );
    }
    return (<ul>
      {childArray}
    </ul>);
  }
  // GET SUB CONTEXT ends

  catchMainContextClick(eStr) {
    const eObj = {
      parent: eStr,
    };
    // NOTE: I need to select the 'tab'
    console.log(eObj);
  }
  // catchSubContextClick(eObj, event) {
  catchSubContextClick(eObj) {
    // NOTE: I need to close the dropdown and select the grandparent
    console.log(eObj);
  }

  showSubContext(event) {
    let target = event.target;
    if (event.target.className === 'sub-context') {
      target = event.target.parentElement.parentElement;
    }
    target.className = 'has-child show-menu';
  }
  hideSubContext(event) {
    let target = event.target;
    if (event.target.className === 'sub-context') {
      target = event.target.parentElement.parentElement;
    }
    target.className = 'has-child';
  }

  // onMouseLeave={this.hideSubContext.bind(this)}

  // BUILD CONTEXT MENU
  // Called from Render to assemble complete JSX content
  buildContextMenu(cArray) {
    const parentArray = [];
    // One 'tab' at a time...
    for (let i = 0; i < cArray.length; i++) {
      const thisDef = cArray[i];
      // By default, main context is childless:
      let parentClass = 'has-nochild';
      let childArray = null;
      let mouseEnterEvent = null;
      let mouseLeaveEvent = null;
      let parentClickEvent = null;
      // Are there any children?
      const childCount = thisDef.children.length;
      if (childCount > 0) {
        parentClass = 'has-child';
        mouseEnterEvent = this.showSubContext.bind(this);
        mouseLeaveEvent = this.hideSubContext.bind(this);
        childArray = this.getSubContext(thisDef);
      } else {
        parentClickEvent = this.catchMainContextClick.bind(this, thisDef.parent);
      }

      parentArray.push(
        <li className={parentClass}
          key={`${thisDef.parent}-${i}`}
          onMouseEnter={mouseEnterEvent}
          onMouseLeave={mouseLeaveEvent}
          onClick={parentClickEvent}
        >
          <span>
            {thisDef.parent}
          </span>
          {childArray}
        </li>
      );
    }
    // Embed parent array in outer <ul> tag and return;
    return (<ul className="topic-menu-nav">
      {parentArray}
    </ul>);
  }
  // BUILD CONTEXT MENU ends


  // RENDER
  render() {
    // this.props.contextDefinitions is an array of objects, each having
    // properties 'parent' (string) and 'children' (potentially empty array of
    // sub-context names)
    // By default
    const contextMenu = this.buildContextMenu(this.props.contextDefinitions);
    return (
      <div>{contextMenu}</div>
    );
  }
}
