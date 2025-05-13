export const getGuests = () => {
    return JSON.parse(localStorage.getItem('guests') || '[]');
  };
  
  export const saveGuest = (guest) => {
    const guests = getGuests();
    guests.push(guest);
    localStorage.setItem('guests', JSON.stringify(guests));
  };
  
  export const getLayout = () => {
    return JSON.parse(localStorage.getItem('layout') || '[]');
  };
  
  export const saveLayout = (layout) => {
    localStorage.setItem('layout', JSON.stringify(layout));
  };
  