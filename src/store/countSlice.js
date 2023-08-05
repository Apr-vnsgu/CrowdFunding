import { createSlice } from '@reduxjs/toolkit';

const countSlice = createSlice({
  name: 'count',
  initialState: {},
  reducers: {
    setCountsTemp(state, action) {
      Object.keys(state).forEach((key) => {
        delete state[key];
      });
      Object.assign(state, action.payload);
    },
  },
});

export const { setCountsTemp } = countSlice.actions;
export default countSlice.reducer;
