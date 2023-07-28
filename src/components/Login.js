import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { enqueueSnackbar } from 'notistack';
import { setJwt } from '../store/loginSlice';
import { Link, useNavigate } from 'react-router-dom';
const login = gql`
  mutation Mutation($loginUserInput: UserLoginInput!) {
    userLogin(loginUserInput: $loginUserInput) {
      accessToken
    }
  }
`;

const Login = () => {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [user, setUser] = useState({
    username: '',
    pass: '',
  });
  const [doLogin, { loading }] = useMutation(login);
  const handleLogin = () => {
    if (user.username === '') {
      enqueueSnackbar('❗ Username Should Not Be Empty', {
        style: { background: 'white', color: 'red' },
      });
    } else if (
      !user.username.match(
        /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/
      )
    ) {
      enqueueSnackbar('❗ Username Must Be An Email', {
        style: { background: 'white', color: 'red' },
      });
    } else {
      if (user.pass.length < 8) {
        enqueueSnackbar('❗ Password Must Be Longer Than 8 Characters', {
          style: { background: 'white', color: 'red' },
        });
      } else {
        //write the logic here
        doLogin({
          variables: {
            loginUserInput: {
              username: user.username,
              password: user.pass,
            },
          },
        })
          .then((res) => {
            if (res) {
              localStorage.setItem('jwt', res.data.userLogin.accessToken);
            }
            setUser({
              username: '',
              pass: '',
            });
            enqueueSnackbar('✅ Logged In Successfully', {
              style: { background: 'white', color: 'green' },
            });
            dispatch(setJwt(res.data.userLogin.accessToken));
            nav('/');
          })
          .catch((err) => {
            enqueueSnackbar(`❗${err.message}`, {
              style: { background: 'white', color: 'red' },
            });
          });
      }
    }
  };
  return (
    <div
      className='form-control'
      style={{
        background: 'transparent',
        border: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '75vh',
      }}
    >
      <Form
        className='text-center w-25 p-5 rounded border-1'
        style={{
          background: 'white',
          boxShadow: '1px 10px 20px 10px lightgray',
        }}
      >
        <h4>Log in</h4>
        <br />
        <Form.Group style={{ opacity: '100%' }}>
          <Form.Control
            type='email'
            name='username'
            value={user.username}
            placeholder='Email'
            onChange={(e) => {
              setUser((prev) => ({
                ...prev,
                username: e.target.value.trimStart(),
              }));
            }}
          />
        </Form.Group>
        <hr style={{ color: 'blue' }} />
        <Form.Group style={{ opacity: '100%' }}>
          <Form.Control
            type='password'
            value={user.pass}
            placeholder='Password'
            onChange={(e) => {
              setUser((prev) => ({
                ...prev,
                pass: e.target.value.trimStart(),
              }));
            }}
          />
        </Form.Group>
        <hr style={{ color: 'blue' }} />
        <Form.Group>
          Not A User? <Link to='/signup'>Register Here!</Link>
        </Form.Group>
        <Form.Group style={{ paddingTop: 20 }}>
          <Button type='button' onClick={handleLogin}>
            {loading ? (
              <>
                <Spinner animation='border' size='sm' />
              </>
            ) : (
              'Log In'
            )}
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default Login;
