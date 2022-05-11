import { Form, Input, Button, Modal, notification, Spin } from 'antd'
import moment from 'moment'

function ViewBankDetails(props) {
  console.log(props)
  const bankDetails = props.state.modalAccountDetails
  return (
    <Modal
      centered
      title="View Bank Account Details"
      visible={props.state.isModalVisible}
      onCancel={() => props.setState({ isModalVisible: false })}
      footer={null}
    >
      <div className="row">
        <div className="col-md-6 mb-3">
          Bank Name <br /> {bankDetails.bankName}
        </div>
        <div className="col-md-6 mb-3">
          Account No. <br /> {bankDetails.accountNo}
        </div>
      </div>
      <div className="row">
        <div className="col-md-6 mb-3">
          Bank Sort Code / Routing Number <br /> {bankDetails.sortCode}
        </div>
        <div className="col-md-6 mb-3">
          Account Status <br />{' '}
          {bankDetails.recordStatus === 'R' ? 'Verified' : 'Rejected'}
        </div>
        <div className="col-md-6 mb-3">
          Account Registration Date <br />{' '}
          {moment(bankDetails.createdDate).format('MM-DD-YYYY')}
        </div>
      </div>
    </Modal>
  )
}

export default ViewBankDetails
