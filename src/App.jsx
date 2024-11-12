import { useCallback, useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';
import axios from "axios"
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [textResult, setTextResult] = useState("");
  const  [answer, setAnswer] = useState("");
  const [responseRecieved,setResponseRecieved] = useState(false);

  // Create the Tesseract worker once
  const worker = createWorker();

  // IMPORTANT: Replace with your actual Gemini API key (NEVER store it in code)
  const GEMINI_API_KEY = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=AIzaSyDK2VwQI-39V5wLU_UIW0_3X5D9o5HEVlc"; // Replace with environment variable

  const convertImageToText = useCallback(async () => {
    if (!selectedImage) return;
    

    try {
      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      const { data } = await worker.recognize(selectedImage);
      setTextResult(data.text);

      // Ensure API key is available from a secure environment variable
      if (!GEMINI_API_KEY) {
        console.error("Error: Missing Gemini API key in environment variable");
        return;
      }

      const response = await axios.post(
         GEMINI_API_KEY,        {
          contents: [
            {
              role: "user",
              parts: [{ text: `I will give you text of a resume converted from a image and you will 
                have to access the text based on how well it scores on ats,how relevant the person's skill are and 
                comment on the overall structure of the resume. Remember carefully you will have to give the output as
                array separated by | . it will contain two strings one will be the ATS score of the resume
                based on his profile and second will  be the overall feedback what you would like to give them
                or what should they learn/explore to land a job. Here is example of the output [78% | feedback], follow this format at must, Do not return the content
                of resume as the output only give output as per i've said.
                Now here is the text : ${data.text}` }],
            },
          ],
        }
      );

      setAnswer(response.data.candidates[0].content.parts[0].text);
      setResponseRecieved(true);
    } catch (error) {
      console.error("Error:", error);
    }
  }, [selectedImage, worker, GEMINI_API_KEY]);

  useEffect(() => {
    if(responseRecieved) return;
    if (selectedImage) {
      convertImageToText();
    }

    // Cleanup worker on component unmount
    return () => {
      worker.terminate();
    };
  }, [selectedImage, convertImageToText, worker]);

  const handleChangeImage = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    } else {
      setSelectedImage(null);
      setTextResult("");
      setAnswer("");
    }
  };

  return (
    <div className="App">
      <h1>ImText</h1>
      <p>Gets words in image!</p>
      <div className="input-wrapper">
        <label htmlFor="upload">Upload Image</label>
        <input type="file" id="upload" accept="image/*" onChange={handleChangeImage} />
      </div>

      <div className="result">
        {selectedImage && (
          <div className="box-image">
            <img src={URL.createObjectURL(selectedImage)} alt="thumb" />
          </div>
        )}
        {textResult && (
          <div className="box-p">
          </div>
        )}
        {answer && (
          <div className="box-p">
            <p>Generated Response: {answer}</p>
            {console.log(answer)}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;