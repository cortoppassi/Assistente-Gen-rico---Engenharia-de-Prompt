import styled from 'styled-components';

export const ChatBotContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 9999;
`;

export const LiStyled  = styled.li`
  margin: 0 10px;
  cursor: pointer;
  padding: 5px;
  transition: border 0.3s ease-in-out;
  border-radius: 5px;
  border: 1px solid transparent;

  &:hover {
    border: 1px solid #bababa;
  }
`;

export const ModalStyled  = styled.div`
  overflow: auto;
  /* position: absolute; */
  bottom: ${({ bottom }) => bottom}px;
  right: ${({ right }) => right}px;
  position: fixed;
  /* bottom: 10px;
  right: 10px; */
  padding: 8px;
  background-color: #343541;
  border-radius: 8px;
  width: 90%;
  height: 60%;
  opacity: 0.9;
  max-width: 400px;
`;

export const ScrollableDivStyled  = styled.div`
  height: 90%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #666 transparent;
  -webkit-overflow-scrolling: touch;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
`;

export const ImgStyle  = styled.img`
  width: 130px;
  height: 130px;
  z-index: 9999;
  object-fit: cover;
  cursor: pointer;
`;

export const InputStyle  = styled.div`
  display: flex;
  height: 10%;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #222;
  border-radius: 8px;
  border: solid 1px black;
  padding: 6px;
  overflow: hidden;
  margin: 6px;
  justify-content: space-evenly;
`;
