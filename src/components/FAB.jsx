import './FAB.css'

const FAB = ({ onClick }) => {
  return (
    <button className="fab" onClick={onClick}>
      <i className="fas fa-plus"></i>
    </button>
  )
}

export default FAB
