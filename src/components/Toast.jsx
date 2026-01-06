import './Toast.css'

const Toast = ({ message, type }) => {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  }

  return (
    <div className="toast-container">
      <div className={`toast ${type}`}>
        <i className={`fas ${icons[type] || icons.info} toast-icon`}></i>
        <span>{message}</span>
      </div>
    </div>
  )
}

export default Toast
