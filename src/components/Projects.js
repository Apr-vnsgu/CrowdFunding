import React, { useContext, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { gql, useMutation } from '@apollo/client';
import GooglePayButton from '@google-pay/button-react';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './Projects.css';
import ContextFunc from '../context/ContextFunc';
import { setTemp } from '../store/tempData';
import { enqueueSnackbar } from 'notistack';

const bookmark = gql`
  mutation BookMarkAProject($bookMark: BookMark!) {
    bookMarkAProject(bookMark: $bookMark)
  }
`;

const pledge = gql`
  mutation PledgeAProject($pleadge: PledgeAProject!) {
    pledgeAProject(pleadge: $pleadge) {
      project_id
      project_name
      target_amount
      username
      pledge_amount
    }
  }
`;

const Projects = () => {
  const dispatch = useDispatch();
  const projData = useSelector((state) => state.projects[0]);
  const jwt = useSelector((state) => state.jwt);
  const temp = useSelector((state) => state.temp);
  const tempUser = useSelector((state) => state.tempUser);
  const [bookMark, bookmarkOption] = useMutation(bookmark);
  const [pleadgeFunc] = useMutation(pledge);
  const { loading, userOptions, refetch } = useContext(ContextFunc);
  const [show, setShow] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [pName, setPName] = useState('');
  const [amount, setAmount] = useState(0);
  const handleClose = () => {
    setShow(false);
    setShowButton(false);
    setAmount('');
  };
  const handleShow = (project) => {
    setShow(true);
    setAmount('');
    dispatch(setTemp(project));
  };
  const handleHover = (project) => {
    setAmount('');
    setPName(project.project_name);
  };
  const handlePledge = (project) => {
    if (jwt.length === 0) {
      enqueueSnackbar('❗ You Must Login First', {
        style: { background: 'white', color: 'red' },
        preventDuplicate: 'true',
        autoHideDuration: 3000,
      });
    } else {
      if (temp.username === tempUser.username) {
        enqueueSnackbar('❗You Cannot Pledge Owned Projects', {
          style: { background: 'white', color: 'red' },
          preventDuplicate: 'true',
          autoHideDuration: 3000,
        });
      } else {
        setShowButton((prev) => !prev);
        setAmount('');
      }
    }
  };
  const handleBookMark = (project) => {
    if (jwt.length === 0) {
      enqueueSnackbar('❗ You Must Login First', {
        style: { background: 'white', color: 'red' },
        preventDuplicate: 'true',
        autoHideDuration: 3000,
      });
    } else {
      bookMark({
        variables: {
          bookMark: {
            username: tempUser.username,
            project_name: project.project_name,
          },
        },
      })
        .then((res) => {
          if (res) {
            console.log(userOptions.refetch());
          }
        })
        .catch((err) => {
          enqueueSnackbar(`❗ ${err.message}`, {
            style: {
              background: 'white',
              color: 'red',
            },
          });
        });
    }
  };
  const renderTooltip = (props) => (
    <Tooltip id='button-tooltip' {...props}>
      {pName}
    </Tooltip>
  );
  const projects =
    projData &&
    projData.map((project) => {
      return (
        <OverlayTrigger
          delay={{ show: 250, hide: 200 }}
          project={project.project_name}
          key={project.project_id}
          onEnter={() => handleHover(project)}
          overlay={renderTooltip}
        >
          <div
            className='col-md-3 rounded projects'
            style={{
              marginTop: 20,
              marginLeft: 100,
              boxShadow: '0 2px 20px lightgray',
            }}
            onClick={() => handleShow(project)}
          >
            <Card className='h-100'>
              <div className='text-center'>
                <Card.Img
                  src={project.image}
                  alt={project.project_name}
                  style={{ height: 250 }}
                />
              </div>
              <Card.Body className='text-center'>
                <Card.Title>{project.project_name}</Card.Title>
                <Card.Text>{project.description}</Card.Text>
              </Card.Body>
            </Card>
          </div>
        </OverlayTrigger>
      );
    });
  return (
    <div className='card-group'>
      {loading && (
        <div
          className='card align-items-center p-5'
          style={{
            background: 'transparent',
            border: 0,
          }}
        >
          <Spinner animation='border' variant='secondary' />
        </div>
      )}
      {projects && projects}
      <Modal
        show={show}
        onHide={handleClose}
        backdrop='static'
        keyboard={false}
        animation={true}
        size='lg'
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{temp.project_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='card-group p-5'>
          <img
            alt={temp.project_name}
            src={temp.image}
            style={{ height: 200, width: 200, borderRadius: 100 }}
          />
          <ul
            className='m-5 border-start border-5 border-danger'
            style={{ listStyleType: 'circle' }}
          >
            <li>Description: {temp.description}</li>
            <li>End Date: {temp.end_date}</li>
            <li>
              Owner: <a href='/'>{temp.username}</a>
            </li>
            <li>Amount To Reach: {temp.target_amount}</li>
            <li>Total Pledged Amount: {temp.pledge_amount}</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant={
              tempUser.bookmarks &&
              tempUser.bookmarks.includes(temp.project_name)
                ? 'success'
                : 'light'
            }
            style={{
              boxShadow: '0px 0px 5px 1px lightgray',
            }}
            onClick={() => handleBookMark(temp)}
          >
            {bookmarkOption.loading ? (
              <Spinner size='sm' animation='border' variant='secondary' />
            ) : (
              <>
                {tempUser.bookmarks &&
                tempUser.bookmarks.includes(temp.project_name)
                  ? 'Bookmarked ✓'
                  : 'Bookmark 📑'}
              </>
            )}
          </Button>
          <Button variant='danger' onClick={handleClose}>
            Close
          </Button>
          <Button
            variant='warning'
            onClick={() => {
              handlePledge(temp);
            }}
          >
            Back This Project
          </Button>
          {showButton && jwt && (
            <Form>
              <Form.Control
                type='number'
                value={amount}
                placeholder='Pledge An Amount'
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
                min={0}
              />
            </Form>
          )}
          {amount && jwt && (
            <GooglePayButton
              environment='TEST'
              paymentRequest={{
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: [
                  {
                    type: 'CARD',
                    parameters: {
                      allowedAuthMethods: ['CRYPTOGRAM_3DS', 'PAN_ONLY'],
                      allowedCardNetworks: ['VISA', 'MASTERCARD'],
                    },
                    tokenizationSpecification: {
                      type: 'PAYMENT_GATEWAY',
                      parameters: {
                        gateway: 'example',
                        gatewayMerchantId: 'exampleGatewayMerchantId',
                      },
                    },
                  },
                ],
                merchantInfo: {
                  merchantId: '12345678901234567890',
                  merchantName: 'Apr',
                },
                transactionInfo: {
                  totalPriceLabel: `The Payment is of $ ${amount}`,
                  totalPriceStatus: 'FINAL',
                  totalPrice: `${amount}`,
                  countryCode: 'US',
                  currencyCode: 'USD',
                },
              }}
              onLoadPaymentData={(payment) => {
                if (payment) {
                  pleadgeFunc({
                    variables: {
                      pleadge: {
                        pledge_amount: +amount,
                        project_name: temp.project_name,
                        username: tempUser.username,
                      },
                    },
                  })
                    .then((res) => {
                      console.log(res);
                      enqueueSnackbar('Payment Success', {
                        variant: 'success',
                      });
                      refetch();
                      setAmount('');
                      setShow(false);
                      setShowButton(false);
                    })
                    .catch((err) => {
                      enqueueSnackbar(`❗ ${err.message}`, {
                        style: { color: 'red', background: 'white' },
                      });
                    });
                }
              }}
              buttonSizeMode='fill'
              buttonType='pay'
            />
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Projects;
