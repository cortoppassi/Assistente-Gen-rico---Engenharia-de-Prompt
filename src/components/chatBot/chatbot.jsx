import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CircularProgress from "@mui/material/CircularProgress";
import MicIcon from "@mui/icons-material/Mic";
import MenuIcon from "@mui/icons-material/Menu";
import chatbotImage from "./images/chatbot.png";
import Draggable from "react-draggable";
import {
  ChatBotContainer,
  ImgStyle,
  ModalStyled,
  ScrollableDivStyled,
  LiStyled,
  InputStyle
} from './ChatbotStyles';

const liStyle = {
  margin: "0 10px",
  cursor: "pointer",
  padding: "5px",
  transition: "border 0.3s ease-in-out",
  borderRadius: "5px",
  border: "1px solid transparent",
};

const imgStyle = {
  width: "130px",
  height: "130px",
  zIndex: "9999",
  objectFit: "cover",
  cursor: "pointer",
};

// const options = [
//   { id: 1, label: "Quem sou eu?" },
//   { id: 2, label: "Explorar Recursos" },
//   { id: 3, label: "Artigos e Tutoriais" },
//   { id: 4, label: "Contato e Suporte" },
//   { id: 5, label: "Configurações" },
// ];

export default function ChatbotModal() {
  const [modalPosition, setModalPosition] = useState({ bottom: 20, right: 20 });
  const chatBotRef = useRef();
  const [menuVisible, setMenuVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [pergunta, setPergunta] = useState("");
  const [messages, setMessages] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [bootVisible, setBotVisible] = useState(true);
  const [userPrompt, setUserPrompt] = useState("")
  const [messageInit, setMessageInit] = useState("Olá! Como posso ajudar você hoje?")
  const [menuConfig, setMenuConfig] = useState(true)
  const [open, setOpen] = useState(false);
  const textAreaRef = useRef(null);
  const handleMouseOver = (item) => {
    setHoveredItem(item);
  };
  const handleMouseOut = () => {
    setHoveredItem(null);
  };
  const recognition = useRef(null);

  const handlePlay = () => {
    console.log("click");
    const audioElement = new Audio(audioUrl);
    audioElement.play();
  };

  const handleOpenModal = () => {
    if (chatBotRef.current) {
      const rect = chatBotRef.current.getBoundingClientRect();
      let newBottom = window.innerHeight - rect.bottom + 10;
      let newRight = window.innerWidth - rect.right + 10;

      const modalHeight = window.innerHeight * 0.6;
      const modalWidth = Math.min(window.innerWidth * 0.9, 400);

      if (newBottom + modalHeight > window.innerHeight) {
        newBottom = 10; // Ajusta para não ultrapassar a borda inferior
      }

      if (newRight + modalWidth > window.innerWidth) {
        newRight = 10; // Ajusta para não ultrapassar a borda direita
      }

      setModalPosition({
        bottom: newBottom,
        right: newRight
      });
    }
    handleOpen();
  };

  const handleOpen = () => {
    setOpen(true);
    setBotVisible(false);
    addMessage({ role: "bot", content: messageInit});
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setBotVisible(true);
    setMessages([]);
  };

  const startListening = () => {
    if (recognition.current) {
      recognition.current.start();
    }
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

      
    if (!apiKey) {
      addMessage({ role: "bot", content: "Você não tem permissão" });
      setLoading(false);
      return;
    }

    addMessage({ role: "user", content: pergunta });
    setPergunta("");

    try {
      const resposta = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: userPrompt,
            },
            { role: "user", content: pergunta },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const respostaDoChat = resposta.data.choices[0].message.content;
      addMessage({ role: "bot", content: respostaDoChat });

      const audioResposta = await axios.post(
        "https://api.openai.com/v1/audio/speech",
        {
          model: "tts-1",
          input: respostaDoChat,
          voice: "alloy",
          format: "mp3",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          responseType: "arraybuffer",
        }
      );

      if (audioResposta.headers["content-type"] === "audio/mpeg") {
        const blob = new Blob([audioResposta.data], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(blob);
        setAudioUrl(audioUrl);
      } else {
        console.error(
          "A resposta da API de áudio não contém uma URL válida:",
          audioResposta.data
        );
      }
    } catch (error) {
      console.error("Erro ao fazer pedido:", error.message);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const handleOnChange = (e) => {
    setMenuVisible(false);
    setPergunta(e.target.value);
  };

  const handlePersonaPrompt = (e) => {
    console.log(e.target.value);
    setUserPrompt(e.target.value);
  };

  const handleApiKei = (e) => {
    console.log(e.target.value);
    setApiKey(e.target.value);
  };

  const handleMessageInit = (e) => {
    console.log(e.target.value)
    setMessageInit(e.target.value)
  }

  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleOptionClick = (option) => {
    switch (option) {
      case 1:
        addMessage({
          role: "bot",
          content:
            "Olá! Eu sou o CodeHelper, o seu assistente virtual especializado em engenharia de software. Fui criado para ajudar desenvolvedores como você a encontrar as melhores ferramentas para cada etapa do seu projeto.",
        });
        break;
      case 2:
        addMessage({
          role: "bot",
          content:
            "Metodologia de Desenvolvimento: Conheça nossa abordagem para o desenvolvimento de software e como entregamos produtos de qualidade.",
        });
        break;
      case 3:
        addMessage({
          role: "bot",
          content: (
            <>
              Ferramentas Utilizadas: Descubra as tecnologias e ferramentas que
              empregamos para criar soluções inovadoras.
              <br />
              <br />
              Aqui estão alguns artigos e tutoriais relacionados:
              <br />
              <br />
              1.{" "}
              <a
                href="https://www.atlassian.com/git/tutorials/what-is-git"
                target="_blank"
              >
                Introdução ao Git e GitHub
              </a>{" "}
              - Um guia completo sobre como usar Git e GitHub para controle de
              versão.
              <br />
              2.{" "}
              <a href="https://www.docker.com/101-tutorial" target="_blank">
                Docker para Iniciantes
              </a>{" "}
              - Um tutorial passo a passo para começar a usar Docker para
              containerização.
              <br />
              3.{" "}
              <a
                href="https://www.jenkins.io/doc/pipeline/tour/getting-started/"
                target="_blank"
              >
                Guia de Jenkins para CI/CD
              </a>{" "}
              - Como configurar e utilizar Jenkins para integração e entrega
              contínuas.
              <br />
              4.{" "}
              <a
                href="https://www.selenium.dev/documentation/en/getting_started_with_webdriver/"
                target="_blank"
              >
                Automatização de Testes com Selenium
              </a>{" "}
              - Aprenda a automatizar testes de interface de usuário com
              Selenium.
              <br />
              5.{" "}
              <a
                href="https://kubernetes.io/docs/tutorials/kubernetes-basics/"
                target="_blank"
              >
                Introdução ao Kubernetes
              </a>{" "}
              - Um tutorial básico para começar a usar Kubernetes para
              orquestração de containers.
              <br />
              6.{" "}
              <a href="https://www.agilealliance.org/agile101/" target="_blank">
                Melhores Práticas de Desenvolvimento Ágil
              </a>{" "}
              - Um overview das práticas e princípios do desenvolvimento ágil.
              <br />
              7.{" "}
              <a
                href="https://prometheus.io/docs/introduction/overview/"
                target="_blank"
              >
                Monitoramento com Prometheus e Grafana
              </a>{" "}
              - Como configurar Prometheus e Grafana para monitoramento e
              visualização de métricas.
              <br />
              8.{" "}
              <a
                href="https://learning.postman.com/docs/getting-started/introduction/"
                target="_blank"
              >
                Integração de APIs com Postman
              </a>{" "}
              - Um guia para testar e documentar APIs usando Postman.
              <br />
              9.{" "}
              <a
                href="https://learn.hashicorp.com/collections/terraform/aws-get-started"
                target="_blank"
              >
                Uso de Terraform para Infraestrutura como Código
              </a>{" "}
              - Um tutorial sobre como gerenciar sua infraestrutura usando
              Terraform.
              <br />
              10.{" "}
              <a
                href="https://scrumguides.org/scrum-guide.html"
                target="_blank"
              >
                Scrum: Guia Completo
              </a>{" "}
              - Um guia detalhado sobre como implementar e utilizar Scrum para
              gestão de projetos.
            </>
          ),
        });
        break;
      case 4:
        const numeroWhatsapp = "71999214693";
        const mensagem = "Olá, gostaria de entrar em contato!";
        const linkWhatsapp = `https://api.whatsapp.com/send?phone=${numeroWhatsapp}&text=${encodeURIComponent(
          mensagem
        )}`;
        window.open(linkWhatsapp, "_blank");
        break;
      case 5:
        window.open(
          "https://github.com/cortoppassi/A---3-Felipe/raw/main/A3%20Felipe%20Segunda%20Entrega.docx",
          "_blank"
        );
        break;
      default:
        console.log("Opção não reconhecida");
    }
    toggleMenuVisibility();
  };

  const toggleMenuVisibility = () => {
    setMenuVisible(!menuVisible);
  };

  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      recognition.current = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      recognition.current.continuous = true;
      recognition.current.lang = "pt-BR";

      recognition.current.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript;
        setPergunta(text);
      };

      recognition.current.onend = () => {};

      recognition.current.onerror = (event) => {
        console.error("Voice recognition error:", event.error);
      };
    } else {
      console.error("Speech recognition is not supported in this browser.");
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  return (
    <Draggable>
      <ChatBotContainer ref={chatBotRef}>
        <img
          src={chatbotImage}
          alt="bot"
          width={70}
          height={70}
          style={{ ...imgStyle, display: bootVisible ? "block" : "none" }}
          onClick={handleOpenModal}
        />
      
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        >
          
          <ModalStyled bottom={modalPosition.bottom} right={modalPosition.right}>
            <ScrollableDivStyled>
              <div>
                <MenuIcon
                  onClick={toggleMenuVisibility}
                  style={{ cursor: "pointer", fontSize: "20px" }}
                />
                {menuVisible && (
                  <div
                    style={{
                      overflow: "hidden",
                      backgroundColor: "#222",
                      color: "#bababa",
                      borderRadius: "8px",
                      margin: "8px",
                      padding: "2px",
                      border: "solid 1px black",
                    }}
                  >
                    <ul
                      style={{
                        listStyleType: "none",
                        padding: "6px",
                        margin: "0",
                      }}
                    >

                      <button onClick={() => setMenuConfig(false)}>configuraçãoes</button>
                      {/* {options.map((option) => (
                        <li
                          key={option.id}
                          style={{
                            ...liStyle,
                            border:
                              hoveredItem === option.id
                                ? "1px solid #bababa"
                                : liStyle.border,
                          }}
                          onMouseOver={() => handleMouseOver(option.id)}
                          onMouseOut={handleMouseOut}
                          onClick={() => handleOptionClick(option.id)}
                        >
                          {option.id} - {option.label}
                        </li>
                      ))} */}
                    </ul>
                  </div>
                )}
              </div>

              {menuConfig ? (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      style={{
                        overflow: "hidden",
                        backgroundColor:
                          message.role === "user" ? "#292929" : "#343541",
                        color: "#bababa",
                        margin: "8px",
                        padding: "8px",
                        borderRadius: "8px",
                        border: "solid 1px #ccc",
                        wordWrap: "break-word",
                      }}
                    >
                      <h3>{message.content}</h3>
                      {/* <button onClick={handlePlay}>
                      <CampaignIcon></CampaignIcon>
                    </button> */}
                    </div>
                  ))}
                </>
              ) : (
                <>
                <form action="">
                  <div style={{display: "flex", flexDirection: "column"}}>
                    <label htmlFor="">APY KEY: </label>
                    <input type="password" placeholder="Insira sua chave da OpenAi" value={apiKey} onChange={handleApiKei}/>
                    <label htmlFor="">Menssagem Inicial: </label>
                    <input type="text" placeholder="Mensagem inicial que seu assistente exibira na tela" value={messageInit} onChange={handleMessageInit}/>
                    <select></select>
                    <label htmlFor="">Prompt da Persona: </label>
                    <textarea
                      placeholder="Personalidade do seu Assistente"
                      name="" id="" cols="30" rows="10"
                      value={userPrompt}
                      onChange={handlePersonaPrompt}
                    >
                    </textarea>
                  </div>
                  <div style={{marginTop: "10px"}}>
                    <Button type="button" variant="contained" style={{margin: "10px"}} onClick={() => {setMenuConfig(true), setMenuVisible(false)}}>Salvar</Button>
                    <Button type="button" variant="outlined" onClick={() => {setMenuConfig(true), setMenuVisible(false)}}>Cancelar</Button>
                  </div>
                </form>
                </>
              )}
            </ScrollableDivStyled>
            {menuConfig && (
              <InputStyle>
              <form
                onSubmit={handleSubmit}
                style={{ width: "100%", display: "flex", alignItems: "center" }}
              >
                <textarea
                  rows="1"
                  placeholder="Faça sua pergunta aqui..."
                  value={pergunta}
                  onChange={handleOnChange}
                  onKeyPress={handleKeyPress}
                  style={{
                    backgroundColor: "transparent",
                    flex: 2,
                    color: "#bababa",
                    border: "none",
                    resize: "none",
                    padding: "8px",
                    outline: "none",
                    overflow: "hidden",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "1.25rem",
                  }}
                  ref={textAreaRef}
                ></textarea>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    color: "white",
                    padding: "6px",
                    minWidth: "32px",
                    height: "32px",
                  }}
                >
                  {loading ? <CircularProgress /> : <PlayArrowIcon />}
                </Button>
                <Button
                  type="button"
                  style={{
                    color: "white",
                    padding: "6px",
                    minWidth: "32px",
                    height: "32px",
                  }}
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                >
                  {<MicIcon />}
                </Button>
              </form>
            </InputStyle>
            )}
            
          </ModalStyled>
        </Modal>
      </ChatBotContainer>
    </Draggable>
  );
}
