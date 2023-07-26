import { createSlice } from '@reduxjs/toolkit';

const loginSlice = createSlice({
  name: 'login',
  initialState: '',
  reducers: {
    setJwt(state, action) {
      return (state = action.payload);
    },
    removeJwt(state, action) {
      return (state = '');
    },
  },
});

export const { removeJwt, setJwt } = loginSlice.actions;
export default loginSlice.reducer;
