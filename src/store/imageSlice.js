import { createSlice } from '@reduxjs/toolkit';
const initialState = '';
const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setImage(state, payload) {
      return (state = payload.payload);
    },
    removeImage(state) {
      return (state = '');
    },
  },
});

export const { setImage, removeImage } = imageSlice.actions;
export default imageSlice.reducer;
