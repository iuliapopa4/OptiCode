import React, { useState, useContext, useEffect  } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/theme-monokai';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Output from './Output'; 
import "./CodeEditor.css";

const CodeEditor = ({ problemId, testCases }) => {
  const languageTemplates = {
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

  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [language, setLanguage] = useState('cpp');
  const [editorContent, setEditorContent] = useState(languageTemplates[language]); 
  useEffect(() => {
    setEditorContent(languageTemplates[language]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    setEditorContent(languageTemplates[selectedLanguage]);
  };

  const handleSubmission = async () => {
    setLoading(true);
    setError('');
    setOutput('');
    setIsError(false);

    try {
      const response = await axios.post('/api/compile', {
        code: editorContent,
        language,
        problemId,
        testCases
      }, { headers: { Authorization: `Bearer ${token}` }});

      if (response.data.success === false) {
        setError(response.data.error);
        setIsError(true);
      } else if (response.data.results) {
        const passedTests = response.data.results.filter(result => result.passed).length;
        const totalTests = response.data.results.length;
        const score = ((passedTests / totalTests) * 100).toFixed(2);
        setOutput(`Score: ${score}%`);
        setIsError(false);
      } else {
        setError("Compilation successful, but no test results are available.");
        setIsError(true);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setError(error.response?.data.error || 'Error communicating with the server');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="codeEditorContainer">
      <div className="languageSelector">
        <select onChange={handleLanguageChange} value={language}>
          <option value="c">C</option>
          <option value="cpp">C++</option>
        </select>
      </div>
      <AceEditor
      mode={language === 'c' ? 'c_cpp' : 'c_cpp'} 
      theme="monokai"
      onChange={setEditorContent}
      value={editorContent}
      fontSize={16}
      name="UNIQUE_ID_OF_DIV"
      editorProps={{ $blockScrolling: true }}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        showPrintMargin: false,
      }}
      style={{ width: '100%', height: '400px' }}
    />
      <button className="submitBtn" onClick={handleSubmission} disabled={loading}>
        {loading ? 'Running...' : 'Run'}
      </button>
      {output && !isError && <Output message={output} isError={false} />}
      {error && isError && <Output message={error} isError={true} />}
    </div>
  );
};

export default React.memo(CodeEditor);
