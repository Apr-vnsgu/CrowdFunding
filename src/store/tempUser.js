import { createSlice } from '@reduxjs/toolkit';

const tempUserSlice = createSlice({
  name: 'tempUser',
  initialState: {},
  reducers: {
    setTempUser(state, action) {
      Object.keys(state).forEach((key) => {
        delete state[key];
      });
      Object.assign(state, action.payload);
    },
    removeTempUser(state, action) {
      Object.keys(state).forEach((key) => {
        delete state[key];
      });
    },
  },
});

export const { setTempUser, removeTempUser } = tempUserSlice.actions;
export default tempUserSlice.reducer;
