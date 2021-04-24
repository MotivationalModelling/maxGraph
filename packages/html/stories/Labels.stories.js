import mxgraph from '@mxgraph/core';

import { globalTypes } from '../.storybook/preview';

export default {
  title: 'Labels/Labels',
  argTypes: {
    ...globalTypes,
    rubberBand: {
      type: 'boolean',
      defaultValue: true
    }
  }
};

const Template = ({ label, ...args }) => {
  const {
    mxGraph,
    mxRubberband,
    mxKeyHandler,
    mxConstants,
    mxRectangle
  } = mxgraph;

  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.width = `${args.width}px`;
  container.style.height = `${args.height}px`;
  container.style.background = 'url(/images/grid.gif)';
  container.style.cursor = 'default';

  // Creates the graph inside the given container
  const graph = new mxGraph(container);
  graph.setTooltips(true);
  graph.htmlLabels = true;
  graph.vertexLabelsMovable = true;

  if (args.rubberBand)
    new mxRubberband(graph);

  new mxKeyHandler(graph);

  // Do not allow removing labels from parents
  graph.graphHandler.removeCellsFromParent = false;

  // Autosize labels on insert where autosize=1
  graph.autoSizeCellsOnAdd = true;

  // Allows moving of relative cells
  graph.isCellLocked = function(cell) {
    return this.isCellsLocked();
  };

  graph.isCellResizable = function(cell) {
    const geo = this.model.getGeometry(cell);

    return geo == null || !geo.relative;
  };

  // Truncates the label to the size of the vertex
  graph.getLabel = function(cell) {
    const label = this.labelsVisible ? this.convertValueToString(cell) : '';
    const geometry = this.model.getGeometry(cell);

    if (
      !this.model.isCollapsed(cell) &&
      geometry != null &&
      (geometry.offset == null ||
        (geometry.offset.x == 0 && geometry.offset.y == 0)) &&
      this.model.isVertex(cell) &&
      geometry.width >= 2
    ) {
      const style = this.getCellStyle(cell);
      const fontSize =
        style[mxConstants.STYLE_FONTSIZE] || mxConstants.DEFAULT_FONTSIZE;
      const max = geometry.width / (fontSize * 0.625);

      if (max < label.length) {
        return `${label.substring(0, max)}...`;
      }
    }

    return label;
  };

  // Enables wrapping for vertex labels
  graph.isWrapping = function(cell) {
    return this.model.isCollapsed(cell);
  };

  // Enables clipping of vertex labels if no offset is defined
  graph.isLabelClipped = function(cell) {
    const geometry = this.model.getGeometry(cell);

    return (
      geometry != null &&
      !geometry.relative &&
      (geometry.offset == null ||
        (geometry.offset.x == 0 && geometry.offset.y == 0))
    );
  };

  // Gets the default parent for inserting new cells. This
  // is normally the first child of the root (ie. layer 0).
  const parent = graph.getDefaultParent();

  // Adds cells to the model in a single step
  graph.getModel().beginUpdate();
  try {
    const v1 = graph.insertVertex(
      parent,
      null,
      'vertexLabelsMovable',
      20,
      20,
      80,
      30
    );

    // Places sublabels inside the vertex
    const label11 = graph.insertVertex(
      v1,
      null,
      'Label1',
      0.5,
      1,
      0,
      0,
      null,
      true
    );
    const label12 = graph.insertVertex(
      v1,
      null,
      'Label2',
      0.5,
      0,
      0,
      0,
      null,
      true
    );

    const v2 = graph.insertVertex(
      parent,
      null,
      'Wrapping and clipping is enabled only if the cell is collapsed, otherwise the label is truncated if there is no manual offset.',
      200,
      150,
      80,
      30
    );
    v2.geometry.alternateBounds = new mxRectangle(0, 0, 80, 30);
    const e1 = graph.insertEdge(parent, null, 'edgeLabelsMovable', v1, v2);

    // Places sublabels inside the vertex
    const label21 = graph.insertVertex(
      v2,
      null,
      'Label1',
      0.5,
      1,
      0,
      0,
      null,
      true
    );
    const label22 = graph.insertVertex(
      v2,
      null,
      'Label2',
      0.5,
      0,
      0,
      0,
      null,
      true
    );
  } finally {
    // Updates the display
    graph.getModel().endUpdate();
  }

  return container;
}

export const Default = Template.bind({});