import React, { useState, useContext } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Output from './Output'; 
import "./CodeEditor.css"

const CodeEditor = ({ onSubmit }) => {

  const languageTemplates = {
    python: `def main():
    print("Hello, Python!")
if __name__ == "__main__":
    main()
    `,
    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, C++!" << endl;
    return 0;
}
    `,
    c: `#include <stdio.h>

int main() {
    printf("Hello, C!\\n");
    return 0;
}
    `,
  };



  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [editorContent, setEditorContent] = useState(languageTemplates['cpp']); 
  const [language, setLanguage] = useState('cpp'); 
  const { token } = useContext(AuthContext);

  

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    setEditorContent(languageTemplates[selectedLanguage]); 
  };

  const handleSubmission = async () => {
    if (!editorContent.trim()) {
      setError('Code cannot be empty');
      return;
    }
  
    setLoading(true);
    setError('');
    setOutput('');
    setIsError(false);
  
    try {
      const response = await axios.post('/api/compile', {
        code: editorContent, 
        language: language, 
      }, { headers: { Authorization: `Bearer ${token}` }});
  
      console.log('Submission successful:', response.data);
      setOutput(response.data.message || "Compilation successful.");
      setIsError(false);
      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (error) {
      setOutput(error.response?.data.error || 'Error submitting code');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="codeEditorContainer">
      <div className="languageSelector">
        <select onChange={handleLanguageChange} value={language}>
          <option value="python">Python</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
        </select>
      </div>
      <AceEditor
        mode={language}
        theme="monokai"
        onChange={setEditorContent}
        value={editorContent} 
        fontSize={16}
        name="code-editor"
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          showPrintMargin: false,
        }}
        style={{ width: '100%', height: '400px' }}
      />

      {error && <p className="error">{error}</p>}
      <button className="submitBtn" onClick={handleSubmission} disabled={loading}>
        {loading ? 'Running...' : 'Run'}
      </button>
      {output && <Output message={output} isError={isError} />}
    </div>
  );
};

export default React.memo(CodeEditor);

