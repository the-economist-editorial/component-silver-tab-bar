import React from 'react';


export default class SilverTabBar extends React.Component {

  static get propTypes() {
    return {
      tabBarDefinitions: React.PropTypes.array.isRequired,
      onPassPlatformToEditor: React.PropTypes.func.isRequired,

    };
  }

// Default tab definition for documentation, if nothing else
  static get defaultProps() {
    return {
      tabBarDefinitions: [
        {
          'parent': 'Print',
          'children': [ 'Narrow', 'Medium', 'Wide' ],
          'note': 'Print has 3 sub-styles, corresponding to 1/2/3 columns',
          'default': true,
        },
        {
          'parent': 'Espresso',
          'children': [],
          'note': 'Espresso has no sub-styles',
          'default': false,
        },
        {
          'parent': 'Other',
          'children': [ 'One', 'Two' ],
          'note': 'Other has two sub-styles',
          'default': false,
        },
      ],
      // onPassPlatformToEditor: () => {},
    };
  }

  constructor(...args) {
    super(...args);
    this.handleParentClick = this.handleParentClick.bind(this);
    this.handleChildClick = this.handleChildClick.bind(this);
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
      let parentClass = 'topic-menu-tab';
      const thisDef = cArray[i];
      // By default, top-level tab button is childless
      let childArray = null;
      let mouseEnterEvent = null;
      let mouseLeaveEvent = null;
      let parentClickEvent = null;
      // Are there any children? If so, set class and call
      // buildChildMenu to assemble a JSX definition
      const childCount = thisDef.children.length;
      // NOTE: allow for one 'default' child...
      if (childCount > 1) {
        parentClass += ' has-child';
        mouseEnterEvent = this.showSubContext.bind(this);
        mouseLeaveEvent = this.hideSubContext.bind(this);
        childArray = this.buildChildMenu(thisDef);
      } else {
        parentClass += ' has-nochild';
        // If parent is childless, it has its own click event:
        // parentClickEvent = this.catchMainContextClick.bind(this, thisDef.parent);
        parentClickEvent = this.handleParentClick;
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
          key={`${ thisDef.parent }-${ i }`}
          onMouseEnter={mouseEnterEvent}
          onMouseLeave={mouseLeaveEvent}
          onClick={parentClickEvent}
        >
          <span className="topic-menu-tab-span">
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
      childArray.push(
        <li
          className="topic-menu-dropdown-li"
          key={`${ tabDef.parent }-child-${ i }`}
          // onClick={this.catchSubContextClick.bind(this, eventObject)}
          onClick = {this.handleChildClick}
        >
          {this.toTitleCase(tabDef.children[i])}
        </li>
      );
    }
    // Embed in 'ul' and return
    return (<ul className="topic-menu-dropdown-ul">
      {childArray}
    </ul>);
  }
  // GET CHILD MENU ends

  // *** Event watchers on menu system ***

  // HANDLE PARENT CLICK
  // Fields click event on a childless tab
  // Select tab and dispatch callback to Editor
  handleParentClick(event) {
    const target = event.target;
    const parent = target.innerText.toLowerCase().trim();
    const eventObj = { parent, child: 'default' };
    // Remove existing selection. Grab all siblings
    // and reset to unselected:
    const liArray = event.target.parentElement.children;
    this.killSelect(liArray);
    // Now select this tab
    target.className = 'topic-menu-tab has-nochild selected';
    // Assemble and dispatch event. Childless contexts return a 'default'
    // child, which is found in the Editor's context node 'widths'
    this.props.onPassPlatformToEditor(eventObj);
  }
  // HANDLE PARENT CLICK ends

  // HANDLE CHILD CLICK
  handleChildClick(event) {
    const target = event.target;
    const gParent = target.parentElement.parentElement;
    // I need to close the dropdown and select the grandparent
    // Get the array of parent lis and deselect all:
    const liArray = target.parentElement.parentElement.parentElement.children;
    this.killSelect(liArray);
    gParent.className = 'topic-menu-tab has-child selected';
    // Assemble the object to pass up
    const child = target.innerText.toLowerCase();
    const ccVal = 10;
    const parent = gParent.innerText.split(String.fromCharCode(ccVal))[0].toLowerCase();
    const eObj = { parent, child };
    this.props.onPassPlatformToEditor(eObj);
  }
  // HANDLE CHILD CLICK ends

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
    if (event.target.className === 'topic-menu-dropdown-li') {
      target = event.target.parentElement.parentElement;
    }
    target.className = 'topic-menu-tab has-child show-menu';
  }
  hideSubContext(event) {
    let target = event.target;
    if (event.target.className === 'topic-menu-dropdown-li') {
      target = event.target.parentElement.parentElement;
    }
    // Simply remove the 'show-menu' class name
    const cStr = target.className.replace('show-menu', '').trim();
    target.className = cStr;
  }
  // SHOW AND HIDE DROP-DOWNS end

  // TO TITLE CASE converts l/c strings to title case for display
  toTitleCase(rawStr) {
    let tStr = rawStr;
    if (rawStr.length > 0) {
      tStr = rawStr.toLowerCase().split(' ').map((str) => str.charAt(0).toUpperCase() + str.substr(1)).join(' ');
    }
    return tStr;
  }
  // TO TITLE CASE ends

  // RENDER
  render() {
    // this.props.tabBarDefinitions is an array of objects, each having
    // properties 'parent' (string) and 'children' (potentially empty array of
    // topic-menu-dropdown-li names)
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
