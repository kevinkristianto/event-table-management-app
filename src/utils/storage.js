// utils/storage.js

export const getGuests = () => {
    return JSON.parse(localStorage.getItem('guests') || '[]');
  };
  
  export const saveGuest = (guest) => {
    const guests = getGuests();
    guests.push(guest);
    localStorage.setItem('guests', JSON.stringify(guests));
  };
  
  export const getLayouts = () => {
    return JSON.parse(localStorage.getItem('layouts') || '{}');
  };
  
  export const saveLayout = (name, layout) => {
    const layouts = getLayouts();
    layouts[name] = layout;
    localStorage.setItem('layouts', JSON.stringify(layouts));
  };
  
  export const getLayoutByName = (name) => {
    const layouts = getLayouts();
    return layouts[name] || [];
  };
  
  export const getLayoutNames = () => {
    return Object.keys(getLayouts());
  };
  