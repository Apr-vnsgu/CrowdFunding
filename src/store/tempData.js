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
    deleteTemp(state, action) {
      Object.keys(state).forEach((key) => {
        delete state[key];
      });
    },
    addLike(state, action) {
      return {
        ...state,
        likes: state.likes + 1,
      };
    },
    removeLike(state, action) {
      return {
        ...state,
        likes: state.likes - 1,
      };
    },
    addPledge(state, action) {
      return {
        ...state,
        pledge_amount: state.pledge_amount + action.payload,
      };
    },
    addComment(state, action) {
      console.log(action.payload);
      return {
        ...state,
        comments: [...state.comments, action.payload],
      };
    },
  },
});

export const {
  setTemp,
  deleteTemp,
  addLike,
  removeLike,
  addPledge,
  addComment,
} = tempData.actions;
export default tempData.reducer;
