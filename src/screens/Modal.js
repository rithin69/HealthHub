// A simple Modal component
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
        <div className="bg-white p-5 rounded">
          {children}
          <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  };
  