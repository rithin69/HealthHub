import React from 'react';

function SubmitModal({ SubmitModal1, closeSubmitModal1 ,message}) {
  return (
    <div className={SubmitModal1 ? 'block' : 'hidden'}>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-center text-xl font-bold mb-4">{message}</p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={closeSubmitModal1}>OK</button>
        </div>
      </div>
    </div>
  );
}

export default SubmitModal;
