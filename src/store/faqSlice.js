import { createSlice } from '@reduxjs/toolkit';

const faqSlice = createSlice({
  name: 'faq',
  initialState: [],
  reducers: {
    fetchFaq(state, action) {
      state.splice(0, state.length);
      state.push(action.payload);
    },
  },
});

export const { fetchFaq } = faqSlice.actions;
export default faqSlice.reducer;
