import React, { useEffect, useRef, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon, ArrowRightIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/Chatlogics";
import ProfileModal from "./miscellanous/ProfileModal";
import UpdateGroupChatModal from "./miscellanous/UpdateGroupChatModal";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import typingImage from "../animations/typing-gif.gif";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const ENDPOINT = "https://mychatappp.onrender.com/";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const toast = useToast();
  const {
    baseUrl,
    isScrolledToBottom,
    contentRef,
    scrollToBottom,
    user,
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
  } = ChatState();

  // emoji logic

  const handleEmojiSelect = (emoji) => {
    newMessage
      ? setNewMessage(newMessage + emoji.native)
      : setNewMessage(emoji.native);
    setShowPicker(!showPicker);
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);

      const { data } = await axios.get(
        ` ${baseUrl}/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: "true",
        position: "top",
      });
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    console.log(e.type);
    if (e.key === "Enter" || (e.type === "click" && newMessage)) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        setNewMessage("");
        const { data } = await axios.post(
          `${baseUrl}/api/message`,
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data);
        setMessages([...messages, data]);
        scrollToBottom();
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "failed to send message",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const typingHandler = async (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timeLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timeLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timeLength);
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    scrollToBottom();
  }, [isScrolledToBottom]);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    const storedNotifications =
      JSON.parse(localStorage.getItem("notifications")) || [];
    setNotification(storedNotifications);
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        // notification
        if (!notification.includes(newMessageRecieved)) {
          const updatedNotifications = [newMessageRecieved, ...notification];
          setNotification(updatedNotifications);
          // Save updated notifications to local storage
          localStorage.setItem(
            "notifications",
            JSON.stringify(updatedNotifications)
          );
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  }, [notification, messages]);

  useEffect(() => {
    // Scroll to the bottom of the contentRef after rendering
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w={"100%"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={{ base: "space-between" }}
            alignItems={"center"}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"flex-end"}
            p={3}
            bg={"#E8E8E8"}
            w={"100%"}
            h={"100%"}
            borderRadius={"lg"}
            overflowY={"scroll"}
          >
            {/* mesage here */}
            {loading ? (
              <Spinner
                size="xl"
                w="20"
                h="20"
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <>
                {showPicker && (
                  <div
                    style={{
                      position: "absolute",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: "transparent",
                      zIndex: "1",
                    }}
                  >
                    <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                  </div>
                )}
                <div
                  ref={contentRef}
                  style={{ overflowY: "scroll" }}
                  className="message"
                >
                  <ScrollableChat messages={messages} />
                </div>
              </>
            )}
            <FormControl onKeyDown={sendMessage}>
              {isTyping ? (
                <Box>
                  {" "}
                  <Image w="50px" src={typingImage} />{" "}
                </Box>
              ) : (
                ""
              )}
              <Box
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                {" "}
                <Input
                  mt={3}
                  variant={"filled"}
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  onChange={typingHandler}
                  value={newMessage}
                />
                <Button
                 mt={3}
                 mr={1}
                  onClick={() => setShowPicker(!showPicker)}
                  style={{ fontSize: "1.5rem", marginLeft: "0.5rem" }}
                >
                  😀
                </Button>
                {newMessage && (
                  <Button colorScheme="green" onClick={sendMessage} mt={3}>
                    <ArrowRightIcon />
                  </Button>
                )}
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          h={"100%"}
        >
          <Text fontSize={"3xl"} pb={3} fontFamily={"Work sans"}>
            Click on user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
