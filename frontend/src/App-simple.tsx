import React from 'react';

function App() {
  return (
    <div style={{ 
      backgroundColor: '#1a1a2e', 
      color: 'white', 
      padding: '50px',
      minHeight: '100vh',
      fontFamily: 'Arial'
    }}>
      <h1>AI Interview Copilot v5</h1>
      <p>App is working! If you can see this, React is running.</p>
      <button 
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Start Interview
      </button>
    </div>
  );
}

export default App;
