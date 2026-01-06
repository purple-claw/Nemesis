import './FAB.css'

const FAB = ({ onClick }) => {
  return (
    <button className="fab" onClick={onClick} aria-label="Add new topic">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
    </button>
  )
}

export default FAB
