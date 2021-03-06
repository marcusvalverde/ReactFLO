import { DisplayNode, Prop } from "../interfaces";
const { Traverse } = require("./dataTraversal");

// Export as module
// this function converts fibernode to display node and populates the children and sibling arrays recursively 
const fiberNodeToTree = (fiberNode) => {
  // Convert dual linked list structure into graph
  // Create a new node
  const convertedNode = convertToDisplayNode(fiberNode);
  // Add child and child's siblings to array
  let childNode = fiberNode.child;
  while (childNode) {
    convertedNode.children.push(fiberNodeToTree(childNode));
    childNode = childNode.sibling;
  }
  // Return converted node
  return convertedNode
};

// Export as module
const connectToParent = (node: DisplayNode) => {
  for (const child of node.children) {
    child.parent = node;
    connectToParent(child);
  }
};

// declare function that will return obj with the structure of each indiviual node saved from fiber 
const convertToDisplayNode = (node): DisplayNode => {
  return {
    id :checkDebug(node),
    tag: node.tag,
    name: assignName(node),
    type: assignType(node),
    state: convertState(node),
    props: convertProps(node),
    parent: null,
    children: [],
    displayName: null,
    displayWeight: 0,
    pathWeight: 0,
    mediums: [],
  }
}

// will create structure of state that we take from fiber 
const convertState = (node): Prop => {
  if (!node.memoizedState) return null;
  return {
    key: 'State',
    // Spread operator prevents unwanted circular references
    value: JSON.parse(JSON.stringify(node.memoizedState)),
    type: (node.memoizedState.memoizedState && node._debugHookTypes[0] === 'useState') ? 'hook' : 'componentState',
  }
};

// Assigns name of component to simpleNode
// (Need to add in all cases?)
const assignName = (node): any => {
  // Find name of a class component
  if (node.type && node.type.name) return node.type.name;
  // Find a functional component
  if (node.tag === 0) return 'FC';
  // Tag 5 === HostComponent
  if (node.tag === 5) return `${node.type}`;
  // Tag 3 === HostRoot 
  if (node.tag === 3) return 'HR';
  // Tag 3 === HostText
  if (node.tag === 6) {
    return node.memoizedProps;
  }
  if (node.tag === 7) return "Fragment";
};

// Component Types
const componentTypes = {
  0: 'Functional Component',
  1: 'Class Component',
  2: 'Indeterminate Component',
  3: 'Host Root',
  4: 'Host Portal',
  5: 'Host Component',
  6: 'Host Text',
  7: 'Fragment',
  8: 'Mode',
  9: 'Context Consumer',
  10: 'Context Provider',
  11: 'ForwardRef',
  12: 'Profiler',
  13: 'Suspense Component',
  14: 'Memo Component',
  15: 'Simple Memo Component',
  16: 'Lazy Component'
};

// Assigns type of component to simpleNode
const assignType = (node): any => {
  // Check if tag is equal to key in componentTypes and return value
  return componentTypes[node.tag];
};

// Check for debug id\
// NEED TO FIX THIS STILL
const checkDebug = (node): number => {
  if (node._debugID) return node._debugID;
  return 0;
};

// PROPS
// memoizedProps will be an object of key/value pairs of props
// We can also check tag to check for what type of component it is

const convertProps = (node) => {
  // Check if node has props
  // If not return null
  if (!node.memoizedProps) return null;
  // Create props array
  const props: Prop[] = [];
  // Iterate through memoizedProps.props
  for (const key in node.memoizedProps) {
    try {
      // Create a prop object
      const prop: Prop = {
        // Store values in object
        key,
        // Create a clone of the prop value to preserve composet values
        value: JSON.parse(JSON.stringify(node.memoizedProps[key])),
        type: 'prop',
      };
      // Push object to props array
      props.push(prop);
    } catch (error) {
      continue;
    }
  }
  // Return props array
  return props;
};

module.exports = { fiberNodeToTree, connectToParent }