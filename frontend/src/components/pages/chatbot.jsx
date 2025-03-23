import React from "react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Mic, Volume2, VolumeX } from "lucide-react"; // Import relevant icons
import "./chatbot.css";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const messagesEndRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const languages = [
    { code: "en-US", label: "English" },
    { code: "hi-IN", label: "Hindi" },
    { code: "as-IN", label: "Assamese" },
    { code: "bn-IN", label: "Bengali" },
    { code: "brx-IN", label: "Bodo" },
    { code: "gu-IN", label: "Gujarati" },
    { code: "kok-IN", label: "Konkani" },
    { code: "mai-IN", label: "Maithili" },
    { code: "doi-IN", label: "Dogri" },
    { code: "sat-IN", label: "Santhali" },
    { code: "ks-IN", label: "Kashmiri" },
    { code: "kn-IN", label: "Kannada" },
    { code: "ml-IN", label: "Malayalam" },
    { code: "mni-IN", label: "Manipuri" },
    { code: "mr-IN", label: "Marathi" },
    { code: "ne-IN", label: "Nepali" },
    { code: "or-IN", label: "Odia" },
    { code: "pa-IN", label: "Punjabi" },
    { code: "sa-IN", label: "Sanskrit" },
    { code: "sd-IN", label: "Sindhi" },
    { code: "ta-IN", label: "Tamil" },
    { code: "te-IN", label: "Telugu" },
    { code: "ur-IN", label: "Urdu" },
    { code: "es-ES", label: "Spanish" },
    { code: "fr-FR", label: "French" },
    { code: "de-DE", label: "German" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setLoading(true);
    setMessage("");

    try {
      const { data } = await axios.post(
        "http://localhost:8080/get",
        { msg: message, language },
        { headers: { "Content-Type": "application/json" } }
      );

      const responseText = data.response;
      setMessages((prev) => [...prev, { role: "bot", text: responseText }]);

      if (!muted) speakText(responseText);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Unable to connect. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis || muted) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language;

      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
      };
      recognition.onerror = (event) => console.error("Speech error:", event);

      recognitionRef.current = recognition;
    }

    recognitionRef.current.lang = language;
    recognitionRef.current.start();
  };

  return (
    <div className="chat-container">
      {/* AroVeda Info Section */}
      <div className="aroveda-info">
        <img src="chatbot.png" alt="AroVeda Logo" className="aroveda-logo" />
        <h3>AroVeda</h3>
        <p>
          AroVeda serves as your 24/7 health assistant, offering support for
          symptom analysis, medication reminders, and post-treatment care.
          Utilizing advanced AI technology, it allows users to input symptoms
          and receive immediate feedback on potential health conditions, helping
          to alleviate anxiety and guide appropriate actions. The medication
          reminder feature ensures users adhere to their prescribed schedules,
          which is crucial for managing chronic illnesses. Additionally, AroVeda
          provides valuable information on various diseases, including common
          ailments and complex conditions, empowering users to make informed
          health decisions. With continuous learning capabilities, AroVeda stays
          updated on the latest medical knowledge, enhancing its ability to
          support users in their health journey.
        </p>
        <p>
          We offer insights into various topics, helping you make informed
          decisions.Ask me anything related to wellness!
        </p>
      </div>

      <div className="chat-box">
        <h2 className="chat-header">
          <img src="/chatbot.png" alt="Bot" className="botimg" />
          AroVeda
        </h2>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              {msg.role === "bot" && (
                <img src="/chatbot.png" alt="Bot" className="bot-profile" />
              )}
              <div className="message-content">
                <strong>{msg.role === "user" ? "You" : "Bot"}:</strong>{" "}
                {msg.text}
                {msg.role === "bot" && (
                  <button
                    className="icon-button"
                    onClick={() => speakText(msg.text)}
                  >
                    <Volume2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="loading">Typing...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-section">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="language-selector"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>

          <button onClick={() => setMuted(!muted)} className="icon-button">
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button onClick={startListening} className="icon-button">
            <Mic size={20} color={listening ? "red" : "black"} />
          </button>
          <input
            type="text"
            className="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || loading}
            className="send-button"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
