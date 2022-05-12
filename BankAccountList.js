import React, { useState, useEffect, useReducer, Fragment } from "react";
import { Table, Spin, Button, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import { BankAccountAPI } from "../../../../../apis/BankAccountAPI";
import { config } from "../../../../../config";
import { useSelector } from "react-redux";
import DefaultLayout from "../../../layout/DefaultLayout";
import { encrypt, decrypt, publickey } from "../../../../../helpers/makeHash";
import ViewBankDetails from "./ViewBankDetails";
import Swal from "sweetalert2";
// import useHttp from '../../../hooks/useHttp'
import useHttp from "../../../../../hooks/useHttp";
import AddBankAccount from "./AddBankAccount";
import Header from "../../../layout/Header";

function BankAccountList(props) {
  const [tableRender, settableRender] = useState(false);
  const [rerenderBanklist, setrerenderBanklist] = useState(false);
  const AuthReducer = useSelector((state) => state);
  const [loading, setLoader] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      bankAccountList: [],
      clientId: AuthReducer.clientId,
      groupId: AuthReducer.groupId,
      sessionId: AuthReducer.sessionId,
      userID: AuthReducer.userID,
      isModalVisible: false,
      modalAccountDetails: {},
    }
  );

  console.log("banklists", state.bankAccountList);

  const hookBankAccountList = useHttp(BankAccountAPI.bankAccountList);

  const hookViewBankAccountDetails = useHttp(
    BankAccountAPI.viewBankAccountDetails
  );
  const hookDeleteBankAccountDetails = useHttp(
    BankAccountAPI.deleteBankAccountDetails
  );

  useEffect(async () => {
    accountsList();
  }, []);

  // resData

  // useEffect(async () => {
  //   accountsList()
  // }, [])
  // accountlist
  const accountsList = () => {
    if (props.appState.isLoggedIn) {
      const payload = {
        requestType: "SENDERACCOUNTLIST",
        userId: state.userID,
        countryCode: "GB",
        favouriteFlag: "1",
        startIndex: "0",
        recordsPerRequest: "",
      };
      console.log("Account list restdata 0");

      hookBankAccountList.sendRequest(payload, function (data) {
        if (data.status == "S") {
          settableRender(true);
          let resData = [];
          console.log("resdata1", resData);

          data.responseData.forEach((detail, i) => {
            let newData = {
              key: i,
              sendAccId: `${detail.sendAccId}`,
              recordToken: `${detail.recordToken}`,
              bankName: `${detail.bankName}`,
              accountNo: `${detail.accountNo}`,
              bankClearingCode: `${detail.sortCode}`,
              dateAdded: moment(detail.createdDate).format("MM-DD-YYYY"),
              status:
                detail.accountStatus.toUpperCase() === "R"
                  ? "Verified"
                  : "Rejected",
            };
            resData.push(newData);
            console.log("resdata2", resData);
          });
          setState({
            bankAccountList: resData,
          });
          console.log("resdata3", resData);
        } else {
          settableRender(false);
        }
      });
    }
  };

  const viewDetailsHandlerClick = (row) => {
    setState({ isModalVisible: true });
    console.log(row);
    const payload = {
      requestType: "SENDERACCOUNT",
      userId: state.userID,
      sendAccId: row.sendAccId,
      recordToken: row.recordToken,
    };

    hookViewBankAccountDetails.sendRequest(payload, function (data) {
      if (data.status == "S") {
        setState({
          modalAccountDetails: data,
        });
      }
    });
  };

  const deleteAccountHandler = (row) => {
    console.log(row);
    Swal.fire({
      text: "Are you sure you want to delete this bank account?",
      showCancelButton: true,
      denyButtonText: `Cancel`,
      confirmButtonText: "Confirm",
      confirmButtonColor: "#2dbe60",
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        // Swal.fire('Saved!', '', 'success')
        const payload = {
          requestType: "SENDERACCOUNT",
          userId: state.userID,
          sendAccId: row.sendAccId,
          recordToken: row.recordToken,
        };

        hookDeleteBankAccountDetails.sendRequest(payload, function (data) {
          console.log("deleteAccountData", data);
          if (data.status == "S") {
            accountsList();
          } else {
            // table
          }
        });
      } else if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info");
      }
    });
  };

  return (
    <Fragment>
      <div className="p-2 bg-secondary">
        <h2 className="mb-0 text-white">My Bank Accounts</h2>
      </div>

      <Modal
        className="primary"
        centered
        visible={visible}
        onCancel={() => setVisible(false)}
        forceRender={true}
        footer={null}
        width={1000}
      >
        <Spin spinning={isLoading}>
          <AddBankAccount
            appState={props.state}
            visible={visible}
            accountsList={accountsList}
            setVisible={setVisible}
            setrerenderBanklist={setrerenderBanklist}
            setIsLoading={setIsLoading}
          />
        </Spin>
      </Modal>

      <Spin spinning={loading} delay={100}>
        <DefaultLayout
          accessToken={props.appState.accessToken}
          isLoggedIn={props.appState.isLoggedIn}
          publicKey={props.appState.publicKey}
        >
          <div className="bg-white shadow-sm rounded p-4 mb-4">
            <div className="d-flex justify-content-end">
              <Button
                className="btn btn-primary text-white btn-sm mb-3"
                onClick={() => setVisible(true)}
              >
                Add Bank Accounts
              </Button>
            </div>
            {tableRender ? (
              <Table
                columns={[
                  {
                    title: "Bank Name",
                    dataIndex: "bankName",
                  },
                  {
                    title: "Account No",
                    dataIndex: "accountNo",
                  },
                  {
                    title: "Bank Clearing Code",
                    dataIndex: "bankClearingCode",
                  },
                  {
                    title: "Date Added",
                    dataIndex: "dateAdded",
                  },
                  {
                    title: "Status",
                    dataIndex: "status",
                  },
                  {
                    title: "",
                    dataIndex: "",
                    key: "x",
                    render: (text, record, index) => {
                      return (
                        <a
                          i={index}
                          onClick={() => viewDetailsHandlerClick(text)}
                        >
                          View Details
                        </a>
                      );
                    },
                  },
                  {
                    title: "",
                    dataIndex: "",
                    key: "y",
                    render: (text, record, index) => {
                      return (
                        <DeleteOutlined
                          i={index}
                          onClick={() => deleteAccountHandler(text)}
                        />
                      );
                    },
                  },
                ]}
                dataSource={state.bankAccountList}
                pagination={false}
              />
            ) : (
              <h4 style={{ color: "black" }}>
                No record found, Please add the bank detail.
              </h4>
            )}
          </div>
        </DefaultLayout>
        <ViewBankDetails state={state} setState={setState} />
      </Spin>
    </Fragment>
  );
}

export default BankAccountList;
