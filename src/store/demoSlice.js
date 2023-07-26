import { createSlice } from '@reduxjs/toolkit';

const demoSlice = createSlice({
  name: 'demo',
  initialState: [],
  reducers: {
    addMess(state, action) {
      state.push(action.payload);
    },
    removeMess(state, action) {
      return state.filter(() => !action.payload);
    },
  },
});

export const { addMess, removeMess } = demoSlice.actions;
export default demoSlice.reducer;
