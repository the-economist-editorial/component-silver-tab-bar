import React from 'react';

export default class SilverTabBar extends React.Component {

  static get propTypes() {
    return {
      tabBarDefinitions: React.PropTypes.array.isRequired,
      passContextToEditor: React.PropTypes.func.isRequired,

    };
  }

  // *** 2 functions construct tab bar with dropdowns ***

  // BUILD PARENT MENU
  // Called from Render to assemble complete JSX tab widget
  // Calls buildChildMenu to append dropdowns
  buildParentMenu(cArray) {
    // Array to contain all tab definitions:
    const parentArray = [];
    // One 'tab' at a time...
    for (let i = 0; i < cArray.length; i++) {
      const thisDef = cArray[i];
      // By default, top-level tab button is childless
      let parentClass = 'has-nochild';
      let childArray = null;
      let mouseEnterEvent = null;
      let mouseLeaveEvent = null;
      let parentClickEvent = null;
      // Are there any children? If so, set class and call
      // buildChildMenu to assemble a JSX definition
      const childCount = thisDef.children.length;
      // NOTE: allow for one 'default' child...
      if (childCount > 1) {
        parentClass = 'has-child';
        mouseEnterEvent = this.showSubContext.bind(this);
        mouseLeaveEvent = this.hideSubContext.bind(this);
        childArray = this.buildChildMenu(thisDef);
      } else {
        // If parent is childless, it has its own click event:
        parentClickEvent = this.catchMainContextClick.bind(this, thisDef.parent);
      }
      // Default highlight:
      if (thisDef.default) {
        parentClass += ' selected';
      }
      // Append this tab to the array of 'li' tab elements
      // The dependent 'child' is either null (by default, above)...
      // or an array that defines the dropdown...
      parentArray.push(
        <li className={parentClass}
          key={`${thisDef.parent}-${i}`}
          onMouseEnter={mouseEnterEvent}
          onMouseLeave={mouseLeaveEvent}
          onClick={parentClickEvent}
        >
          <span>
            {this.toTitleCase(thisDef.parent)}
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
  // BUILD PARENT MENU ends

  // GET CHILD MENU
  // Called from buildParentMenu to assemble children
  // of one parent 'tab'
  buildChildMenu(tabDef) {
    // Array of JSX 'li' elements to return
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
          {this.toTitleCase(tabDef.children[i])}
        </li>
      );
    }
    // Embed in 'ul' and return
    return (<ul>
      {childArray}
    </ul>);
  }
  // GET CHILD MENU ends

  // *** Event watchers on menu system ***

  // CATCH MAIN CONTEXT CLICK
  // Fields click event on a childless tab
  // Select tab and dispatch callback to Editor
  catchMainContextClick(eStr, event) {
    // Param 1 is the displayed label
    // Remove existing selection. Grab all siblings
    // and reset to unselected state:
    const liArray = event.target.parentElement.children;
    this.killSelect(liArray);
    // Now select this tab
    event.target.className = 'has-nochild selected';
    // Assemble and dispatch event. Childless contexts return a 'default'
    // child, which is found in the Editor's context node 'widths'
    const eObj = {
      parent: eStr,
      child: 'default',
    };
    this.props.passContextToEditor(eObj);
  }
  // CATCH MAIN CONTEXT CLICK ends

  // CATCH SUB CONTEXT CLICK
  catchSubContextClick(eObj, event) {
    // Param 1 is an object with parent and child
    const target = event.target;
    // NOTE: I need to close the dropdown and select the grandparent
    // Get the array of parent lis and deselect all:
    const liArray = target.parentElement.parentElement.parentElement.children;
    this.killSelect(liArray);
    // Now select parent of this dropdown
    target.parentElement.parentElement.className = 'has-child selected';
    this.props.passContextToEditor(eObj);
  }
  // CATCH SUB CONTEXT CLICK ends

  // *** Other functions ***

  // KILL SELECT is called from both event-catchers. Passed an
  // array of 'li' elements, it deletes the 'selected' className
  killSelect(liArray) {
    for (let i = 0; i < liArray.length; i++) {
      const cStr = liArray[i].className.replace('selected', '').trim();
      liArray[i].className = cStr;
    }
  }
  // KILL SELECT ends

  // SHOW AND HIDE DROP-DOWNS, assigned to mouse-Enter and
  // -Leave events on parent tabs
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
    // Simply remove the 'show-menu' class name
    const cStr = target.className.replace('show-menu', '').trim();
    target.className = cStr;
  }
  // SHOW AND HIDE DROP-DOWNS end

  // TO TITLE CASE converts l/c strings to title case for display
  toTitleCase(string) {
    let tStr = string;
    if (string.length > 0) {
      tStr = string.toLowerCase().split(' ').map((str) => str.charAt(0).toUpperCase() + str.substr(1)).join(' ');
    }
    return tStr;
  }
  // TO TITLE CASE ends

  // RENDER
  render() {
    // this.props.tabBarDefinitions is an array of objects, each having
    // properties 'parent' (string) and 'children' (potentially empty array of
    // sub-context names)
    // NOTE: I may have to deal with children that have only 1 element, a
    // default to use, but which doesn't display a dropdown...
    // Assemble complete parent/child tab-bar JSX:
    const contextMenu = this.buildParentMenu(this.props.tabBarDefinitions);
    // Containing div is required
    return (
      <div>{contextMenu}</div>
    );
  }
}
