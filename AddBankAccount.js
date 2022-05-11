import React, { useState, useEffect, useReducer } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Form, Input, Tabs, Select, notification, Spin, Table } from 'antd'
import { Modal, Button } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { BankAccountAPI } from '../../../../../apis/BankAccountAPI'
import { ReceiverAPI } from '../../../../../apis/ReceiverAPI'
import Header from '../../../layout/Header'
import Swal from 'sweetalert2'
import { GuestAPI } from '../../../../../apis/GuestAPI'
import { config } from '../../../../../config'
import { useSelector } from 'react-redux'
import { PencilSquare } from 'react-bootstrap-icons'
import DefaultLayout from '../../../layout/DefaultLayout'
import OTPBox from '../../../../../containers/OTPBox'
import { ProfileAPI } from '../../../../../apis/ProfileAPI'
import { encrypt, decrypt, publickey } from '../../../../../helpers/makeHash'
// import useHttp from "../../../hooks/useHttp";
import useHttp from '../../../../../hooks/useHttp'

const { TabPane } = Tabs
const { Option } = Select

export default function AddBankAccount(props) {
  // const [rerenderBanklist, setrerenderBanklist] = useState(false)

  // useEffect(() => {
  //   props.accountsList()
  // }, [rerenderBanklist])

  // add bank account list bove
  const [form] = Form.useForm()
  const AuthReducer = useSelector((state) => state)
  console.log(AuthReducer)
  const [loading, setLoader] = useState(false)
  const [isICICI, setIsICICI] = useState(true)
  let navigate = useNavigate()

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      clientId: AuthReducer.clientId,
      groupId: AuthReducer.groupId,
      twofa: AuthReducer.twofa,
      sessionId: AuthReducer.sessionId,
      userID: AuthReducer.userID,
      userFullName: AuthReducer.userFullName,
      nationalities: [],
      stateCities: [],
      _showOTPBOX: false,
      showConfirmBankAccountDetails: false,
      isConfirmAddRecipient: false,
      formData: {},
      verificationToken: '',
      isOTPVerfied: false,
      isModalVisible: false,
      otpType: 'RA',

      branchCode: '',
      bankBranch: '',
      bankAddress: '',
      bankState: '',
      bankCity: '',
      bankName: '',
      branchCode: '',
      bankId: '',
      bankCountry: '',
    },
  )

  const hookValidateBankCode = useHttp(BankAccountAPI.validateBankCode)
  const hookCheckDuplicateBankAccount = useHttp(
    BankAccountAPI.checkDuplicateBankAccount,
  )
  const hookAddBankAccount = useHttp(BankAccountAPI.addBankAccount)

  useEffect(async () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const onChangeBankSortCode = async (e) => {
    if (e.target.value.length >= 1) {
      const payload = {
        requestType: 'VALIDATEBANKCODE',
        bankCode: e.target.value,
        userId: state.userID,
        countryCode: 'GB',
      }

      hookValidateBankCode.sendRequest(payload, function (data) {
        if (data.status == 'S') {
          // notification.success({ message: data.message });
        } else {
          // notification.error({ message: data.errorMessage });
          form.setFields([
            { name: 'bankSortCode', errors: [data.errorMessage] },
          ])
        }
      })
    }
  }

  const onFinish = async (value) => {
    let formData = {
      requestType: 'SENDERACCOUNTADD',
      userId: state.userID,
      countryCode: 'GB',
      currencyCode: 'GBP',
      accountHolder: state.userFullName,
      bankCode: value.bankSortCode,
      bankNumber: '',
      bankName: value.bankName.toUpperCase(),
      accountNo: value.accountNo,
      accountType: 'S',
      accCurrencyCode: 'GBP',
      sortCode: value.bankSortCode,
      bankCountry: 'GB',
      ifsc: '',
      branchCode: '',
      bankBranch: '',
      bankCity: '',
      bankState: '',
      isDefaultAcc: '',
      tncAgree: '',
      processType: '',
      routingNumber: '',
      processingPartner: '',
      processingMode: '',
      remark: '',
      isSwiftCodeValid: '',
      noOfAttempts: '',
      transitNumber: '',
      swiftCode: '',
      iban: '',
      bsbCode: '',
    }

    let checkDuplicateData = {
      requestId: config.requestId,
      requestType: 'CHECKDUPLICATE',
      channelId: config.channelId,
      clientId: state.clientId,
      groupId: state.groupId,
      sessionId: state.sessionId,
      ipAddress: '127.0.0.1',
      userId: state.userID,
      bankName: value.bankName,
      accountNo: value.accountNo,
    }

    hookCheckDuplicateBankAccount.sendRequest(checkDuplicateData, function (
      data,
    ) {
      if (data.status === 'S') {
        setState({ formData: formData, showConfirmBankAccountDetails: true })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        notification.error({ message: data.errorMessage })
      }
    })
  }

  const saveReceiver = async () => {
    // setState({ showConfirmBankAccountDetails: false })
    props.setIsLoading(true)

    hookAddBankAccount.sendRequest(state.formData, function (data) {
      if (data.status == 'S') {
        notification.success({ message: data.message })
        props.setVisible(false)
        // here write function ....

        // navigate('/my-bank-accounts')

        navigate('/add-bank-account')
        props.accountsList()

        // props.setVisible(false) //mychange
      } else {
        notification.error({ message: data.errorMessage })

        let errors = []
        data.errorList.forEach((error, i) => {
          let errorData = {
            name: error.field,
            errors: [error.error],
          }
          errors.push(errorData)
        })
        if (errors.length > 0) form.setFields(errors)
      }
      props.setrerenderBanklist(true)
      props.setIsLoading(false)
    })

    setState({
      showConfirmBankAccountDetails: false,
    })

    // navigate('/add-bank-account')
    form.resetFields()
  }

  return (
    <div>
      {/* <div className="p-2 bg-secondary">
        <h2 className="mb-0 text-white">
          {!state.showConfirmBankAccountDetails
            ? 'Add Bank Account'
            : 'My Bank Account Review'}
        </h2>
      </div> */}
      <DefaultLayout
      // accessToken={props.appState.accessToken}
      // isLoggedIn={props.appState.isLoggedIn}
      // publicKey={props.appState.publicKey}
      >
        <Spin spinning={loading} delay={500}>
          {!state.showConfirmBankAccountDetails ? (
            <Row className="justify-content-center ">
              <Col lg={8} md={10}>
                <div className="bg-white shadow-sm rounded p-3 mb-4">
                  <Form form={form} onFinish={onFinish}>
                    <Row className="justify-content-center">
                      <Col md={12}>
                        <div className="">
                          <label className="form-label">Bank Sort Code</label>
                          <Form.Item
                            className="form-item"
                            name="bankSortCode"
                            rules={[
                              {
                                required: true,
                                message: 'Please input your Bank Sort Code.',
                              },
                            ]}
                          >
                            <Input
                              size="large"
                              onBlur={onChangeBankSortCode}
                              placeholder="Bank Sort Code"
                            />
                          </Form.Item>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className="">
                          <label className="form-label">Bank Name</label>
                          <Form.Item
                            className="form-item"
                            name="bankName"
                            rules={[
                              {
                                required: true,
                                message: 'Please input your Bank Name.',
                              },
                            ]}
                          >
                            <Input size="large" placeholder="Bank Name" />
                          </Form.Item>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className="">
                          <label className="form-label">Account Number</label>
                          <Form.Item
                            className="form-item"
                            name="accountNo"
                            rules={[
                              {
                                required: true,
                                message: 'Please input your Account Number.',
                              },
                              {
                                min: 12,
                                max: 12,
                                message: 'Account number must be 12 digit.',
                              },
                            ]}
                          >
                            <Input
                              size="large"
                              placeholder="Enter your Account Number"
                              maxLength={12}
                            />
                          </Form.Item>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className="">
                          <label className="form-label">
                            Confirm Account Number
                          </label>
                          <Form.Item
                            className="form-item"
                            name="accConNum"
                            rules={[
                              {
                                required: true,
                                message:
                                  'Please input your Confirm Account Number.',
                              },
                              ({ getFieldValue }) => ({
                                validator(rule, value) {
                                  if (
                                    !value ||
                                    getFieldValue('accountNo') === value
                                  ) {
                                    return Promise.resolve()
                                  }
                                  return Promise.reject(
                                    'The two account number that you entered do not match!',
                                  )
                                },
                              }),
                            ]}
                          >
                            <Input
                              size="large"
                              placeholder="Enter your Confirm Account Number"
                              maxLength={12}
                            />
                          </Form.Item>
                        </div>
                      </Col>

                      <Col md={12}>
                        <div className="d-flex justify-content-end">
                          <button
                            onClick={() => {
                              props.setVisible(false)
                              // form.resetFields()
                            }}
                            // to={'/'}
                            className="btn btn-secondary  me-3 my-3"
                          >
                            Back
                          </button>
                          <button
                            className="btn btn-primary text-white btn-sm my-3"
                            type="submit"
                            // onClick={() => setIsICICI(true)}
                            // onClick={() => saveReceiver()}
                          >
                            Review
                          </button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </Col>
            </Row>
          ) : (
            <Row>
              <div className="bg-white shadow-sm rounded p-4 mb-4">
                <h3 className="text-5 fw-400 d-flex align-items-center mb-4">
                  Basic Bank Details
                  <a
                    href="#!"
                    className="ms-auto text-2 text-uppercase btn-link"
                    onClick={() =>
                      setState({ showConfirmBankAccountDetails: false })
                    }
                  >
                    <span className="me-1">
                      <PencilSquare />
                    </span>
                    Edit
                  </a>
                </h3>
                <div></div>
                <hr className="mx-n4 mb-4" />

                <div className="row gx-3 align-items-center">
                  <p className="col-sm-3 text-muted text-sm-end mb-0 mb-sm-3">
                    Bank Sort Code:
                  </p>
                  <p className="col-sm-9 text-3">{state.formData.sortCode}</p>
                </div>

                <div className="row gx-3 align-items-center">
                  <p className="col-sm-3 text-muted text-sm-end mb-0 mb-sm-3">
                    Bank Name:
                  </p>
                  <p className="col-sm-9 text-3">{state.formData.bankName}</p>
                </div>

                <div className="row gx-3 align-items-center">
                  <p className="col-sm-3 text-muted text-sm-end mb-0 mb-sm-3">
                    Account Number:
                  </p>
                  <p className="col-sm-9 text-3">{state.formData.accountNo}</p>
                </div>

                <div className="d-flex justify-content-end">
                  {/* <Link to={'/'} className="btn btn-secondary me-3">Back</Link> */}
                  <button
                    className="btn btn-secondary btn-sm me-3 my-3"
                    type="button"
                    onClick={() =>
                      setState({ showConfirmBankAccountDetails: false })
                    }
                  >
                    Back
                  </button>

                  <button
                    className="btn btn-primary text-white btn-sm my-3"
                    type="button"
                    onClick={saveReceiver}
                  >
                    Verify Account
                  </button>
                </div>
              </div>
            </Row>
          )}
        </Spin>
      </DefaultLayout>
      {/* </Modal> */}
    </div>
  )
}
