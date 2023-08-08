import { createSlice } from '@reduxjs/toolkit';

const faqSlice = createSlice({
  name: 'faq',
  initialState: [],
  reducers: {
    fetchFaq(state, action) {
      state.splice(0, state.length);
      state.push(action.payload);
    },
    addFaq(state, action) {
      state[0].push(action.payload);
    },
  },
});

export const { fetchFaq, addFaq } = faqSlice.actions;
export default faqSlice.reducer;
