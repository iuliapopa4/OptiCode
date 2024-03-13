import React from 'react';

const Output = ({ message, isError }) => {
  const outputStyle = {
    backgroundColor: isError ? '#ffebee' : '#e8f5e9',
    color: isError ? '#c62828' : '#2e7d32',
    border: '1px solid',
    borderColor: isError ? '#ef9a9a' : '#a5d6a7',
    borderRadius: '5px',
    padding: '10px',
    margin: '20px 0',
    whiteSpace: 'pre-wrap', 
  };

  return (
    <div style={outputStyle}>
      {message}
    </div>
  );
};

export default Output;
