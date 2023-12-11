import { createSlice } from '@reduxjs/toolkit';
const messageSlice = createSlice({
  name: 'messages',
  initialState: [],
  reducers: {
    populateMessages(state, action) {
      const { payload } = action;
      state.splice(0, state.length);
      state.push(payload);
    },
    deleteAllMessages(state) {
      state.splice(0, state.length);
    },
  },
});
export const { populateMessages, deleteAllMessages } = messageSlice.actions;
export default messageSlice.reducer;
// .reduce((grouped, message) => {
//   const senderId = message.senderId;

//   // Check if senderId is already a key in grouped object
//   if (!grouped[senderId]) {
//     // If not, create a new key with an array containing the first message
//     grouped[senderId] = [message];
//   } else {
//     // If yes, push the current message to the existing array
//     grouped[senderId].push(message);
//   }
//   return grouped;
// }, [])
