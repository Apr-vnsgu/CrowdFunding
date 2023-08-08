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
    updateCount(state, action) {
      return {
        ...state,
        pledgesAmount: state.pledgesAmount + action.payload,
        totalPledges: state.totalPledges + 1,
      };
    },
  },
});

export const { setCountsTemp, updateCount } = countSlice.actions;
export default countSlice.reducer;
