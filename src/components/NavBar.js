import React, { useEffect, useState, useContext } from 'react';
import {
  Navbar,
  Nav,
  Container,
  Button,
  Badge,
  Modal,
  Accordion,
  Offcanvas,
  Form,
  Spinner,
} from 'react-bootstrap';
import { MessageBox, ChatList } from 'react-chat-elements';
import ContextFunc from '../context/ContextFunc';
import {
  gql,
  useMutation,
  useSubscription,
  useLazyQuery,
} from '@apollo/client';
import { useSelector, useDispatch } from 'react-redux';
import { BsBell } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
import { removeJwt } from '../store/loginSlice';
import './Projects.css';
import { enqueueSnackbar } from 'notistack';
import { removeTempUser } from '../store/tempUser';
import dotnetClient from '../graphql/dotnetClient';
import { deleteAllMessages, populateMessages } from '../store/messagesSlice';
const writeAns = gql`
  mutation WriteAnswer($writeAnswer: FAQInput!) {
    writeAnswer(writeAnswer: $writeAnswer)
  }
`;
const deleteMessage = gql`
  mutation DeleteMessages($receiverId: String) {
    deleteMessages(receiverId: $receiverId)
  }
`;
const writeMessage = gql`
  mutation WriteMessage($message: CreateMessageDtoInput) {
    writeMessage(message: $message) {
      _id
      __typename
      message_id
      senderId
      receiverId
      content
      timestamp
      isRead
    }
  }
`;
const getMessages = gql`
  query GetAllMessagesOfReceiver($receiverId: String) {
    getReceiverMessages(receiverId: $receiverId)
  }
`;
const readMessages = gql`
  mutation ReadMessages($receiver: String, $sender: String) {
    readMessages(receiver: $receiver, sender: $sender)
  }
`;
const loadMessages = gql`
  subscription MessageAction {
    messageAction {
      _id
      content
      isRead
      message_id
      receiverId
      senderId
      timestamp
    }
  }
`;
const updatePassword = gql`
  mutation UpdatePassword($username: String!, $password: String!) {
    updatePassword(username: $username, password: $password)
  }
`;
const NavBarPanel = () => {
  const [updatePwd, setPwd] = useState({
    current: '',
    confirm: '',
  });
  const nav = useNavigate();
  const dispatch = useDispatch();
  const jwt = useSelector((state) => state.jwt);
  const faq = useSelector((state) => state.faq[0]);
  const projs = useSelector((state) => state.projects[0]);
  const tempUser = useSelector((state) => state.tempUser);
  const messages = useSelector((state) => state.messages);
  const [x, setX] = useState([]);
  const [y, setY] = useState([]);
  const [notif, setnotif] = useState('');
  const [answer, setAnswer] = useState('');
  const [optMessages, setOptMessages] = useState([]);
  const [ans, ansOpt] = useMutation(writeAns);
  const [upd, updOpt] = useMutation(updatePassword);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [textMes, setTextMes] = useState('');
  const [getMessagesFunc, { refetch }] = useLazyQuery(getMessages, {
    client: dotnetClient,
  });
  const [delMessages] = useMutation(deleteMessage, {
    client: dotnetClient,
  });
  const [readMess] = useMutation(readMessages, {
    client: dotnetClient,
  });
  const messageSubsciption = useSubscription(loadMessages, {
    client: dotnetClient,
  });
  const [writeMess, writeMessOpt] = useMutation(writeMessage, {
    client: dotnetClient,
  });
  // You can copy and paste this array where needed in your code
  const [messageShow, setMessageShow] = useState(false);
  const [dmShow, setdmShow] = useState(false);
  const [recipient, setRecipient] = useState();
  const handleClose = () => setShow(false);
  const handleClose1 = () => setShow1(false);
  const messageClose = () =>
    setMessageShow((prev) => {
      setnotif('');
      return !prev;
    });
  const dmToggle = () => {
    delMessages({
      variables: {
        receiverId: tempUser.username,
      },
    });
    setRecipient({});
    //here the dm messages should be deleted when this dm box is closed
    setdmShow(false);
  };
  const showDm = (recepient) => {
    setdmShow(true);
    setRecipient(recepient);
    //here add the messages and sort them based on time, it should have the user as well as the owner's messages shown and should be updated in real time
  };
  const handleShow = () => setShow(true);
  const handleShow1 = () => setShow1(true);
  const { faqs } = useContext(ContextFunc);
  const signOut = () => {
    dispatch(removeJwt());
    dispatch(removeTempUser());
    dispatch(deleteAllMessages());
    setOptMessages([]);
    localStorage.removeItem('jwt');
    enqueueSnackbar('✅ Signed Out', {
      style: { background: 'white', color: 'green' },
    });
  };
  useEffect(() => {
    if (tempUser?.username) {
      getMessagesFunc({
        variables: {
          receiverId: tempUser.username,
        },
      });
      refetch();
    }
  }, [getMessagesFunc, tempUser.username, tempUser, jwt, refetch]);
  useEffect(() => {
    if (tempUser.username) {
      dispatch(populateMessages(messageSubsciption?.data?.messageAction));
    }
  }, [
    dispatch,
    messageSubsciption,
    messageSubsciption?.data,
    tempUser.username,
  ]);
  useEffect(() => {
    setPwd({
      current: '',
      confirm: '',
    });
    setAnswer('');
    setX([]);
    if (faq) {
      faq.forEach((obj) => {
        if (obj.to === tempUser.username) {
          if (obj.answer.length === 0) {
            setX((prev) => {
              return [...prev, obj];
            });
          }
        }
      });
    }
  }, [faq, tempUser.username]);
  useEffect(() => {
    if (messages.length !== 0 && messages[0]) {
      const mes = messages[0].reduce((grouped, message) => {
        const senderId = message.senderId;

        // Check if senderId is already a key in grouped object
        if (!grouped[senderId]) {
          // If not, create a new key with an array containing the first message
          grouped[senderId] = [message];
        } else {
          // If yes, push the current message to the existing array
          grouped[senderId].push(message);
        }
        return grouped;
      }, []);
      setOptMessages(mes);
    }
  }, [messages]);
  useEffect(() => {
    if (Object.keys(optMessages).length !== 0) {
      if (
        Object.keys(optMessages).filter((keys) => keys !== tempUser.username)
          .length !== 0
      ) {
        setnotif('contains-mess');
      } else {
        setnotif('');
      }
    }
  }, [optMessages, tempUser.username]);
  useEffect(() => {
    setY('');
    const tempData =
      projs &&
      projs.filter((project) => project.username === tempUser.username);
    setY(tempData);
  }, [projs, tempUser.username]);
  const handleAns = (obj) => {
    if (answer.length === 0) {
      enqueueSnackbar('❗ Answer Cannot Be Empty', {
        style: { color: 'red', background: 'white' },
        preventDuplicate: true,
      });
    } else {
      ans({
        variables: {
          writeAnswer: {
            id: obj.id,
            project_name: obj.project_name,
            answer,
          },
        },
      })
        .then((res) => {
          if (res) {
            enqueueSnackbar('✅ Answer Posted', {
              style: { color: 'green', background: 'white' },
              preventDuplicate: true,
            });
            faqs.refetch();
            setShow(false);
            setAnswer('');
          }
        })
        .catch((err) => {
          enqueueSnackbar(err.message, {
            style: { color: 'red', background: 'white' },
          });
        });
    }
  };
  const handlePwd = (current, confirm) => {
    if (confirm === '' || current === '') {
      enqueueSnackbar('❗Password Updation Fields Cannot be Empty', {
        style: { color: 'red', background: 'white' },
        preventDuplicate: true,
      });
    } else if (current.length < 8) {
      enqueueSnackbar('❗Password Must Be Atleast 8 Characters long', {
        style: { color: 'red', background: 'white' },
        preventDuplicate: true,
      });
    } else {
      if (confirm !== current) {
        enqueueSnackbar('❗Passwords do not match', {
          style: { color: 'red', background: 'white' },
          preventDuplicate: true,
        });
      } else {
        upd({
          variables: {
            username: tempUser.username,
            password: confirm,
          },
        })
          .then((res) => {
            if (res) {
              enqueueSnackbar(' ↪ ' + res.data.updatePassword, {
                style: { color: 'green', background: 'white' },
                preventDuplicate: true,
              });
              setPwd({
                current: '',
                confirm: '',
              });
              handleClose1();
              nav('/login');
              signOut();
              enqueueSnackbar('📃 Please Re-Login Due To Updation', {
                style: { color: 'green', background: 'white' },
                preventDuplicate: true,
              });
            }
          })
          .catch((err) => {
            enqueueSnackbar('❗' + err.message, {
              style: { color: 'red', background: 'white' },
            });
            setPwd({
              current: '',
              confirm: '',
            });
          });
      }
    }
  };
  return (
    <div
      style={{ background: 'transparent' }}
      className='border-bottom border-1'
    >
      <Navbar collapseOnSelect expand='lg'>
        <Container fluid>
          <Navbar.Brand href='/' as={Link} id='logo'>
            CrowdFunding
          </Navbar.Brand>
          <Navbar.Text
            style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
          >
            {jwt.length !== 0 && (
              <div
                id='greeting'
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  handleShow1();
                }}
              >
                {`Hello ${tempUser.user_name}!`}
              </div>
            )}
            {jwt.length !== 0 && (
              <Link
                onClick={messageClose}
                style={{ paddingLeft: 10, opacity: '70%' }}
              >
                <BsBell className={notif ? notif : ''} />
              </Link>
            )}
            {jwt.length === 0 && (
              <div id='greeting-trav'>{`Hello Traveller!`}</div>
            )}
          </Navbar.Text>
          {jwt && (
            <Navbar.Text style={{ borderRight: '1px solid lightgray' }}>
              <div
                id='div-ques'
                style={{
                  paddingRight: 20,
                  opacity: '90%',
                }}
                onClick={() => {
                  nav('/yourprojects');
                }}
              >
                Your Projects <Badge bg='dark'>{y && y.length}</Badge>
              </div>
            </Navbar.Text>
          )}
          {jwt && (
            <Navbar.Text style={{ borderRight: '1px solid lightgray' }}>
              <div
                id='div-ques'
                style={{
                  paddingRight: 20,
                  paddingLeft: 20,
                  opacity: '90%',
                }}
                onClick={() => {
                  nav('/bookmarks');
                }}
              >
                Bookmarks{' '}
                <Badge
                  bg={
                    tempUser.bookmarks && tempUser.bookmarks.length === 0
                      ? 'danger'
                      : 'info'
                  }
                  style={{ borderRadius: '100%' }}
                >
                  {tempUser.bookmarks && tempUser.bookmarks.length}
                </Badge>
              </div>
            </Navbar.Text>
          )}
          {jwt && (
            <Navbar.Text style={{ borderRight: '1px solid lightgray' }}>
              <div
                id='div-ques'
                style={{
                  paddingRight: 20,
                  paddingLeft: 20,
                  opacity: '90%',
                }}
                onClick={() => {
                  handleShow();
                }}
              >
                Questions <Badge>{x.length}</Badge>
              </div>
            </Navbar.Text>
          )}
          <Nav>
            <Nav.Link
              to='/discover'
              id='navLink'
              as={Link}
              style={{
                paddingRight: 20,
                paddingLeft: 20,
                opacity: '90%',
              }}
            >
              Discover
            </Nav.Link>
            <Nav.Link
              to='/create'
              as={Link}
              id='navLink'
              style={{
                borderLeft: '1px solid lightgray',
                paddingLeft: 20,
                paddingRight: 20,
                opacity: '90%',
              }}
            >
              Make A Project
            </Nav.Link>
            {jwt.length === 0 && (
              <Nav.Link
                to='/login'
                as={Link}
                id='navLink'
                style={{
                  borderLeft: '1px solid lightgray',
                  paddingLeft: 20,
                  opacity: '90%',
                }}
              >
                Login
              </Nav.Link>
            )}
            {jwt.length !== 0 && <Button onClick={signOut}>Sign Out</Button>}
          </Nav>
        </Container>
      </Navbar>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Answer These Questions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Accordion>
            {x &&
              x.map((obj) => (
                <Accordion.Item eventKey={obj.id} key={obj.id}>
                  <Accordion.Header>
                    Q. {obj.question} ----for:-{obj.project_name} ------from:-{' '}
                    {obj.from}
                  </Accordion.Header>
                  <Accordion.Body>
                    {obj.answer.length === 0 ? (
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <Form.Group>
                          <Form.Control
                            type='text'
                            placeholder='Write An Answer'
                            value={answer}
                            onChange={(e) => {
                              setAnswer(e.target.value.trimStart());
                            }}
                            size='sm'
                          />
                          <br />
                          <Button
                            variant='primary'
                            onClick={() => handleAns(obj)}
                            size='sm'
                          >
                            {ansOpt.loading ? (
                              <Spinner animation='border' size='sm' />
                            ) : (
                              'Post'
                            )}
                          </Button>
                        </Form.Group>
                      </Form>
                    ) : (
                      'A. ' + obj.answer
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
          </Accordion>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={show1}
        onHide={handleClose1}
        backdrop='static'
        keyboard={false}
        animation={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>{tempUser.user_name}'s Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group style={{ width: 'fit-content' }}>
              <Form.Control
                type='password'
                placeholder='Update Your Password'
                onChange={(e) => {
                  setPwd((prev) => {
                    return {
                      ...prev,
                      current: e.target.value.trimStart(),
                    };
                  });
                }}
                value={updatePwd.current}
                size='sm'
              />
              <br />
              <Form.Control
                type='password'
                onChange={(e) => {
                  setPwd((prev) => {
                    return {
                      ...prev,
                      confirm: e.target.value.trimStart(),
                    };
                  });
                }}
                value={updatePwd.confirm}
                placeholder='Confirm Password'
                size='sm'
              />
              <br />
              <Button
                variant={updOpt.loading ? 'warning' : 'danger'}
                size='sm'
                onClick={() => {
                  handlePwd(updatePwd.current, updatePwd.confirm);
                }}
              >
                {updOpt.loading ? (
                  <Spinner animation='border' size='sm' />
                ) : (
                  'Change'
                )}
              </Button>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose1}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Offcanvas show={messageShow} onHide={messageClose} backdrop='static'>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Your Messages</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {Object.keys(optMessages).length !== 0 ? (
            <ChatList
              className='chat-list'
              dataSource={Object.keys(optMessages)
                .map((key) => {
                  return {
                    avatar: key === tempUser.username ? null : null,
                    title: key === tempUser.username ? null : key,
                    subtitle:
                      key === tempUser.username
                        ? null
                        : optMessages[key][optMessages[key].length - 1].content,
                    unread:
                      key === tempUser.username
                        ? null
                        : optMessages[key].length,
                  };
                })
                .filter((arr) => arr.title !== null)}
              //from here add a modal which will display the messages from a single sender and render all the messages from there
              //one error you made is, you are only receiving messages for yourseld and not the messages you will be sending which will be a problem while rendering the chats in the dm, so work on that part
              onClick={(recepient) => {
                readMess({
                  variables: {
                    receiver: tempUser.username,
                    sender: recepient.title,
                  },
                });
                showDm(recepient);
              }}
            />
          ) : (
            <h4>No Messages Yet</h4>
          )}
        </Offcanvas.Body>
      </Offcanvas>
      <Modal
        show={dmShow}
        onHide={dmToggle}
        centered
        backdrop='static'
        keyboard={false}
        animation={true}
        style={{ maxHeight: '600px' }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{recipient?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ overflowY: 'scroll' }}>
          {Object.keys(optMessages).map((key) => {
            if (key === recipient?.title) {
              //work on concat here, only concat messages whose recipient.title is key and also whose sender is the tempUser, else all the messages of tempUser are concatenated in every dm
              return optMessages[key]
                .concat(optMessages[tempUser.username])
                .filter((message) => {
                  if (
                    message?.senderId === recipient.title ||
                    (message?.senderId === tempUser.username &&
                      message?.receiverId === recipient.title)
                  ) {
                    return message;
                  } else {
                    return null;
                  }
                })
                .sort((a, b) => {
                  const dateA = new Date(a.timestamp);
                  const dateB = new Date(b.timestamp);
                  return dateA - dateB;
                })
                .map((message) => {
                  return (
                    <MessageBox
                      key={message._id}
                      position={
                        message.receiverId === tempUser.username
                          ? 'left'
                          : 'right'
                      }
                      type={'text'}
                      title={message.senderId}
                      text={message.content}
                    />
                  );
                });
            } else {
              return null;
            }
          })}
          <Form
            style={{ paddingTop: '20px' }}
            onSubmit={(e) => {
              e.preventDefault();
              //here you need to perform write message(Done)
              writeMess({
                variables: {
                  message: {
                    content: textMes,
                    receiverId: recipient.title,
                    senderId: tempUser.username,
                  },
                },
              });
              //here refetch all the records of this temp user
              //the refetch here is not working, i think changing the back end where using the get function after the mutation is a good sollution
              setTextMes('');
              getMessagesFunc({
                variables: {
                  receiverId: tempUser.username,
                },
              });
              refetch();
            }}
          >
            <Form.Group>
              <Form.Control
                type='input'
                placeholder={
                  writeMessOpt.loading
                    ? 'Sending...'
                    : 'Write Your Message Here....'
                }
                value={textMes}
                onChange={(e) => {
                  e.preventDefault();
                  setTextMes(e.target.value.toString());
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={dmToggle}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NavBarPanel;
