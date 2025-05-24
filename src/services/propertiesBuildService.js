const TABLE_SIZE = 60;
const CHAIR_SIZE = 30;

export const createNewElement = (type, canvasRect) => {
  return {
    id: Date.now(),
    type,
    name: '',
    x:
      canvasRect.width / 2 -
      (type === 'table' ? TABLE_SIZE / 2 : CHAIR_SIZE / 2),
    y:
      canvasRect.height / 2 -
      (type === 'table' ? TABLE_SIZE / 2 : CHAIR_SIZE / 2),
    width: type === 'table' ? TABLE_SIZE : CHAIR_SIZE,
    height: type === 'table' ? TABLE_SIZE : CHAIR_SIZE,
  };
};

export const updateElementPosition = (
  elements,
  id,
  clientX,
  clientY,
  canvasRect
) => {
  return elements.map((el) =>
    el.id === id
      ? {
          ...el,
          x: clientX - canvasRect.left - el.width / 2,
          y: clientY - canvasRect.top - el.height / 2,
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

export const joinTables = (elements, selectedTables) => {
  if (selectedTables.length < 2)
    return { updatedElements: elements, newSelectedTables: selectedTables };

  const totalWidth = selectedTables.reduce((sum, t) => sum + t.width, 0);
  const avgY =
    selectedTables.reduce((sum, t) => sum + t.y, 0) / selectedTables.length;
  const minX = Math.min(...selectedTables.map((t) => t.x));
  const joinedFrom = selectedTables.flatMap((t) =>
    t.joinedFrom ? t.joinedFrom : [t.id]
  );

  const newTable = {
    id: Date.now(),
    type: 'table',
    name: '',
    x: minX,
    y: avgY,
    width: totalWidth,
    height: TABLE_SIZE,
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
