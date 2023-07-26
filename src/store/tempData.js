import { createSlice } from '@reduxjs/toolkit';

const tempData = createSlice({
  name: 'temp',
  initialState: {},
  reducers: {
    setTemp(state, action) {
      Object.keys(state).forEach((key) => {
        delete state[key];
      });
      Object.assign(state, action.payload);
    },
  },
});

export const { setTemp } = tempData.actions;
export default tempData.reducer;
