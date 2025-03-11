import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import authReducer from './authReducer';

const rootReducer = combineReducers({
  auth: authReducer,
});

const store = createStore(
  rootReducer,
  applyMiddleware(thunk as ThunkMiddleware)
);

export type RootState = ReturnType<typeof rootReducer>;
export default store;
