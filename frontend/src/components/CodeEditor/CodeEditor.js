import React, { useState, useContext, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Output from './Output';
import "./CodeEditor.css";

const CodeEditor = ({ problemId, testCases, userId }) => {
  const languageTemplates = {
    python: `print("Hello, Python!")\n`
  };

  const { token, dispatch } = useContext(AuthContext);  // Ensure you have access to dispatch for token management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [language, setLanguage] = useState('python');
  const [editorContent, setEditorContent] = useState(languageTemplates[language]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setEditorContent(languageTemplates[language]);
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
      const compileResponse = await axios.post('/api/compile', {
        code: editorContent,
        language,
        problemId,
        testCases
      }, { headers: { Authorization: token } });

      if (compileResponse.data.success === false) {
        setError(compileResponse.data.error);
        setIsError(true);
      } else {
        const { passedTests, totalTests, score } = compileResponse.data.results;
        const formattedScore = score.toFixed(2);
        setOutput(`Score: ${formattedScore}%`);
        setIsError(false);

        const submissionResponse = await axios.post(`/api/submitCode/${problemId}`, {
          code: editorContent,
          language,
          score: formattedScore,
          passedTests,
          totalTests,
        }, { headers: { Authorization: token } });

        console.log('Submission saved:', submissionResponse.data);

        // Assuming the streaks are updated and returned in the response
        const streakResponse = await axios.get('/api/checkStreaks', { headers: { Authorization: {token} } });
        console.log('Streaks updated:', streakResponse.data);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Handle token expiration
        dispatch({ type: 'LOGOUT' });
        setError('Session expired. Please log in again.');
      } else {
        console.error('Submission error:', error);
        setError(error.response?.data.error || 'Error communicating with the server');
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCode = async () => {
    try {
      const response = await axios.post('/api/analyze', {
        code: editorContent
      }, { headers: { Authorization: `Bearer ${token}` } });
      setFeedback(response.data.feedback);
    } catch (error) {
      setFeedback(`Error analyzing code: ${error.response?.data.error || error.message}`);
      console.log("Error analyzer");
    }
  };

  return (
    <div className="codeEditorContainer">
      <div className="languageSelector">
        <select onChange={handleLanguageChange} value={language}>
          <option value="python">Python</option>
        </select>
      </div>
      <AceEditor
        mode={language === 'python' ? 'python' : 'python'}
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
        {loading ? 'Running...' : 'Submit'}
      </button>
      {output && !isError && <Output message={output} isError={false} />}
      {error && isError && <Output message={error} isError={true} />}
      {feedback && <Output message={feedback} isError={false} />}
      <p className="improveCode">Want to improve your code? <span onClick={handleAnalyzeCode}>Analyze Code</span></p>
    </div>
  );
};

export default React.memo(CodeEditor);
