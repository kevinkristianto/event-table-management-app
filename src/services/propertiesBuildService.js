const TABLE_SIZE = 60;
const CHAIR_SIZE = 30;

export const createNewElement = (
  type,
  canvasRect,
  zoomLevel,
  contentPosition
) => {
  const centerX =
    (canvasRect.width / 2 - contentPosition.x) / zoomLevel -
    (type === 'table' ? TABLE_SIZE / 2 : CHAIR_SIZE / 2);
  const centerY =
    (canvasRect.height / 2 - contentPosition.y) / zoomLevel -
    (type === 'table' ? TABLE_SIZE / 2 : CHAIR_SIZE / 2);

  return {
    id: Date.now(),
    type,
    name: '',
    x: centerX,
    y: centerY,
    width: type === 'table' ? TABLE_SIZE : CHAIR_SIZE,
    height: type === 'table' ? TABLE_SIZE : CHAIR_SIZE,
    rotation: 0,
  };
};

export const updateElementPosition = (
  elements,
  id,
  clientX,
  clientY,
  canvasRect,
  zoomLevel,
  contentPosition
) => {
  return elements.map((el) =>
    el.id === id
      ? {
          ...el,
          x:
            (clientX - canvasRect.left - contentPosition.x) / zoomLevel -
            el.width / 2,
          y:
            (clientY - canvasRect.top - contentPosition.y) / zoomLevel -
            el.height / 2,
        }
      : el
  );
};

export const toggleTableSelection = (selectedTables, element) => {
  if (element.type !== 'table') return selectedTables;
  const isSelected = selectedTables.some((t) => t.id === element.id);
  if (isSelected) {
    return selectedTables.filter((t) => t.id !== element.id);
  } else {
    return [...selectedTables, element];
  }
};

export const toggleChairSelection = (selectedChairs, element) => {
  if (element.type !== 'chair') return selectedChairs;

  const isSelected = selectedChairs.some((c) => c.id === element.id);
  if (isSelected) {
    return selectedChairs.filter((c) => c.id !== element.id);
  } else {
    return [...selectedChairs, element];
  }
};

export const joinTables = (elements, selectedTables) => {
  if (selectedTables.length < 2)
    return { updatedElements: elements, newSelectedTables: selectedTables };

  const totalWidth = selectedTables.reduce((sum, t) => sum + t.width, 0);
  const baseY = selectedTables[0].y; // Align to Y of first selected
  const startX = Math.min(...selectedTables.map((t) => t.x)); // Leftmost start
  const joinedFrom = selectedTables.flatMap((t) =>
    t.joinedFrom ? t.joinedFrom : [t.id]
  );

  const newTable = {
    id: Date.now(),
    type: 'table',
    name: '',
    x: startX,
    y: baseY,
    width: totalWidth,
    height: TABLE_SIZE,
    rotation: 0,
    joinedFrom,
  };

  const updatedElements = elements.filter(
    (el) => !selectedTables.some((t) => t.id === el.id)
  );

  return {
    updatedElements: [...updatedElements, newTable],
    newSelectedTables: [newTable],
  };
};

export const applyNameEdit = (elements, editingId, editingName) => {
  return elements.map((el) =>
    el.id === editingId ? { ...el, name: editingName } : el
  );
};

export const deleteElementById = (elements, id) => {
  return elements.filter((el) => el.id !== id);
};
